/**
 * lib/instagram.ts
 *
 * Instagram Graph API helpers for Reels and Stories publishing.
 * Both use the same 3-step container flow: create → poll → publish.
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

/** Step 1: Create a media container — returns the container ID. */
async function createContainer(
  igUserId: string,
  accessToken: string,
  mediaType: "REELS" | "STORIES",
  videoUrl: string,
  caption: string
): Promise<string> {
  const url = `${IG_API_BASE}/${igUserId}/media`;
  const params: Record<string, string> = {
    media_type: mediaType,
    video_url: videoUrl,
    access_token: accessToken,
  };
  // Stories do not support captions via the API — only include for Reels
  if (mediaType === "REELS" && caption) {
    params.caption = caption;
  }
  const body = new URLSearchParams(params);

  const res = await fetch(url, { method: "POST", body });
  const json = (await res.json()) as { id?: string; error?: { message: string } };

  if (!res.ok || !json.id) {
    const msg = json.error?.message ?? JSON.stringify(json);
    throw new Error(`IG ${mediaType} container creation failed: ${msg}`);
  }

  return json.id;
}

type ContainerStatus = {
  status_code: "IN_PROGRESS" | "FINISHED" | "PUBLISHED" | "ERROR" | string;
  status?: string;
  id: string;
};

/** Step 2: Poll until the container is FINISHED (or throw on ERROR). */
async function waitForContainer(
  containerId: string,
  accessToken: string,
  label: string
): Promise<void> {
  const url = `${IG_API_BASE}/${containerId}?fields=status_code,status&access_token=${accessToken}`;

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const res = await fetch(url);
    const json = (await res.json()) as ContainerStatus & { error?: { message: string } };

    if (!res.ok) {
      const msg = (json as { error?: { message: string } }).error?.message ?? JSON.stringify(json);
      throw new Error(`IG ${label} container status check failed: ${msg}`);
    }

    console.log(
      `[instagram][${label}] Container ${containerId}: ${json.status_code} (attempt ${attempt}/${MAX_POLL_ATTEMPTS})`
    );

    if (json.status_code === "FINISHED") return;

    if (json.status_code === "ERROR") {
      throw new Error(
        `IG ${label} container processing error (status: ${json.status ?? "unknown"}). ` +
          `Container ID: ${containerId}`
      );
    }
  }

  throw new Error(
    `IG ${label} container ${containerId} did not finish after ${MAX_POLL_ATTEMPTS} attempts ` +
      `(${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s). Giving up.`
  );
}

/** Step 3: Publish the container — returns the published media ID. */
async function publishContainer(
  igUserId: string,
  accessToken: string,
  containerId: string,
  label: string
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
    throw new Error(`IG ${label} publish failed: ${msg}`);
  }

  return json.id;
}

/** Shared 3-step flow for both Reels and Stories. */
async function runContainerFlow(
  mediaType: "REELS" | "STORIES",
  videoUrl: string,
  caption: string
): Promise<string> {
  const { accessToken, igUserId } = getCredentials();
  const label = mediaType === "REELS" ? "Reel" : "Story";

  const containerId = await createContainer(igUserId, accessToken, mediaType, videoUrl, caption);
  console.log(`[instagram][${label}] Created container: ${containerId}`);

  await waitForContainer(containerId, accessToken, label);
  console.log(`[instagram][${label}] Container FINISHED — publishing…`);

  const mediaId = await publishContainer(igUserId, accessToken, containerId, label);
  console.log(`[instagram][${label}] Published media ID: ${mediaId}`);

  return mediaId;
}

/**
 * Publishes a video as an Instagram Reel (3-step container flow).
 *
 * @param videoUrl - Publicly accessible video URL
 * @param caption  - Caption for the Reel
 * @returns Published Instagram media ID
 */
export async function publishReelToInstagram(
  videoUrl: string,
  caption: string
): Promise<string> {
  return runContainerFlow("REELS", videoUrl, caption);
}

/**
 * Publishes a video as an Instagram Story (3-step container flow).
 * Note: Instagram Stories do not support captions via the API —
 * the caption parameter is accepted but ignored for Stories.
 *
 * @param videoUrl - Publicly accessible video URL
 * @param caption  - Ignored for Stories (included for API consistency)
 * @returns Published Instagram media ID
 */
export async function publishStoryToInstagram(
  videoUrl: string,
  caption: string
): Promise<string> {
  return runContainerFlow("STORIES", videoUrl, caption);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
