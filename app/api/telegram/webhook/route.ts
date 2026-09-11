/**
 * app/api/telegram/webhook/route.ts
 *
 * Next.js App Router API route — receives Telegram webhook updates.
 * Telegram calls this URL via POST for every incoming message.
 *
 * Conversation state machine:
 *   idle                 → user sends Instagram URL → download + upload → ask for caption
 *   waiting_for_caption  → user sends caption → publish to IG + Telegram in parallel
 */

import { NextRequest, NextResponse } from "next/server";
import { downloadReel } from "@/lib/downloader";
import { uploadVideo, deleteVideo } from "@/lib/storage";
import { publishToInstagram } from "@/lib/instagram";
import {
  sendMessage as tgSendMessage,
  sendVideo as tgSendVideo,
} from "@/lib/telegram";
import { getSession, setSession, clearSession } from "@/lib/session";
import fs from "fs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TelegramMessage {
  message_id: number;
  from?: { id: number; username?: string };
  chat: { id: number };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAllowedUserId(): number {
  const raw = process.env.TELEGRAM_ALLOWED_USER_ID;
  if (!raw) {
    throw new Error("Missing TELEGRAM_ALLOWED_USER_ID environment variable.");
  }
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    throw new Error(`TELEGRAM_ALLOWED_USER_ID is not a valid integer: "${raw}"`);
  }
  return id;
}

function isInstagramReelUrl(text: string): boolean {
  return /https?:\/\/(www\.)?instagram\.com\/(reels?|p)\/[A-Za-z0-9_\-]+/.test(
    text.trim()
  );
}

function deleteTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`[webhook] Failed to delete temp file ${filePath}:`, err);
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * Handles the "idle" state: user sent an Instagram URL.
 * Downloads the video, uploads to Supabase, saves session, asks for caption.
 */
async function handleReelUrl(chatId: number, text: string): Promise<void> {
  await tgSendMessage(chatId, "⏬ Downloading reel…");

  let localPath: string | null = null;
  try {
    localPath = await downloadReel(text.trim());
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
      state: "waiting_for_caption",
      reel_url: text.trim(),
      video_public_url: publicUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await tgSendMessage(chatId, `❌ *Session save failed*\n\`${msg}\``);
    // Best-effort cleanup
    await deleteVideo(publicUrl);
    return;
  }

  await tgSendMessage(
    chatId,
    "✅ Video ready\\! Now send me the *caption* for this post:"
  );
}

/**
 * Handles the "waiting_for_caption" state: user sent a caption.
 * Publishes to Instagram and Telegram in parallel, reports results independently.
 */
async function handleCaption(
  chatId: number,
  caption: string,
  videoPublicUrl: string,
  reelUrl: string
): Promise<void> {
  await tgSendMessage(chatId, "🚀 Publishing to both platforms…");

  // Run both in parallel — neither failure blocks the other
  const [igResult, tgResult] = await Promise.allSettled([
    publishToInstagram(videoPublicUrl, caption),
    tgSendVideo(chatId, videoPublicUrl, caption),
  ]);

  // Report Instagram result
  if (igResult.status === "fulfilled") {
    await tgSendMessage(
      chatId,
      `✅ *Instagram*: Published successfully \\(ID: \`${igResult.value}\`\\)`
    );
  } else {
    const msg =
      igResult.reason instanceof Error
        ? igResult.reason.message
        : String(igResult.reason);
    await tgSendMessage(chatId, `❌ *Instagram failed*\n\`${msg}\``);
  }

  // Report Telegram result
  if (tgResult.status === "fulfilled") {
    await tgSendMessage(chatId, "✅ *Telegram*: Video posted successfully");
  } else {
    const msg =
      tgResult.reason instanceof Error
        ? tgResult.reason.message
        : String(tgResult.reason);
    await tgSendMessage(chatId, `❌ *Telegram video send failed*\n\`${msg}\``);
  }

  // Clear session regardless of outcome
  try {
    await clearSession(chatId);
  } catch (err) {
    console.warn("[webhook] Failed to clear session:", err);
  }

  // Clean up Supabase Storage — only if IG publish succeeded (avoids losing the
  // video if you need to retry). Adjust this policy to taste.
  if (igResult.status === "fulfilled") {
    await deleteVideo(videoPublicUrl);
  } else {
    await tgSendMessage(
      chatId,
      `ℹ️ Video kept in storage for retry: ${videoPublicUrl}\n\nSend the reel URL again to restart the flow.`
    );
  }

  void reelUrl; // referenced to satisfy TS — available for future logging
}

// ─── Main webhook handler ──────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let update: TelegramUpdate;

  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    // Telegram expects 200 OK even for malformed requests, or it will retry
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message || !message.text) {
    return NextResponse.json({ ok: true });
  }

  const senderId = message.from?.id;
  const chatId = message.chat.id;
  const text = message.text.trim();

  // ── Security: only respond to the allowed user ──────────────────────────────
  let allowedUserId: number;
  try {
    allowedUserId = getAllowedUserId();
  } catch (err) {
    console.error("[webhook] Configuration error:", err);
    return NextResponse.json({ ok: true });
  }

  if (senderId !== allowedUserId) {
    // Silently ignore — don't reveal the bot exists to strangers
    return NextResponse.json({ ok: true });
  }

  // ── Route by conversation state ──────────────────────────────────────────────
  try {
    const session = await getSession(chatId);

    if (session?.state === "waiting_for_caption") {
      // Any text while waiting for caption is treated as the caption
      await handleCaption(
        chatId,
        text,
        session.video_public_url,
        session.reel_url
      );
    } else if (isInstagramReelUrl(text)) {
      await handleReelUrl(chatId, text);
    } else {
      await tgSendMessage(
        chatId,
        "👋 Send me an Instagram Reel URL to get started.\n\nExample:\n`https://www.instagram.com/reels/ABC123/`"
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] Unhandled error:", err);
    // Best-effort — if this also throws, Telegram will retry the webhook
    try {
      await tgSendMessage(
        chatId,
        `🔥 *Unexpected error*\n\`${msg}\`\n\nPlease try again.`
      );
    } catch {
      // Nothing we can do
    }
  }

  // Always return 200 so Telegram doesn't retry
  return NextResponse.json({ ok: true });
}
