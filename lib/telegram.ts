/**
 * lib/telegram.ts
 *
 * Minimal Telegram Bot API helpers using raw fetch calls.
 * Avoids node-telegram-bot-api's polling-centric API which is
 * awkward in a webhook/serverless setup.
 */

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable.");
  }
  return token;
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
 * Sends a plain text message to a chat.
 *
 * @param chatId  - Telegram chat ID
 * @param text    - Message text (supports Markdown if parse_mode is set)
 */
export async function sendMessage(chatId: number, text: string): Promise<void> {
  await callApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  });
}

/**
 * Sends a video to a chat using a public URL.
 * Telegram fetches the video directly from the URL — no binary upload needed.
 *
 * @param chatId    - Telegram chat ID
 * @param videoUrl  - Publicly accessible video URL
 * @param caption   - Caption for the video
 */
export async function sendVideo(
  chatId: number,
  videoUrl: string,
  caption: string
): Promise<void> {
  await callApi("sendVideo", {
    chat_id: chatId,
    video: videoUrl,
    caption,
    supports_streaming: true,
  });
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
