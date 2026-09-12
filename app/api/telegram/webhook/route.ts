/**
 * app/api/telegram/webhook/route.ts
 *
 * Next.js App Router API route — receives Telegram webhook updates.
 *
 * Conversation state machine:
 *
 *   [idle]
 *     │  user sends Instagram URL
 *     ▼
 *   Save reel_url, state = waiting_for_video
 *   Bot: "Now forward the video from @Instagram_reels_dl_bot"
 *     │
 *     │  user forwards the downloaded video
 *     ▼
 *   Download from Telegram CDN → upload to Supabase Storage
 *   State = waiting_for_tg_caption
 *   Bot: "Send the caption for Telegram"
 *     │
 *     │  user sends Telegram caption
 *     ▼
 *   Save tg_caption, state = waiting_for_ig_caption
 *   Bot: "Send the caption for Instagram"
 *     │
 *     │  user sends Instagram caption
 *     ▼
 *   Publish to 4 targets: Telegram, Instagram Reel, Instagram Story, Facebook Page
 *   Report per-platform results → delete video from storage → clear session
 */

import { NextRequest, NextResponse } from "next/server";
import { downloadFromTelegramFileId } from "@/lib/downloader";
import { uploadVideo, deleteVideo } from "@/lib/storage";
import {
  publishReelToInstagram,
  publishStoryToInstagram,
} from "@/lib/instagram";
import { publishToFacebook } from "@/lib/facebook";
import {
  sendMessage as tgSendMessage,
  sendVideo as tgSendVideo,
} from "@/lib/telegram";
import { getSession, setSession, clearSession } from "@/lib/session";
import fs from "fs";

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

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
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

/** Extracts the best available video file_id from a message (video or video document). */
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

// ─── State handlers ───────────────────────────────────────────────────────────

/**
 * Idle state: user sent an Instagram URL.
 * Save the URL in session and ask them to forward the downloaded video.
 */
async function handleUrl(chatId: number, reelUrl: string): Promise<void> {
  await setSession(chatId, {
    state: "waiting_for_video",
    reel_url: reelUrl.trim(),
    video_public_url: "",
    tg_caption: "",
  });

  await tgSendMessage(
    chatId,
    `✅ Got the URL\\!\n\nNow:\n1\\. Send that URL to @Instagram\\_reels\\_dl\\_bot\n2\\. Forward the video it sends back *here*`
  );
}

/**
 * waiting_for_video state: user forwarded the downloaded video.
 * Download it from Telegram CDN, upload to Supabase, ask for Telegram caption.
 */
