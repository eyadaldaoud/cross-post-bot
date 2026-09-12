/**
 * lib/telegram.ts
 *
 * Minimal Telegram Bot API helpers using raw fetch calls.
 * Avoids node-telegram-bot-api's polling-centric API which is
 * awkward in a webhook/serverless setup.
 */

/** Telegram's hard cap for video/photo captions. */
const MAX_CAPTION_LENGTH = 1024;

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable.");
  }
  return token;
}

/**
 * Gets the configured Telegram Channel ID for publishing.
 * Supports numeric IDs (e.g. -1001234567890) and @username strings.
 */
export function getTelegramChannelId(): string | number {
  const raw = process.env.TELEGRAM_CHANNEL_ID?.trim();
  if (!raw) {
    throw new Error("Missing TELEGRAM_CHANNEL_ID environment variable.");
  }
  return raw;
}

function apiUrl(method: string): string {
  return `https://api.telegram.org/bot${getBotToken()}/${method}`;
}

async function callApi<T = unknown>(
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  const res = await fetch(apiUrl(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { ok: boolean; result: T; description?: string };

  if (!json.ok) {
    throw new Error(
      `Telegram API error [${method}]: ${json.description ?? JSON.stringify(json)}`
    );
  }

  return json.result;
}

/**
 * Sends a plain text message to a chat or channel.
 *
 * @param chatId    - Telegram chat ID or channel username/ID
 * @param text      - Message text
 * @param parseMode - Formatting parse mode (defaults to Markdown)
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  parseMode: "Markdown" | "HTML" | null = "Markdown"
): Promise<void> {
  await callApi("sendMessage", {
    chat_id: chatId,
    text,
    ...(parseMode ? { parse_mode: parseMode } : {}),
  });
}

/**
 * Sends a video to a chat or channel using a public URL, handling Telegram's
 * 1024-char caption limit automatically.
 *
 * - If the caption fits (≤ 1024 chars): sends the video with caption attached.
 * - If the caption exceeds 1024 chars: sends the video with NO caption, then
 *   immediately sends the full caption text as a separate message in the same chat/channel.
 *
 * Captions are sent without parse_mode to prevent syntax errors on user-entered text.
 *
 * @param chatId    - Telegram chat ID or channel username/ID
 * @param videoUrl  - Publicly accessible video URL
 * @param caption   - Caption text (any length — handled safely)
 */
export async function sendVideo(
  chatId: number | string,
  videoUrl: string,
  caption: string
): Promise<void> {
  const captionFits = caption.length <= MAX_CAPTION_LENGTH;

  await callApi("sendVideo", {
    chat_id: chatId,
    video: videoUrl,
    ...(captionFits && caption ? { caption } : {}),
    supports_streaming: true,
  });

  // If caption was too long for the video message, send it as a follow-up text (plain text)
  if (!captionFits && caption) {
    await sendMessage(chatId, caption, null);
  }
}

/**
 * Sets the webhook URL for this bot.
 * Convenience helper — call this once via a one-off script or
 * a dedicated API route (not needed in normal bot operation).
 *
 * @param webhookUrl - Full HTTPS URL Telegram should POST updates to
 */
export async function setWebhook(webhookUrl: string): Promise<void> {
  await callApi("setWebhook", { url: webhookUrl });
  console.log(`[telegram] Webhook set to: ${webhookUrl}`);
}
