/**
 * lib/downloader.ts
 *
 * Downloads videos from Telegram file servers using the Bot API getFile endpoint.
 * The user forwards a video (e.g. from \@Instagram_reels_dl_bot) to our bot,
 * and we download it directly from Telegram's CDN.
 *
 * ---
 * HOW TO SWAP THE DOWNLOADER:
 * Replace the body of `downloadFromTelegramFileId()` with any other mechanism
 * (e.g. yt-dlp, a third-party API, gallery-dl).
 * The webhook handler only calls `downloadFromTelegramFileId(fileId)` — nothing
 * else in the codebase needs to change.
 */

import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

/**
 * Downloads a video from Telegram's file servers given a Telegram file_id.
 *
 * Steps:
 *  1. Calls getFile to resolve the file_id → a temporary file path on Telegram's CDN
 *  2. Fetches the binary from https://api.telegram.org/file/bot<TOKEN>/<path>
 *  3. Saves it to /tmp/<uuid>.<ext> and returns the local path
 *
 * @param fileId - Telegram file_id from message.video.file_id or message.document.file_id
 * @returns Absolute path to the downloaded file in /tmp
 * @throws Descriptive error if the Telegram API call or download fails
 */
export async function downloadFromTelegramFileId(fileId: string): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable.");

  // Step 1: resolve file_id → CDN path
  const infoRes = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`
  );
  const info = (await infoRes.json()) as { ok: boolean; result?: { file_path: string }; description?: string };

  if (!info.ok || !info.result?.file_path) {
    throw new Error(
      `Telegram getFile failed for file_id ${fileId}: ${
        info.description ?? JSON.stringify(info)
      }`
    );
  }

  const cdnPath = info.result.file_path;
  const ext = path.extname(cdnPath) || ".mp4";
  const localPath = path.join("/tmp", `${randomUUID()}${ext}`);

  // Step 2: download the binary
  const fileRes = await fetch(
    `https://api.telegram.org/file/bot${token}/${cdnPath}`
  );

  if (!fileRes.ok) {
    throw new Error(
      `Failed to download file from Telegram CDN (HTTP ${fileRes.status}): ${cdnPath}`
    );
  }

  const buffer = Buffer.from(await fileRes.arrayBuffer());
  fs.writeFileSync(localPath, buffer);

  return localPath;
}
