/**
 * app/api/telegram/webhook/route.ts
 *
 * Next.js App Router API route — receives Telegram webhook updates.
 *
 * Enhanced features:
 * - In-place message edits with visual ASCII progress bars
 * - Live Instagram container polling progress
 * - Inline keyboard menu with options (single caption vs separate captions, status check, cancel)
 * - 3-layer deduplication (in-memory update_id cache, database state locks, Next.js after())
 */

import { NextRequest, NextResponse, after } from "next/server";
import { downloadFromTelegramFileId } from "@/lib/downloader";
import { uploadVideo, deleteVideo } from "@/lib/storage";
import { publishReelToInstagram } from "@/lib/instagram";
import { publishToFacebook } from "@/lib/facebook";
import {
  sendMessage as tgSendMessage,
  sendVideo as tgSendVideo,
  editMessageText as tgEditMessageText,
  answerCallbackQuery as tgAnswerCallbackQuery,
  renderProgressBar,
  getTelegramChannelId,
} from "@/lib/telegram";
import { getSession, setSession, clearSession } from "@/lib/session";
import fs from "fs";

// ─── Deduplication ────────────────────────────────────────────────────────────

const processedUpdateIds = new Set<number>();

// ─── Types ────────────────────────────────────────────────────────────────────

interface TelegramVideo {
  file_id: string;
  file_unique_id: string;
  duration?: number;
  width?: number;
  height?: number;
  file_size?: number;
  mime_type?: string;
}

interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramMessage {
  message_id: number;
  from?: { id: number; username?: string };
  chat: { id: number };
  text?: string;
  video?: TelegramVideo;
  document?: TelegramDocument;
  forward_from?: { id: number };
  forward_from_chat?: { id: number };
}

interface TelegramCallbackQuery {
  id: string;
  from: { id: number; username?: string };
  message?: TelegramMessage;
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllowedUserId(): number {
  const raw = process.env.TELEGRAM_ALLOWED_USER_ID;
  if (!raw) throw new Error("Missing TELEGRAM_ALLOWED_USER_ID environment variable.");
  const id = parseInt(raw, 10);
  if (isNaN(id)) throw new Error(`TELEGRAM_ALLOWED_USER_ID is not a valid integer: "${raw}"`);
  return id;
}

function isInstagramReelUrl(text: string): boolean {
  return /https?:\/\/(www\.)?instagram\.com\/(reels?|p)\/[A-Za-z0-9_\-]+/.test(text.trim());
}

function getVideoFileId(message: TelegramMessage): string | null {
  if (message.video) return message.video.file_id;
  if (
    message.document &&
    (message.document.mime_type?.startsWith("video/") ||
      message.document.file_name?.match(/\.(mp4|mov|avi|mkv|webm)$/i))
  ) {
    return message.document.file_id;
  }
  return null;
}

function deleteTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn(`[webhook] Failed to delete temp file ${filePath}:`, err);
  }
}

// ─── Menus & Keyboards ────────────────────────────────────────────────────────

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📊 Check System Status", callback_data: "menu_status" },
        { text: "📖 How to Use", callback_data: "menu_help" },
      ],
      [{ text: "🔄 Reset / Cancel", callback_data: "menu_reset" }],
    ],
  };
}

function getCaptionModeKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🔗 Same Caption for All (1 Step)", callback_data: "cap_same" }],
      [{ text: "✏️ Separate Captions (TG & IG)", callback_data: "cap_separate" }],
      [{ text: "❌ Cancel", callback_data: "menu_reset" }],
    ],
  };
}

// ─── State Handlers ───────────────────────────────────────────────────────────

