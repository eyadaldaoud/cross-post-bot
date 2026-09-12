/**
 * lib/facebook.ts
 *
 * Facebook Graph API helper for publishing videos to a Facebook Page.
 * API version: v21.0
 *
 * Required permissions on the Page Access Token:
 *   - pages_manage_posts
 *   - pages_read_engagement
 *
 * Required env vars:
 *   - FB_PAGE_ACCESS_TOKEN  — Page-level access token (NOT the user token)
 *   - FB_PAGE_ID            — Numeric Facebook Page ID
 */

const FB_API_BASE = "https://graph.facebook.com/v21.0";

function getCredentials(): { pageAccessToken: string; pageId: string } {
  const pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  if (!pageAccessToken || !pageId) {
    throw new Error(
      "Missing FB_PAGE_ACCESS_TOKEN or FB_PAGE_ID environment variables."
    );
  }
  return { pageAccessToken, pageId };
}

/**
 * Publishes a video to a Facebook Page via a public URL.
 *
 * Uses the /videos endpoint with `file_url` so Facebook fetches the video
 * directly from Supabase Storage — no binary upload needed.
 *
 * @param videoUrl    - Publicly accessible video URL (Supabase Storage)
 * @param description - Post description / caption
 * @returns The Facebook video ID of the published post
 * @throws Error with descriptive message on failure
 */
export async function publishToFacebook(
  videoUrl: string,
  description: string
): Promise<string> {
  const { pageAccessToken, pageId } = getCredentials();

  const url = `${FB_API_BASE}/${pageId}/videos`;
  const body = new URLSearchParams({
    file_url: videoUrl,
    description,
    access_token: pageAccessToken,
  });

  const res = await fetch(url, { method: "POST", body });
  const json = (await res.json()) as { id?: string; error?: { message: string; code?: number } };

  if (!res.ok || !json.id) {
    const msg = json.error?.message ?? JSON.stringify(json);
    throw new Error(`Facebook Page video publish failed: ${msg}`);
  }

  console.log(`[facebook] Published video ID: ${json.id}`);
  return json.id;
}