async function handleVideo(
  chatId: number,
  fileId: string,
  reelUrl: string
): Promise<void> {
  await tgSendMessage(chatId, "⬇️ Downloading video from Telegram…");

  let localPath: string | null = null;
  try {
    localPath = await downloadFromTelegramFileId(fileId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await tgSendMessage(chatId, `❌ *Download failed*\n\`${msg}\``);
    return;
  }

  await tgSendMessage(chatId, "☁️ Uploading to storage…");

  let publicUrl: string;
  try {
    publicUrl = await uploadVideo(localPath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await tgSendMessage(chatId, `❌ *Upload failed*\n\`${msg}\``);
    return;
  } finally {
    if (localPath) deleteTempFile(localPath);
  }

  try {
    await setSession(chatId, {
      state: "waiting_for_tg_caption",
      reel_url: reelUrl,
      video_public_url: publicUrl,
      tg_caption: "",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await tgSendMessage(chatId, `❌ *Session save failed*\n\`${msg}\``);
    await deleteVideo(publicUrl);
    return;
  }

  await tgSendMessage(
    chatId,
    "✅ Video ready\\!\n\nSend the caption for *Telegram*:"
  );
}

/**
 * Publishes the video across all 4 platforms independently:
 * 1. Telegram
 * 2. Instagram Reel
 * 3. Instagram Story
 * 4. Facebook Page
 *
 * One failure does not block the other platforms.
 * Results are summarized in a per-platform report.
 */
async function handlePublish(
  chatId: number,
  videoPublicUrl: string,
  tgCaption: string,
  igCaption: string
): Promise<void> {
  await tgSendMessage(
    chatId,
    "🚀 *Publishing across platforms…*\n• Telegram\n• Instagram Reel\n• Instagram Story\n• Facebook Page"
  );

  // Run Telegram, Facebook Page, and Instagram flow concurrently.
  // Reel and Story run sequentially within the Instagram flow to prevent
  // Meta container conflict on the same account.
  const [tgResult, fbResult, igResults] = await Promise.allSettled([
    tgSendVideo(chatId, videoPublicUrl, tgCaption),
    publishToFacebook(videoPublicUrl, igCaption),
    (async () => {
      const reelRes = await Promise.allSettled([
        publishReelToInstagram(videoPublicUrl, igCaption),
      ]).then((r) => r[0]);

      const storyRes = await Promise.allSettled([
        publishStoryToInstagram(videoPublicUrl, igCaption),
      ]).then((r) => r[0]);

      return { reelRes, storyRes };
    })(),
  ]);

  const reelResult =
    igResults.status === "fulfilled"
      ? igResults.value.reelRes
      : (igResults as PromiseRejectedResult);

  const storyResult =
    igResults.status === "fulfilled"
      ? igResults.value.storyRes
      : (igResults as PromiseRejectedResult);

  // Build per-platform status list
  const lines: string[] = ["📊 *Publishing Results:*\n"];

  // 1. Telegram
  if (tgResult.status === "fulfilled") {
    lines.push("✅ *Telegram*: Video posted");
  } else {
    const msg =
      tgResult.reason instanceof Error
        ? tgResult.reason.message
        : String(tgResult.reason);
    lines.push(`❌ *Telegram*: Failed\n\`${msg}\``);
  }

  // 2. Instagram Reel
  if (reelResult.status === "fulfilled") {
    lines.push(
      `✅ *Instagram Reel*: Published \\(ID: \`${reelResult.value}\`\\)`
    );
  } else {
    const msg =
      reelResult.reason instanceof Error
        ? reelResult.reason.message
        : String(reelResult.reason);
    lines.push(`❌ *Instagram Reel*: Failed\n\`${msg}\``);
  }

  // 3. Instagram Story
  if (storyResult.status === "fulfilled") {
    lines.push(
      `✅ *Instagram Story*: Published \\(ID: \`${storyResult.value}\`\\)`
    );
  } else {
    const msg =
      storyResult.reason instanceof Error
        ? storyResult.reason.message
        : String(storyResult.reason);
    lines.push(`❌ *Instagram Story*: Failed\n\`${msg}\``);
  }

  // 4. Facebook Page
  if (fbResult.status === "fulfilled") {
    lines.push(
      `✅ *Facebook Page*: Published \\(ID: \`${fbResult.value}\`\\)`
    );
  } else {
    const msg =
      fbResult.reason instanceof Error
        ? fbResult.reason.message
        : String(fbResult.reason);
    lines.push(`❌ *Facebook Page*: Failed\n\`${msg}\``);
  }

  await tgSendMessage(chatId, lines.join("\n\n"));

  // Clear session regardless of outcome
  try {
    await clearSession(chatId);
  } catch (err) {
    console.warn("[webhook] Failed to clear session:", err);
  }

  // Clean up video from Supabase Storage once all platforms have fetched it
  await deleteVideo(videoPublicUrl);
}

// ─── Main webhook handler ──────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const senderId = message.from?.id;
  const chatId = message.chat.id;

  // ── Security: only respond to the allowed user ───────────────────────────────
  let allowedUserId: number;
  try {
    allowedUserId = getAllowedUserId();
  } catch (err) {
    console.error("[webhook] Configuration error:", err);
    return NextResponse.json({ ok: true });
  }

  if (senderId !== allowedUserId) {
    return NextResponse.json({ ok: true }); // silently ignore
  }

  try {
    const session = await getSession(chatId);
    const videoFileId = getVideoFileId(message);
    const text = message.text?.trim() ?? "";

    // ── Global Cancel ──────────────────────────────────────────────────────────
    if (text === "/cancel") {
      if (session?.video_public_url) {
        await deleteVideo(session.video_public_url);
      }
      await clearSession(chatId);
      await tgSendMessage(
        chatId,
        "🔄 Cancelled\\. Send a new Instagram Reel URL to start\\."
      );
      return NextResponse.json({ ok: true });
    }

    // ── Route by state ─────────────────────────────────────────────────────────

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
        "✅ Telegram caption saved\\!\n\nNow send the caption for *Instagram* \\(used for Reel, Story & Facebook Page\\):"
      );
      return NextResponse.json({ ok: true });
    }

    if (session?.state === "waiting_for_ig_caption") {
      if (!text) {
        await tgSendMessage(chatId, "✍️ Please send a text caption for *Instagram*\\.");
        return NextResponse.json({ ok: true });
      }

      await handlePublish(
        chatId,
        session.video_public_url,
        session.tg_caption || "",
        text
      );
      return NextResponse.json({ ok: true });
    }

    if (session?.state === "waiting_for_video") {
      if (videoFileId) {
        await handleVideo(chatId, videoFileId, session.reel_url);
      } else if (text) {
        // User sent text while we're waiting for the video — gentle reminder
        await tgSendMessage(
          chatId,
          `⏳ I'm waiting for the *video file*\\.\n\n1\\. Send your URL to @Instagram\\_reels\\_dl\\_bot\n2\\. Forward the video it sends back here\n\nOr send /cancel to start over\\.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // Idle state
    if (videoFileId) {
      // User sent a video directly without a URL — that's fine, use empty reel_url
      await handleVideo(chatId, videoFileId, "");
    } else if (isInstagramReelUrl(text)) {
      await handleUrl(chatId, text);
    } else {
      await tgSendMessage(
        chatId,
        "👋 Send me an Instagram Reel URL to get started\\.\n\nExample:\n`https://www.instagram.com/reels/ABC123/`"
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] Unhandled error:", err);
    try {
      await tgSendMessage(chatId, `🔥 *Unexpected error*\n\`${msg}\`\n\nPlease try again\\.`);
    } catch { /* nothing we can do */ }
  }

  return NextResponse.json({ ok: true });
}