/** Sends the main interactive dashboard card in DM */
async function sendMainMenu(chatId: number): Promise<void> {
  const channel = process.env.TELEGRAM_CHANNEL_ID || "Not configured";
  const igConfigured = !!(process.env.IG_ACCESS_TOKEN && process.env.IG_BUSINESS_ACCOUNT_ID);
  const fbConfigured = !!(process.env.FB_PAGE_ACCESS_TOKEN && process.env.FB_PAGE_ID);

  const text =
    `⚡ *CrossPost Bot Dashboard*\n\n` +
    `*Publish Targets:*\n` +
    `• ✈️ *Telegram Channel:* \`${channel}\`\n` +
    `• 📸 *Instagram Reels:* ${igConfigured ? "🟢 Ready" : "🔴 Missing Config"}\n` +
    `• 📘 *Facebook Page:* ${fbConfigured ? "🟢 Ready" : "🔴 Missing Config"}\n\n` +
    `_Send me an Instagram Reel URL or forward a video directly to begin!_`;

  await tgSendMessage(chatId, text, "Markdown", getMainMenuKeyboard());
}

/** Idle state: user sent an Instagram URL */
async function handleUrl(chatId: number, reelUrl: string): Promise<void> {
  await setSession(chatId, {
    state: "waiting_for_video",
    reel_url: reelUrl.trim(),
    video_public_url: "",
    tg_caption: "",
  });

  const text =
    `🔗 *URL Received!*\n\`${reelUrl.trim()}\`\n\n` +
    `*Next Steps:*\n` +
    `1️⃣ Send this link to @Instagram\\_reels\\_dl\\_bot\n` +
    `2️⃣ Forward the MP4 video back *here*\n\n` +
    `_Or send /cancel anytime to reset._`;

  await tgSendMessage(chatId, text, "Markdown");
}

