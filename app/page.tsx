/**
 * app/page.tsx — CrossPost Bot Open Source Landing & Deployer Dashboard
 *
 * Server-rendered homepage showcasing features, quick-start guide,
 * live environment variable verification, and architecture overview.
 */

import Link from "next/link";

const ENV_VARS = [
  { key: "TELEGRAM_BOT_TOKEN",        desc: "Telegram bot token from @BotFather" },
  { key: "TELEGRAM_ALLOWED_USER_ID",  desc: "Your numeric Telegram user ID (security guard)" },
  { key: "TELEGRAM_CHANNEL_ID",       desc: "Destination Telegram channel (@username or -100... ID)" },
  { key: "SUPABASE_URL",              desc: "Supabase project REST URL" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", desc: "Supabase service role secret key" },
  { key: "SUPABASE_BUCKET_NAME",      desc: "Storage bucket name for video staging (e.g. reels)" },
  { key: "IG_ACCESS_TOKEN",           desc: "Instagram access token (instagram_content_publish)" },
  { key: "IG_BUSINESS_ACCOUNT_ID",    desc: "Numeric Instagram Business/Creator account ID" },
  { key: "FB_PAGE_ACCESS_TOKEN",      desc: "Facebook Page access token (pages_manage_posts)" },
  { key: "FB_PAGE_ID",                desc: "Numeric Facebook Page ID" },
] as const;

const PLATFORMS = [
  { icon: "✈️", cls: "tg", name: "Telegram Channel", sub: "Direct channel posting with caption auto-split", envKey: "TELEGRAM_CHANNEL_ID" },
  { icon: "📸", cls: "ig", name: "Instagram Reel",   sub: "Meta Graph API 3-step Reels container flow",   envKey: "IG_ACCESS_TOKEN" },
  { icon: "📘", cls: "fb", name: "Facebook Page",    sub: "Direct Page /videos endpoint publishing",      envKey: "FB_PAGE_ACCESS_TOKEN" },
  { icon: "🗄️", cls: "sb", name: "Supabase",         sub: "Database session state & transient storage",   envKey: "SUPABASE_URL" },
] as const;

const FEATURES = [
  {
    icon: "🚀",
    title: "3-Way Cross-Posting",
    desc: "Cross-post simultaneously to a Telegram Channel, Instagram Reels, and Facebook Page from a single message.",
  },
  {
    icon: "🛡️",
    title: "Zero Duplicate Guarantee",
    desc: "Powered by Next.js after(), database state locks, and update_id deduplication. Eliminates Telegram webhook timeout retries.",
  },
  {
    icon: "🎨",
    title: "In-Place Progress Bars",
    desc: "No chat clutter. The bot dynamically edits messages in-place with live ASCII progress bars during upload and API polling.",
  },
  {
    icon: "📝",
    title: "Smart Caption Modes",
    desc: "Tap inline buttons to use the same caption everywhere, or customize separate captions for Telegram and Instagram.",
  },
  {
    icon: "⚡",
    title: "100% Serverless Ready",
    desc: "Built with Next.js 16 and Supabase. Survives cold starts without long-running server instances.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    desc: "Strictly guards your bot against unauthorized access using TELEGRAM_ALLOWED_USER_ID verification.",
  },
] as const;

export default function Home() {
  const envStatus = Object.fromEntries(
    ENV_VARS.map(({ key }) => [key, !!process.env[key]])
  );

  const configuredCount = ENV_VARS.filter(({ key }) => envStatus[key]).length;
  const allEnvSet = configuredCount === ENV_VARS.length;

  return (
    <>
      {/* Background glow */}
      <div className="glow-blob" />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="nav">
        <Link href="/" className="nav-brand" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="nav-logo">⚡</div>
          CrossPost Bot
        </Link>

        <div className="nav-links">
          <Link href="#features" className="nav-link">
            Features
          </Link>
          <Link href="#status" className="nav-link">
            Deploy Status
          </Link>
          <Link href="/readme" className="nav-link" style={{ color: "var(--purple-l)", fontWeight: 600 }}>
            Docs & Setup
          </Link>
          <Link href="/privacy-policy" className="nav-link">
            Privacy
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href="https://github.com/eyadaldaoud/cross-post-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="github-nav-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub</span>
            <span className="star-pill">★ Star</span>
          </a>

          <div
            className={`status-pill ${allEnvSet ? "active" : "inactive"}`}
            title={`${configuredCount}/${ENV_VARS.length} environment variables set`}
          >
            <span className={`status-dot ${allEnvSet ? "pulse" : ""}`} />
            {allEnvSet ? "All Configured" : `${configuredCount}/${ENV_VARS.length} Set`}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero-eyebrow">⚡ Next.js 16 • Meta Graph API • Serverless</div>
        <h1>One Reel. Every Platform.</h1>
        <p>
          Forward an Instagram Reel to your Telegram bot. It automatically publishes to your Telegram Channel, Instagram Reels, and Facebook Page in parallel — with zero duplicates.
        </p>

        <div className="hero-actions">
          <Link href="/readme" className="btn-primary">
            <span>📖</span> Documentation & Setup
          </Link>
          <a
            href="https://github.com/eyadaldaoud/cross-post-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-github"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>★ Star on GitHub</span>
          </a>
          <Link href="#status" className="btn-secondary">
            <span>📊</span> Deployment Status
          </Link>
        </div>

        {/* Interactive Terminal Mockup */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="terminal-dot r" />
              <div className="terminal-dot y" />
              <div className="terminal-dot g" />
            </div>
            <div className="terminal-title">Telegram Bot Interaction Flow</div>
            <div style={{ width: "40px" }} />
          </div>
          <div className="terminal-body" style={{ textAlign: "left" }}>
            <div style={{ color: "var(--purple-l)", marginBottom: "0.5rem" }}>
              👤 You: https://www.instagram.com/reels/C8xYz123/
            </div>
            <div style={{ color: "#94a3b8", marginBottom: "0.5rem" }}>
              🤖 Bot: 🔗 URL Received! Forward the video from @Instagram_reels_dl_bot
            </div>
            <div style={{ color: "var(--purple-l)", marginBottom: "0.5rem" }}>
              👤 You: [forwards reel video.mp4]
            </div>
            <div style={{ color: "#38bdf8", marginBottom: "0.5rem" }}>
              🤖 Bot: ☁️ Uploading to Storage... [████████░░] 80%
            </div>
            <div style={{ color: "#4ade80", marginBottom: "0.5rem" }}>
              🤖 Bot: ✅ Video Staged! [🔗 Same Caption for All] [✏️ Separate Captions]
            </div>
            <div style={{ color: "var(--purple-l)", marginBottom: "0.5rem" }}>
              👤 You: "Excited to share our open-source release! 🚀 #buildinpublic"
            </div>
            <div style={{ color: "#facc15", marginTop: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }}>
              ✨ ALL POSTS PUBLISHED SUCCESSFULLY!<br />
              • ✈️ Telegram Channel: ✅ Video posted<br />
              • 📸 Instagram Reel: ✅ Published (ID: 1804291823)<br />
              • 📘 Facebook Page: ✅ Published (ID: 7192834190)
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ position: "relative", zIndex: 1 }}>

        {/* Features Section */}
        <section id="features" className="section">
          <p className="section-title">Key Capabilities</p>
          <div className="features-grid">
            {FEATURES.map(({ icon, title, desc }) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon">{icon}</div>
                <div className="feature-title">{title}</div>
                <div className="feature-desc">{desc}</div>
              </div>
            ))}
          </div>

          {/* Platform Cards */}
          <p className="section-title">Supported Target Platforms</p>
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
                    {ok ? "Configured" : "Needs Config"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Deployment Health & Env Vars */}
          <div id="status">
            <p className="section-title">Deployment & Environment Health</p>
            <div className="env-grid" style={{ marginBottom: "3rem" }}>
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
          </div>

          {/* Quick Setup Card */}
          <div className="webhook-box">
            <div className="webhook-title">🚀 Ready to deploy your own instance?</div>
            <div className="webhook-sub">
              Check out our complete documentation for step-by-step Meta Developer setup, Supabase migrations, and Telegram webhook registration.
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <Link href="/readme" className="btn-primary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
                Read Full Setup Guide →
              </Link>
              <Link href="/privacy-policy" className="btn-secondary" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
                Meta Privacy Policy
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        CrossPost Bot · Open Source MIT License ·{" "}
        <a
          href="https://github.com/eyadaldaoud/cross-post-bot"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--purple-l)", textDecoration: "none" }}
        >
          GitHub
        </a>{" "}
        ·{" "}
        <Link href="/readme" style={{ color: "var(--purple-l)", textDecoration: "none" }}>
          Documentation
        </Link>{" "}
        ·{" "}
        <Link href="/privacy-policy" style={{ color: "var(--purple-l)", textDecoration: "none" }}>
          Privacy Policy
        </Link>{" "}
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
