<div align="center">

# ⚡ CrossPost Bot

**Automate publishing Instagram Reels across Telegram Channels, Instagram Reels, and Facebook Pages simultaneously.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-green?logo=supabase)](https://supabase.com/)
[![Meta Graph API](https://img.shields.io/badge/Meta_Graph_API-v21.0-1877F2?logo=meta)](https://developers.facebook.com/)

[**Live Demo & Deployer Dashboard**](https://your-domain.com) · [**Full Documentation**](https://your-domain.com/readme) · [**Privacy Policy**](https://your-domain.com/privacy-policy)

</div>

---

## 🌟 Highlights

- **🚀 3-Way Parallel Cross-Posting**: Automatically publishes your video to a **Telegram Channel**, **Instagram Reels** (via Graph API container flow), and a **Facebook Page** (`/videos` endpoint).
- **🛡️ Zero Duplicate Guarantee**: Leverages Next.js 16 `after()`, database state locks, and in-memory `update_id` deduplication to prevent Telegram webhook timeout retries.
- **🎨 Interactive Telegram Experience**: Dynamically edits messages in-place with live ASCII progress bars during upload and Meta API polling.
- **📝 Flexible Caption Modes**: Choose between a single universal caption or customized captions for Telegram and Instagram via interactive inline keyboard buttons.
- **⚡ 100% Serverless**: Built on Next.js App Router and Supabase. No long-running bot polling processes or expensive VPS servers required.
- **🔒 Private by Default**: Configured with `TELEGRAM_ALLOWED_USER_ID` to strictly protect your bot from unauthorized public usage.

---

## 📐 Architecture & Workflow

```
You (Telegram Private DM)       CrossPost Bot (Next.js Serverless)       Target Platforms
         │                                       │                              │
         ├── Send Reel URL / Video MP4 ─────────▶│                              │
         │                                       ├── Upload to Supabase Storage │
         │◀── "Choose caption mode" (Buttons) ───┤                              │
         │                                       │                              │
         ├── Select Mode & Send Caption ────────▶│                              │
         │                                       ├── [200 OK sent to Telegram in <100ms]
         │                                       │   (Prevents webhook timeout retries)
         │                                       │                              │
         │                                       ├── Promise.allSettled() ─────▶│
         │                                       │   ├── ✈️ Telegram Channel    │
         │                                       │   ├── 📸 Instagram Reel      │
         │                                       │   └── 📘 Facebook Page       │
         │                                       │                              │
         │◀── Live Progress Bar Updates ─────────┤ (In-place message edits)     │
         │◀── Final Status Summary Card ─────────┤                              │
```

---

## 🚀 Quickstart

### 1. Clone & Install

```bash
git clone https://github.com/your-username/cross-post-bot.git
cd cross-post-bot
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in the required values:

| Variable | Description | Where to Get |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_ALLOWED_USER_ID` | Your numeric Telegram user ID | [@userinfobot](https://t.me/userinfobot) |
| `TELEGRAM_CHANNEL_ID` | Destination channel (`@username` or `-100...`) | Channel Info (Add bot as Admin) |
| `SUPABASE_URL` | Supabase Project REST URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Supabase Dashboard → Settings → API |
| `SUPABASE_BUCKET_NAME` | Public bucket name (e.g. `reels`) | Supabase Dashboard → Storage |
| `IG_ACCESS_TOKEN` | Token with `instagram_content_publish` | Meta Developers App |
| `IG_BUSINESS_ACCOUNT_ID` | Numeric Instagram Business ID | Meta Graph API `/me/accounts` |
| `FB_PAGE_ACCESS_TOKEN` | Page-scoped access token | `GET /{page-id}?fields=access_token` |
| `FB_PAGE_ID` | Numeric Facebook Page ID | Facebook Page About section |

### 3. Supabase Database Migration

In your **Supabase Dashboard → SQL Editor**, run:

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

> **Upgrading an existing table?**
> ```sql
> ALTER TABLE bot_sessions ADD COLUMN IF NOT EXISTS tg_caption TEXT;
> ```

### 4. Register the Telegram Webhook

Once deployed (or using `ngrok` for local dev):

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

Verify webhook status:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

---

## 📦 Project Structure

```
cross-post-bot/
├── app/
│   ├── api/telegram/webhook/
│   │   └── route.ts          # Main webhook receiver, deduplication & state machine
│   ├── privacy-policy/
│   │   └── page.tsx          # Meta-compliant Privacy Policy for Live App mode
│   ├── readme/
│   │   └── page.tsx          # Web documentation & setup guide
│   ├── page.tsx              # Open-source showcase & deployer dashboard
│   ├── layout.tsx            # Root layout & fonts
│   └── globals.css           # Modern dark-mode design system & animations
├── lib/
│   ├── facebook.ts           # Facebook Graph API /videos helper
│   ├── instagram.ts          # Instagram Graph API 3-step Reels container runner
│   ├── session.ts            # Supabase persistent conversation state
│   ├── storage.ts            # Supabase Storage upload & transient deletion
│   ├── telegram.ts           # Telegram Bot API client with in-place progress edits
│   └── downloader.ts         # Video downloader helper
└── .env.local.example        # Environment variable template
```

---

## 🚢 Deployment

### Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your repository to GitHub.
2. Import the repository into Vercel.
3. Configure all 10 environment variables from `.env.local.example`.
4. Deploy and update your Telegram webhook URL to `https://<your-project>.vercel.app/api/telegram/webhook`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/cross-post-bot/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
