/**
 * lib/downloader.ts
 *
 * Isolated video downloader module using yt-dlp as a subprocess.
 * Swap this file's implementation to change the download mechanism
 * without touching any other part of the codebase.
 */

import { spawn, execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

const execFileAsync = promisify(execFile);

/**
 * Verifies that yt-dlp is available on the system PATH.
 * Throws a descriptive error if not found.
 */
async function ensureYtDlp(): Promise<void> {
  try {
    await execFileAsync("which", ["yt-dlp"]);
  } catch {
    throw new Error(
      "yt-dlp is not installed or not on PATH. " +
        "Install it with: brew install yt-dlp  OR  pip install yt-dlp"
    );
  }
}

/**
 * Downloads an Instagram Reel (or any yt-dlp-supported URL) to a local temp file.
 *
 * @param url - The Instagram Reel URL to download
 * @returns Absolute path to the downloaded mp4 file
 * @throws Error with a descriptive message if yt-dlp is missing or download fails
 *
 * ---
 * HOW TO SWAP THE DOWNLOADER:
 * Replace the body of this function with any other download mechanism
 * (e.g. a third-party API, a different CLI tool, a direct fetch).
 * The rest of the codebase only depends on the function signature:
 *   downloadReel(url: string): Promise<string>
 */
export async function downloadReel(url: string): Promise<string> {
  await ensureYtDlp();

  const tmpDir = "/tmp";
  const uuid = randomUUID();
  // yt-dlp will replace %(ext)s with the actual extension
  const outputTemplate = path.join(tmpDir, `${uuid}.%(ext)s`);
  // The final path we expect after --merge-output-format mp4
  const expectedPath = path.join(tmpDir, `${uuid}.mp4`);

  return new Promise((resolve, reject) => {
    const args = [
      url,
      "-o",
      outputTemplate,
      "--merge-output-format",
      "mp4",
      "--no-playlist",
      "--quiet",
      "--no-warnings",
    ];

    const proc = spawn("yt-dlp", args);

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `yt-dlp exited with code ${code}. ` +
              (stderr ? `Stderr: ${stderr.trim()}` : "No additional output.")
          )
        );
      }

      // Verify the file exists
      if (!fs.existsSync(expectedPath)) {
        // yt-dlp might have chosen a different path — try globbing for the uuid
        const files = fs
          .readdirSync(tmpDir)
          .filter((f) => f.startsWith(uuid))
          .map((f) => path.join(tmpDir, f));

        if (files.length === 0) {
          return reject(
            new Error(
              `yt-dlp finished but no output file found for UUID ${uuid}.`
            )
          );
        }
        return resolve(files[0]);
      }

      resolve(expectedPath);
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn yt-dlp: ${err.message}`));
    });
  });
}
