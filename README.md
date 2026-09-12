# cross-post-bot

A Next.js Telegram bot that automates cross-posting Instagram Reels across **Telegram Channel**, **Instagram Reels**, and a **Facebook Page** simultaneously — personal use only.

---

## Getting Started (Next.js)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the setup dashboard.

---

## Cross-Post Bot Setup

### Prerequisites

| Requirement | Notes |
|---|---|
| **Supabase project** | Free tier is fine |
| **Telegram Bot** | Create via [@BotFather](https://t.me/BotFather) |
| **Telegram Channel** | Add your bot as an Administrator with "Post Messages" permission |
| **Instagram Graph API** | Access token + Business/Creator account ID from [Meta Developers](https://developers.facebook.com) |
| **Facebook Page** | Page Access Token + Page ID with `pages_manage_posts` and `pages_read_engagement` |
| **@Instagram_reels_dl_bot** | Free Telegram bot used to download reels (or send MP4 directly) |

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
| `TELEGRAM_CHANNEL_ID` | Target Telegram channel (`@channelname` or `-100xxxxxxxxxx`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (Project Settings → API) |
| `SUPABASE_BUCKET_NAME` | Name of the public storage bucket (e.g. `reels`) |
| `IG_ACCESS_TOKEN` | Instagram access token (`instagram_content_publish`) |
| `IG_BUSINESS_ACCOUNT_ID` | Numeric Instagram Business/Creator account ID |
| `FB_PAGE_ACCESS_TOKEN` | Facebook Page access token (`pages_manage_posts`, `pages_read_engagement`) |
| `FB_PAGE_ID` | Numeric Facebook Page ID |

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
  tg_caption       TEXT,
  updated_at       TIMESTAMPTZ DEFAULT now()
);
```

> **If upgrading an existing table**, add the new `tg_caption` column:
> ```sql
> ALTER TABLE bot_sessions ADD COLUMN IF NOT EXISTS tg_caption TEXT;
> ```

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

### 4. Conversation & Publishing Flow

```
You (in Private DM)           Our Bot                    @Instagram_reels_dl_bot
 │                               │                               │
 │── instagram.com/reels/...  ──▶│                               │
 │                               │── "Forward me the video" ────▶│ (you do this)
 │                               │                               │
 │◀───────────── video MP4 ──────┴───────────────────────────────│
 │
 │── forward video ─────────────▶│
 │                               │── upload to Supabase Storage
 │◀── "Send caption for Telegram"│
 │
 │── [Telegram caption] ────────▶│
 │◀── "Send caption for IG" ─────│
 │
 │── [Instagram caption] ───────▶│
 │                               │── 🚀 Publish to 3 targets:
 │                               │    1. Telegram Channel (TELEGRAM_CHANNEL_ID)
 │                               │    2. Instagram Reel (create container → poll → publish)
 │                               │    3. Facebook Page (/videos endpoint)
 │                               │
 │◀── 📊 Per-platform report ────│ (Reported back to your private DM)
```

- **Private DM interaction**: All chat interactions (link prompt, caption prompts, progress updates, and final confirmation) happen in your direct message with the bot.
- **Channel publishing**: The final video and Telegram caption are published directly to your designated channel (`TELEGRAM_CHANNEL_ID`).
- **Caption length fix**: Telegram's 1024-character caption limit is handled automatically (if caption exceeds 1024 chars, it sends the video cleanly and posts the full text as an immediate follow-up message).
- **Independent publishing**: Telegram Channel, Instagram Reel, and Facebook Page publish in parallel. If one platform fails, the others still succeed and the failure is clearly reported in your DM.
- **Cancel command**: Send `/cancel` at any time to abort the current flow and clear temporary files.

---

### 5. Module Structure

```
lib/
├── facebook.ts     — Facebook Graph API: /videos publish endpoint
├── instagram.ts    — Instagram Graph API: 3-step Reels container flow
├── session.ts      — Supabase-backed conversation state (safe for serverless)
├── storage.ts      — Supabase Storage: upload and delete video files
└── telegram.ts     — Telegram Bot API: sendMessage, sendVideo, getTelegramChannelId

app/api/telegram/webhook/
└── route.ts        — Main webhook handler and conversation state machine
```

---

## Deploy on Vercel

```bash
vercel deploy
```

Add all environment variables from `.env.local.example` in the Vercel project settings, then update the Telegram webhook URL to your production domain.
