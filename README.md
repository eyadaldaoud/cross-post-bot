# cross-post-bot

A Next.js app with a Telegram bot that cross-posts Instagram Reels to both **Instagram** and **Telegram** in parallel — personal use only.

---

## Getting Started (Next.js)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Cross-Post Bot Setup

### Prerequisites

| Requirement | Notes |
|---|---|
| **yt-dlp** | System binary — install with `brew install yt-dlp` or `pip install yt-dlp` |
| **Supabase project** | Free tier is fine |
| **Telegram Bot** | Create via [@BotFather](https://t.me/BotFather) |
| **Instagram Graph API** | Access token + Business/Creator account ID from [Meta Developers](https://developers.facebook.com) |

---

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_ALLOWED_USER_ID` | Your numeric Telegram user ID (get from [@userinfobot](https://t.me/userinfobot)) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Project Settings → API) |
| `SUPABASE_BUCKET_NAME` | Name of the public storage bucket (e.g. `reels`) |
| `IG_ACCESS_TOKEN` | Instagram short-lived or long-lived access token |
| `IG_BUSINESS_ACCOUNT_ID` | Numeric Instagram Business/Creator account ID |

---

### 2. Supabase Setup (one-time)

#### Storage Bucket
1. Go to **Storage** in the Supabase dashboard
2. Create a new bucket named exactly as `SUPABASE_BUCKET_NAME` (e.g. `reels`)
3. Make it **Public**

#### Session Table
Run this SQL in the **SQL Editor**:

```sql
CREATE TABLE bot_sessions (
  chat_id          BIGINT PRIMARY KEY,
  state            TEXT,
  reel_url         TEXT,
  video_public_url TEXT,
  updated_at       TIMESTAMPTZ DEFAULT now()
);
```

---

### 3. Register the Telegram Webhook

Telegram needs to know the URL to call when you send a message. Run this once (replace the values):

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

**For local development** with [ngrok](https://ngrok.com):

```bash
ngrok http 3000
# then set the webhook to: https://<ngrok-id>.ngrok.io/api/telegram/webhook
```

To verify the webhook is set:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

---

### 4. How to Use the Bot

1. Open a chat with your bot in Telegram
2. Send an Instagram Reel URL:
   ```
   https://www.instagram.com/reels/ABC123xyz/
   ```
3. The bot downloads the video, uploads it to Supabase, and asks for a caption
4. Send your caption as a plain text message
5. The bot publishes to **Instagram** (via Graph API) and **Telegram** in parallel
6. It reports success or failure for each platform independently

---

### 5. How to Swap the Downloader

The download logic is fully isolated in [`lib/downloader.ts`](lib/downloader.ts). The rest of the codebase only depends on this signature:

```typescript
export async function downloadReel(url: string): Promise<string>
// Returns: absolute path to the downloaded mp4 file
```

To replace `yt-dlp` with another mechanism (e.g. a third-party API, `gallery-dl`, or a custom scraper), replace only the body of `downloadReel()` in `lib/downloader.ts`. No other files need to change.

---

### 6. Module Structure

```
lib/
├── downloader.ts   — yt-dlp subprocess wrapper (swap here to change download method)
├── instagram.ts    — Instagram Graph API: 3-step container → poll → publish flow
├── session.ts      — Supabase-backed conversation state (safe for serverless)
├── storage.ts      — Supabase Storage: upload and delete video files
└── telegram.ts     — Telegram Bot API: sendMessage, sendVideo

app/api/telegram/webhook/
└── route.ts        — Main webhook handler and conversation state machine
```

---

### 7. Instagram API Notes

- The bot uses the [Instagram Graph API v21.0](https://developers.facebook.com/docs/instagram-api) Reels publishing endpoint
- After creating a media container, the bot polls every 12 seconds (max 25 attempts ≈ 5 minutes) for the video to process
- The current implementation reads `IG_ACCESS_TOKEN` directly — no auto-refresh logic. If you need long-lived tokens, exchange the short-lived token manually via the [token refresh endpoint](https://developers.facebook.com/docs/instagram-basic-display-api/reference/refresh_access_token)

---

## Deploy on Vercel

```bash
vercel deploy
```

Make sure to add all environment variables in the Vercel project settings, then update the Telegram webhook URL to your production domain.

> **Note**: `yt-dlp` must be available on the server. On Vercel, you'll need to install it as part of a build step or use a Docker-based deployment. Consider swapping the downloader for a cloud-based video download API in production.
