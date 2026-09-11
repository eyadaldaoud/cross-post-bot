/**
 * lib/instagram.ts
 *
 * Instagram Graph API helpers for the 3-step Reels publishing flow.
 * API version: v21.0
 */

const IG_API_BASE = "https://graph.instagram.com/v21.0";
const POLL_INTERVAL_MS = 12_000; // 12 seconds between polls
const MAX_POLL_ATTEMPTS = 25;

function getCredentials(): { accessToken: string; igUserId: string } {
  const accessToken = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_BUSINESS_ACCOUNT_ID;
  if (!accessToken || !igUserId) {
    throw new Error(
      "Missing IG_ACCESS_TOKEN or IG_BUSINESS_ACCOUNT_ID environment variables."
    );
  }
  return { accessToken, igUserId };
}

/** Step 1: Create the media container — returns the container ID. */
async function createContainer(
  igUserId: string,
  accessToken: string,
  videoUrl: string,
  caption: string
): Promise<string> {
  const url = `${IG_API_BASE}/${igUserId}/media`;
  const body = new URLSearchParams({
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    access_token: accessToken,
  });

  const res = await fetch(url, { method: "POST", body });
  const json = (await res.json()) as { id?: string; error?: { message: string } };

  if (!res.ok || !json.id) {
    const msg = json.error?.message ?? JSON.stringify(json);
    throw new Error(`IG container creation failed: ${msg}`);
  }

  return json.id;
}

type ContainerStatus = {
  status_code: "IN_PROGRESS" | "FINISHED" | "PUBLISHED" | "ERROR" | string;
  status?: string;
  id: string;
};

/** Step 2: Poll until the container is FINISHED (or ERROR). */
async function waitForContainer(
  containerId: string,
  accessToken: string
): Promise<void> {
  const url = `${IG_API_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`;

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const res = await fetch(url);
    const json = (await res.json()) as ContainerStatus & { error?: { message: string } };

    if (!res.ok) {
      const msg = (json as { error?: { message: string } }).error?.message ?? JSON.stringify(json);
      throw new Error(`IG container status check failed: ${msg}`);
    }

    console.log(
      `[instagram] Container ${containerId} status: ${json.status_code} (attempt ${attempt}/${MAX_POLL_ATTEMPTS})`
    );

    if (json.status_code === "FINISHED") {
      return; // Ready to publish
    }

    if (json.status_code === "ERROR") {
      throw new Error(
        `IG container processing error (status: ${json.status ?? "unknown"}). ` +
          `Container ID: ${containerId}`
      );
    }

    // IN_PROGRESS or any other state — keep polling
  }

  throw new Error(
    `IG container ${containerId} did not finish after ${MAX_POLL_ATTEMPTS} attempts ` +
      `(${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s). Giving up.`
  );
}

/** Step 3: Publish the container — returns the published media ID. */
async function publishContainer(
  igUserId: string,
  accessToken: string,
  containerId: string
): Promise<string> {
  const url = `${IG_API_BASE}/${igUserId}/media_publish`;
  const body = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });

  const res = await fetch(url, { method: "POST", body });
  const json = (await res.json()) as { id?: string; error?: { message: string } };

  if (!res.ok || !json.id) {
    const msg = json.error?.message ?? JSON.stringify(json);
    throw new Error(`IG publish failed: ${msg}`);
  }

  return json.id;
}

/**
 * Full 3-step Instagram Reels publishing flow.
 *
 * @param videoUrl  - Publicly accessible video URL (e.g. Supabase Storage public URL)
 * @param caption   - Caption for the Reel
 * @returns The published Instagram media ID
 * @throws Error with descriptive message at any step (creation, polling, publish)
 */
export async function publishToInstagram(
  videoUrl: string,
  caption: string
): Promise<string> {
  const { accessToken, igUserId } = getCredentials();

  const containerId = await createContainer(igUserId, accessToken, videoUrl, caption);
  console.log(`[instagram] Created container: ${containerId}`);

  await waitForContainer(containerId, accessToken);
  console.log(`[instagram] Container ${containerId} is FINISHED, publishing…`);

  const mediaId = await publishContainer(igUserId, accessToken, containerId);
  console.log(`[instagram] Published media ID: ${mediaId}`);

  return mediaId;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
