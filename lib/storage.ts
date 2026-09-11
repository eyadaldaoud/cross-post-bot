/**
 * lib/storage.ts
 *
 * Supabase Storage helpers for uploading and deleting reel videos.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }
  return createClient(url, key);
}

function getBucketName(): string {
  const bucket = process.env.SUPABASE_BUCKET_NAME;
  if (!bucket) {
    throw new Error("Missing SUPABASE_BUCKET_NAME environment variable.");
  }
  return bucket;
}

/**
 * Uploads a local video file to Supabase Storage.
 *
 * @param localPath - Absolute path to the local video file
 * @returns Public URL of the uploaded file
 * @throws Error with descriptive message on upload failure
 */
export async function uploadVideo(localPath: string): Promise<string> {
  const supabase = getSupabaseClient();
  const bucket = getBucketName();

  const ext = path.extname(localPath) || ".mp4";
  const objectName = `reels/${randomUUID()}${ext}`;

  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectName, fileBuffer, {
      contentType: "video/mp4",
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(objectName);

  if (!publicUrl) {
    throw new Error(
      "Supabase Storage upload succeeded but could not retrieve public URL."
    );
  }

  return publicUrl;
}

/**
 * Deletes a video from Supabase Storage using its public URL.
 * Extracts the object path from the URL — assumes the standard Supabase
 * public URL format: .../storage/v1/object/public/<bucket>/<object-path>
 *
 * Non-fatal: logs a warning on failure rather than throwing.
 *
 * @param publicUrl - The public URL returned by uploadVideo()
 */
export async function deleteVideo(publicUrl: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const bucket = getBucketName();

    // Extract object path from URL
    const marker = `/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) {
      console.warn(
        `[storage] Could not parse object path from URL: ${publicUrl}`
      );
      return;
    }
    const objectPath = publicUrl.slice(idx + marker.length);

    const { error } = await supabase.storage.from(bucket).remove([objectPath]);
    if (error) {
      console.warn(`[storage] Failed to delete ${objectPath}: ${error.message}`);
    }
  } catch (err) {
    console.warn(`[storage] deleteVideo threw unexpectedly:`, err);
  }
}