/** Handles downloading video from Telegram and uploading to Supabase with live visual progress */
async function handleVideo(
  chatId: number,
  fileId: string,
  reelUrl: string
): Promise<void> {
  const progressMsgId = await tgSendMessage(
    chatId,
    `⬇️ *Downloading from Telegram CDN...*\n${renderProgressBar(0.25)}`
  );

  let localPath: string | null = null;
  try {
    localPath = await downloadFromTelegramFileId(fileId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await tgEditMessageText(chatId, progressMsgId, `❌ *Download failed*\n\`${msg}\``);
    await clearSession(chatId);
    return;
  }

  await tgEditMessageText(
    chatId,
    progressMsgId,
    `☁️ *Uploading to Cloud Storage...*\n${renderProgressBar(0.7)}`
  );

  let publicUrl: string;
  try {
    publicUrl = await uploadVideo(localPath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await tgEditMessageText(chatId, progressMsgId, `❌ *Upload failed*\n\`${msg}\``);
    await clearSession(chatId);
    return;
  } finally {
    if (localPath) deleteTempFile(localPath);
  }

  try {
    await setSession(chatId, {
      state: "choose_caption_mode",
      reel_url: reelUrl,
      video_public_url: publicUrl,
      tg_caption: "",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await tgEditMessageText(chatId, progressMsgId, `❌ *Session save failed*\n\`${msg}\``);
    await deleteVideo(publicUrl);
    await clearSession(chatId);
    return;
  }

  // Edit in-place into completion & menu choice
  await tgEditMessageText(
    chatId,
    progressMsgId,
    `✅ *Video Staged Successfully!*\n${renderProgressBar(1.0)}\n\n` +
      `*How would you like to set your captions?*`,
    "Markdown",
    getCaptionModeKeyboard()
  );
}

/** Publishes across all 3 platforms with live in-place updating progress */
async function handlePublish(
  chatId: number,
  videoPublicUrl: string,
  tgCaption: string,
  igCaption: string
): Promise<void> {
  let igStatusText = "⏳ Creating container...";
  let tgStatusText = "⏳ Sending video to channel...";
  let fbStatusText = "⏳ Sending video to Facebook...";

  const statusMsgId = await tgSendMessage(
    chatId,
    `🚀 *Publishing in Progress...*\n\n` +
      `• ✈️ *Telegram Channel:* ${tgStatusText}\n` +
      `• 📸 *Instagram Reel:* ${igStatusText}\n` +
      `• 📘 *Facebook Page:* ${fbStatusText}`
  );

  const updateCard = async () => {
    const card =
      `🚀 *Publishing in Progress...*\n\n` +
      `• ✈️ *Telegram Channel:* ${tgStatusText}\n` +
      `• 📸 *Instagram Reel:* ${igStatusText}\n` +
      `• 📘 *Facebook Page:* ${fbStatusText}`;
    await tgEditMessageText(chatId, statusMsgId, card);
  };

  const [tgResult, reelResult, fbResult] = await Promise.allSettled([
    // 1. Telegram
    (async () => {
      const channelId = getTelegramChannelId();
      await tgSendVideo(channelId, videoPublicUrl, tgCaption);
      tgStatusText = "✅ Posted";
      await updateCard();
    })(),

    // 2. Instagram Reel with live polling progress
    (async () => {
      const mediaId = await publishReelToInstagram(
        videoPublicUrl,
        igCaption,
        async (attempt, max) => {
          const ratio = attempt / max;
          igStatusText = `⏳ Polling container (attempt ${attempt}/${max}) ${renderProgressBar(ratio, 6)}`;
          await updateCard();
        }
      );
      igStatusText = `✅ Published (ID: \`${mediaId}\`)`;
      await updateCard();
      return mediaId;
    })(),

    // 3. Facebook Page
    (async () => {
      const fbId = await publishToFacebook(videoPublicUrl, igCaption);
      fbStatusText = `✅ Published (ID: \`${fbId}\`)`;
      await updateCard();
      return fbId;
    })(),
  ]);

  // Build final summary card
  const isAllSuccess =
    tgResult.status === "fulfilled" &&
    reelResult.status === "fulfilled" &&
    fbResult.status === "fulfilled";

  const lines: string[] = [
    isAllSuccess ? `✨ *ALL POSTS PUBLISHED SUCCESSFULLY!* ✨\n` : `⚠️ *Publishing Completed (with issues):*\n`,
  ];

  if (tgResult.status === "fulfilled") {
    lines.push(`✅ *Telegram Channel:* Video posted`);
  } else {
    const msg = tgResult.reason instanceof Error ? tgResult.reason.message : String(tgResult.reason);
    lines.push(`❌ *Telegram Channel:* Failed\n\`${msg}\``);
  }

  if (reelResult.status === "fulfilled") {
    lines.push(`✅ *Instagram Reel:* Published \\(ID: \`${reelResult.value}\`\\)`);
  } else {
    const msg = reelResult.reason instanceof Error ? reelResult.reason.message : String(reelResult.reason);
    lines.push(`❌ *Instagram Reel:* Failed\n\`${msg}\``);
  }

  if (fbResult.status === "fulfilled") {
    lines.push(`✅ *Facebook Page:* Published \\(ID: \`${fbResult.value}\`\\)`);
  } else {
    const msg = fbResult.reason instanceof Error ? fbResult.reason.message : String(fbResult.reason);
    lines.push(`❌ *Facebook Page:* Failed\n\`${msg}\``);
  }

  lines.push(`\n🧹 _Cleaned up temporary storage file & session._`);

  await tgEditMessageText(chatId, statusMsgId, lines.join("\n\n"));

  try {
    await clearSession(chatId);
  } catch (err) {
    console.warn("[webhook] Failed to clear session:", err);
  }

  await deleteVideo(videoPublicUrl);
}

// ─── Main Webhook Route ───────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Deduplication: drop duplicate Telegram update IDs
  if (update.update_id) {
    if (processedUpdateIds.has(update.update_id)) {
      console.log(`[webhook] Duplicate update_id ${update.update_id} received — ignoring.`);
      return NextResponse.json({ ok: true });
    }
    processedUpdateIds.add(update.update_id);
    if (processedUpdateIds.size > 1000) {
      const oldest = Array.from(processedUpdateIds).slice(0, 500);
      for (const id of oldest) processedUpdateIds.delete(id);
    }
  }

  // ── Handle Inline Keyboard Callback Queries ─────────────────────────────────
  if (update.callback_query) {
    const query = update.callback_query;
    const senderId = query.from?.id;
    const chatId = query.message?.chat.id;

    if (!chatId || senderId !== getAllowedUserId()) {
      return NextResponse.json({ ok: true });
    }

    await tgAnswerCallbackQuery(query.id);

    const session = await getSession(chatId);
    const data = query.data || "";

    if (data === "menu_reset" || data === "cancel_flow") {
      if (session?.video_public_url) {
        await deleteVideo(session.video_public_url);
      }
      await clearSession(chatId);
      await tgSendMessage(chatId, "🔄 *Session reset!* Send a new link anytime.", "Markdown");
      return NextResponse.json({ ok: true });
    }

    if (data === "menu_status") {
      const channel = process.env.TELEGRAM_CHANNEL_ID || "Not set";
      const bucket = process.env.SUPABASE_BUCKET_NAME || "Not set";
      const igSet = !!process.env.IG_ACCESS_TOKEN;
      const fbSet = !!process.env.FB_PAGE_ACCESS_TOKEN;

      const report =
        `📊 *System Health & Environment*\n\n` +
        `• *Telegram Channel:* \`${channel}\`\n` +
        `• *Storage Bucket:* \`${bucket}\`\n` +
        `• *Instagram API:* ${igSet ? "🟢 Configured" : "🔴 Missing Token"}\n` +
        `• *Facebook Page API:* ${fbSet ? "🟢 Configured" : "🔴 Missing Token"}\n\n` +
        `Current State: \`${session?.state || "idle"}\``;

      await tgSendMessage(chatId, report, "Markdown");
      return NextResponse.json({ ok: true });
    }

    if (data === "menu_help") {
      const helpText =
        `📖 *How to Use CrossPost Bot:*\n\n` +
        `1️⃣ *Send Reel link* (e.g. \`https://www.instagram.com/reels/...\`)\n` +
        `2️⃣ *Forward video* from @Instagram\\_reels\\_dl\\_bot\n` +
        `3️⃣ *Choose caption mode* (same caption or separate)\n` +
        `4️⃣ *Watch live progress* as it posts to Telegram, IG Reels & Facebook!`;

      await tgSendMessage(chatId, helpText, "Markdown");
      return NextResponse.json({ ok: true });
    }

    if (data === "cap_same" && session?.state === "choose_caption_mode") {
      await setSession(chatId, {
        ...session,
        state: "waiting_for_single_caption",
      });
      await tgSendMessage(
        chatId,
        `✍️ *Send ONE caption below:*\nIt will be applied to Telegram, Instagram Reel, and Facebook Page:`,
        "Markdown"
      );
      return NextResponse.json({ ok: true });
    }

    if (data === "cap_separate" && session?.state === "choose_caption_mode") {
      await setSession(chatId, {
        ...session,
        state: "waiting_for_tg_caption",
      });
      await tgSendMessage(
        chatId,
        `✍️ *Step 1/2:* Send the caption for *Telegram Channel*:`,
        "Markdown"
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  }

  // ── Handle Regular Chat Messages ─────────────────────────────────────────────
  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const senderId = message.from?.id;
  const chatId = message.chat.id;

  let allowedUserId: number;
  try {
    allowedUserId = getAllowedUserId();
  } catch (err) {
    console.error("[webhook] Configuration error:", err);
    return NextResponse.json({ ok: true });
  }

  if (senderId !== allowedUserId) {
    return NextResponse.json({ ok: true }); // Silently ignore unauthorized users
  }

  try {
    const session = await getSession(chatId);
    const videoFileId = getVideoFileId(message);
    const text = message.text?.trim() ?? "";

    // Global Cancel
    if (text === "/cancel") {
      if (session?.video_public_url) {
        await deleteVideo(session.video_public_url);
      }
      await clearSession(chatId);
      await tgSendMessage(chatId, "🔄 Cancelled\\. Send a new Instagram Reel URL to start\\.");
      return NextResponse.json({ ok: true });
    }

    // Active locks against duplicate webhooks
    if (session?.state === "publishing") {
      console.log(`[webhook] Publishing currently in progress for chat ${chatId} — ignoring duplicate`);
      return NextResponse.json({ ok: true });
    }

    if (session?.state === "processing_video") {
      console.log(`[webhook] Video processing in progress for chat ${chatId} — ignoring duplicate`);
      return NextResponse.json({ ok: true });
    }

    // Single caption mode: user enters 1 caption used for all 3 targets
    if (session?.state === "waiting_for_single_caption") {
      if (!text) {
        await tgSendMessage(chatId, "✍️ Please send a text caption for the post.");
        return NextResponse.json({ ok: true });
      }

      await setSession(chatId, {
        state: "publishing",
        reel_url: session.reel_url,
        video_public_url: session.video_public_url,
        tg_caption: text,
      });

      const videoUrl = session.video_public_url;
      after(async () => {
        try {
          await handlePublish(chatId, videoUrl, text, text);
        } catch (err) {
          console.error("[webhook] Background handlePublish error:", err);
        }
      });
      return NextResponse.json({ ok: true });
    }

    // Option menu fallback: if user types text while buttons are shown, treat as single caption
    if (session?.state === "choose_caption_mode") {
      if (text) {
        await setSession(chatId, {
          state: "publishing",
          reel_url: session.reel_url,
          video_public_url: session.video_public_url,
          tg_caption: text,
        });

        const videoUrl = session.video_public_url;
        after(async () => {
          try {
            await handlePublish(chatId, videoUrl, text, text);
          } catch (err) {
            console.error("[webhook] Background handlePublish error:", err);
          }
        });
        return NextResponse.json({ ok: true });
      }
    }

    // Separate captions: Step 1 Telegram
    if (session?.state === "waiting_for_tg_caption") {
      if (!text) {
        await tgSendMessage(chatId, "✍️ Please send a text caption for *Telegram*\\.");
        return NextResponse.json({ ok: true });
      }

      await setSession(chatId, {
        state: "waiting_for_ig_caption",
        reel_url: session.reel_url,
        video_public_url: session.video_public_url,
        tg_caption: text,
      });

      await tgSendMessage(
        chatId,
        "✅ *Telegram caption saved!*\n\n✍️ *Step 2/2:* Now send the caption for *Instagram & Facebook*:"
      );
      return NextResponse.json({ ok: true });
    }

    // Separate captions: Step 2 Instagram & Facebook
    if (session?.state === "waiting_for_ig_caption") {
      if (!text) {
        await tgSendMessage(chatId, "✍️ Please send a text caption for *Instagram*\\.");
        return NextResponse.json({ ok: true });
      }

      await setSession(chatId, {
        state: "publishing",
        reel_url: session.reel_url,
        video_public_url: session.video_public_url,
        tg_caption: session.tg_caption || "",
      });

      const videoUrl = session.video_public_url;
      const tgCap = session.tg_caption || "";
      const igCap = text;

      after(async () => {
        try {
          await handlePublish(chatId, videoUrl, tgCap, igCap);
        } catch (err) {
          console.error("[webhook] Background handlePublish error:", err);
        }
      });
      return NextResponse.json({ ok: true });
    }

    // Waiting for forwarded video
    if (session?.state === "waiting_for_video") {
      if (videoFileId) {
        await setSession(chatId, {
          state: "processing_video",
          reel_url: session.reel_url,
          video_public_url: "",
          tg_caption: "",
        });

        const rUrl = session.reel_url;
        after(async () => {
          try {
            await handleVideo(chatId, videoFileId, rUrl);
          } catch (err) {
            console.error("[webhook] Background handleVideo error:", err);
          }
        });
      } else if (text) {
        await tgSendMessage(
          chatId,
          `⏳ I'm waiting for the *video file*\\.\n\n1\\. Send your URL to @Instagram\\_reels\\_dl\\_bot\n2\\. Forward the video it sends back here\n\nOr send /cancel to start over\\.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Idle State
    if (videoFileId) {
      await setSession(chatId, {
        state: "processing_video",
        reel_url: "",
        video_public_url: "",
        tg_caption: "",
      });

      after(async () => {
        try {
          await handleVideo(chatId, videoFileId, "");
        } catch (err) {
          console.error("[webhook] Background handleVideo error:", err);
        }
      });
      return NextResponse.json({ ok: true });
    } else if (isInstagramReelUrl(text)) {
      await handleUrl(chatId, text);
    } else {
      await sendMainMenu(chatId);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] Unhandled error:", err);
    try {
      await tgSendMessage(chatId, `🔥 *Unexpected error*\n\`${msg}\`\n\nPlease try again\\.`);
    } catch { /* ignore */ }
  }

  return NextResponse.json({ ok: true });
}
