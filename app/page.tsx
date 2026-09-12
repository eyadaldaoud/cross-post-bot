/**
 * app/page.tsx — CrossPost Bot Dashboard
 *
 * A status & setup overview page rendered server-side.
 * Reads env vars server-side to show which ones are configured.
 */

// This page is server-rendered so we can safely read process.env
const ENV_VARS = [
  { key: "TELEGRAM_BOT_TOKEN",        desc: "Telegram bot token" },
  { key: "TELEGRAM_ALLOWED_USER_ID",  desc: "Your Telegram user ID" },
  { key: "TELEGRAM_CHANNEL_ID",       desc: "Target Telegram channel (@username or -100... ID)" },
  { key: "SUPABASE_URL",              desc: "Supabase project URL" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", desc: "Supabase service role key" },
  { key: "SUPABASE_BUCKET_NAME",      desc: "Storage bucket name" },
  { key: "IG_ACCESS_TOKEN",           desc: "Instagram access token" },
  { key: "IG_BUSINESS_ACCOUNT_ID",    desc: "Instagram account ID" },
  { key: "FB_PAGE_ACCESS_TOKEN",      desc: "Facebook Page access token" },
  { key: "FB_PAGE_ID",                desc: "Facebook Page numeric ID" },
] as const;

const FLOW_STEPS = [
  { icon: "🔗", label: "Send URL / Video",   desc: "Send an IG Reel URL or forward a video directly in bot DM" },
  { icon: "📥", label: "Forward Video",      desc: "Forward the MP4 from @Instagram_reels_dl_bot" },
  { icon: "✍️", label: "Two Captions",       desc: "Send Telegram caption, then Instagram caption" },
  { icon: "🚀", label: "3-Way Cross-Post",   desc: "Publishes to Telegram Channel, IG Reel & Facebook Page" },
] as const;

const PLATFORMS = [
  { icon: "✈️", cls: "tg", name: "Telegram Channel", sub: "Channel posting — sendVideo",        envKey: "TELEGRAM_CHANNEL_ID" },
  { icon: "📸", cls: "ig", name: "Instagram Reel",   sub: "Graph API — Reels container flow",   envKey: "IG_ACCESS_TOKEN" },
  { icon: "📘", cls: "fb", name: "Facebook Page",    sub: "Graph API — /videos endpoint",       envKey: "FB_PAGE_ACCESS_TOKEN" },
  { icon: "🗄️", cls: "sb", name: "Supabase",         sub: "Storage + session state",            envKey: "SUPABASE_URL" },
] as const;

const CHECKLIST = [
  { label: "Create .env.local",                 hint: "cp .env.local.example .env.local", envKey: "TELEGRAM_BOT_TOKEN",      manual: false },
  { label: "Create Supabase bucket",            hint: "Public bucket named as SUPABASE_BUCKET_NAME", envKey: "SUPABASE_BUCKET_NAME", manual: false },
  { label: "Run bot_sessions SQL",              hint: "CREATE TABLE bot_sessions (chat_id BIGINT PRIMARY KEY, state TEXT, reel_url TEXT, video_public_url TEXT, tg_caption TEXT, updated_at TIMESTAMPTZ DEFAULT now());", envKey: "SUPABASE_URL", manual: false },
  { label: "Add tg_caption column (if upgrade)", hint: "ALTER TABLE bot_sessions ADD COLUMN IF NOT EXISTS tg_caption TEXT;", envKey: "SUPABASE_URL", manual: false },
  { label: "Register Telegram webhook",         hint: "POST /setWebhook with your public URL",        envKey: null,                  manual: true  },
] as const;

export default function Home() {
  const envStatus = Object.fromEntries(
    ENV_VARS.map(({ key }) => [key, !!process.env[key]])
  );

  const allEnvSet = ENV_VARS.every(({ key }) => envStatus[key]);

  return (
    <>
      {/* Background glow */}
      <div className="glow-blob" />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">⚡</div>
          CrossPost Bot
        </div>

        <div
          className={`status-pill ${allEnvSet ? "active" : "inactive"}`}
          title={allEnvSet ? "All env vars configured" : "Some env vars missing"}
        >
          <span className={`status-dot ${allEnvSet ? "pulse" : ""}`} />
          {allEnvSet ? "Configured" : "Setup needed"}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-eyebrow">⚡ Personal automation</div>
        <h1>Automate your Reels.</h1>
        <p>
          Drop a URL in Telegram. The bot handles the download, caption, and
          publishes to both platforms in parallel.
        </p>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ position: "relative", zIndex: 1 }}>

        {/* Platform cards */}
        <section className="section">
          <p className="section-title">Platforms</p>
          <div className="cards-grid">
            {PLATFORMS.map(({ icon, cls, name, sub, envKey }) => {
              const ok = envKey ? envStatus[envKey as keyof typeof envStatus] : true;
              return (
                <div className="card" key={name}>
                  <div className={`card-icon ${cls}`}>{icon}</div>
                  <div className="card-body">
                    <div className="card-name">{name}</div>
                    <div className="card-sub">{sub}</div>
                  </div>
                  <span className={`card-status ${ok ? "ok" : "missing"}`}>
                    {ok ? "Ready" : "Missing"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <p className="section-title">How it works</p>
          <div className="flow">
            {FLOW_STEPS.map(({ icon, label, desc }, i) => (
              <div className="flow-step" key={label}>
                <div className="flow-icon">{icon}</div>
                <div className="flow-num">Step {i + 1}</div>
                <div className="flow-label">{label}</div>
                <div className="flow-desc">{desc}</div>
              </div>
            ))}
          </div>

          {/* Setup checklist */}
          <p className="section-title">Setup checklist</p>
          <div className="checklist">
            <div className="checklist-header">
              ✅ One-time setup
            </div>
            {CHECKLIST.map(({ label, hint, envKey, manual }) => {
              const done = manual
                ? false // can't auto-detect webhook registration
                : envKey
                  ? !!envStatus[envKey as keyof typeof envStatus]
                  : true; // yt-dlp — assume installed if yt not a known env
              return (
                <div className="checklist-item" key={label}>
                  <div className={`check-box ${done ? "done" : "todo"}`}>
                    {done ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="checklist-label">{label}</div>
                    <div className="checklist-hint">{hint}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Env vars */}
          <p className="section-title">Environment variables</p>
          <div className="env-grid">
            {ENV_VARS.map(({ key, desc }) => (
              <div className="env-card" key={key}>
                <div>
                  <div className="env-name">{key}</div>
                  <div className="env-desc">{desc}</div>
                </div>
                <span className={`env-badge ${envStatus[key] ? "set" : "missing"}`}>
                  {envStatus[key] ? "Set" : "Missing"}
                </span>
              </div>
            ))}
          </div>

          {/* Webhook registration */}
          <p className="section-title">Webhook registration</p>
          <div className="webhook-box">
            <div className="webhook-title">Register with Telegram</div>
            <div className="webhook-sub">
              Run this once after deploying — replace the placeholders with your real values.
            </div>
            <div className="code-block">
              <span className="cmt"># Register webhook (run once after deploying)</span>{"\n"}
              <span className="kw">curl</span> -X POST{" "}
              <span className="str">"https://api.telegram.org/bot&lt;TOKEN&gt;/setWebhook"</span>{" "}
              \{"\n"}
              {"  "}-H{" "}
              <span className="str">"Content-Type: application/json"</span>{" "}
              \{"\n"}
              {"  "}-d{" "}
              <span className="str">
                {"'{\"url\": \"https://your-domain.com/api/telegram/webhook\"}'"}
              </span>
              {"\n\n"}
              <span className="cmt"># Verify</span>{"\n"}
              <span className="kw">curl</span>{" "}
              <span className="str">
                "https://api.telegram.org/bot&lt;TOKEN&gt;/getWebhookInfo"
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        CrossPost Bot · Personal use only ·{" "}
        <a
          href="/privacy-policy"
          style={{
            color: "var(--purple-l)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          Privacy Policy
        </a>{" "}
        · Webhook at{" "}
        <code
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: "var(--purple-l)",
            fontSize: "0.78rem",
          }}
        >
          /api/telegram/webhook
        </code>
      </footer>
    </>
  );
}
