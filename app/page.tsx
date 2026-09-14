/**
 * app/page.tsx — CrossPost Bot Open Source Landing & Deployer Dashboard
 *
 * Server-rendered homepage showcasing features, quick-start guide,
 * live environment variable verification, and architecture overview.
 */

import Link from "next/link";
import Navbar from "@/app/components/Navbar";

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
      <Navbar
        configuredCount={configuredCount}
        totalEnvVars={ENV_VARS.length}
        allEnvSet={allEnvSet}
      />

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
          <a href="#requirements" className="btn-secondary">
            <span>🔑</span> Required API Keys
          </a>
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
          <div className="cards-grid" style={{ marginBottom: "3.5rem" }}>
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

          {/* ── Requirements & API Keys Section ────────────────── */}
          <div id="requirements" style={{ marginBottom: "4.5rem", scrollMarginTop: "80px" }}>
            <p className="section-title">System Requirements & API Keys</p>
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: "0.6rem" }}>
                What are the required API keys and what do they do?
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: "780px", lineHeight: 1.6 }}>
                CrossPost Bot communicates directly with Telegram, Meta (Instagram & Facebook), and Supabase without third-party subscriptions or monthly fees. Below is the complete breakdown of every prerequisite and API key, why it is strictly required, and exactly where to obtain it.
              </p>
            </div>

            {/* Prerequisites At-a-Glance banner */}
            <div className="prereq-banner">
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--purple-l)", marginBottom: "0.25rem" }}>
                  1. Telegram Account
                </div>
                <div style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                  A Telegram bot created with @BotFather, plus a channel where your bot is promoted to Admin with post permissions.
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--purple-l)", marginBottom: "0.25rem" }}>
                  2. Meta Developer Account
                </div>
                <div style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                  A Facebook Page linked to an Instagram Professional (Business or Creator) account with Graph API v21.0 tokens.
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--purple-l)", marginBottom: "0.25rem" }}>
                  3. Supabase Project
                </div>
                <div style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                  Free cloud PostgreSQL database to store conversation states, plus a public storage bucket for temporary video staging.
                </div>
              </div>
            </div>

            <div className="requirements-grid">
              {/* Telegram */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <div className="card-icon tg" style={{ width: "42px", height: "42px", fontSize: "20px" }}>✈️</div>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Telegram API</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>3 configuration keys</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.86rem" }}>
                  {/* Key 1 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        TELEGRAM_BOT_TOKEN
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#38bdf8", background: "rgba(56,189,248,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Auth Secret</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> The private HTTP API secret token issued by Telegram for your bot.<br />
                      <strong>What it does:</strong> Allows your serverless webhook to receive forwarded messages, download videos, and dynamically update messages in real-time with ASCII progress bars.<br />
                      <strong>Where to get it:</strong> Open Telegram → Chat with <code>@BotFather</code> → send <code>/newbot</code> → follow the prompts to copy the API token.
                    </div>
                  </div>

                  {/* Key 2 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        TELEGRAM_ALLOWED_USER_ID
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Security Guard</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> Your personal numeric Telegram user ID (e.g. <code>123456789</code>).<br />
                      <strong>What it does:</strong> Strict security whitelist. Since Telegram bots are publicly discoverable, this prevents random strangers from triggering your bot or consuming your Meta API rate limits.<br />
                      <strong>Where to get it:</strong> In Telegram, message <code>@userinfobot</code> or <code>@raw_data_bot</code> and copy the numeric <code>Id</code>.
                    </div>
                  </div>

                  {/* Key 3 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        TELEGRAM_CHANNEL_ID
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#facc15", background: "rgba(250,204,21,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Destination</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> Destination channel username (e.g. <code>@mychannel</code>) or numeric ID (e.g. <code>-100...</code>).<br />
                      <strong>What it does:</strong> Specifies the Telegram channel where the final cross-posted video and caption will be published.<br />
                      <strong>Where to get it:</strong> Found in your channel info. <em>Crucial:</em> Add your bot as an <strong>Administrator</strong> of this channel with the <strong>Post Messages</strong> permission enabled.
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta Graph API */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <div className="card-icon ig" style={{ width: "42px", height: "42px", fontSize: "20px" }}>📸</div>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Meta Graph API</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>4 configuration keys</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.86rem" }}>
                  {/* Key 1 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        IG_ACCESS_TOKEN
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#e879f9", background: "rgba(232,121,249,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Reels Token</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> A Meta access token granted the <code>instagram_content_publish</code> permission.<br />
                      <strong>What it does:</strong> Authorizes the bot to execute Meta's official 3-step Reels workflow: (1) create media container with staged video URL, (2) poll container status until transcoding completes, and (3) publish the Reel.<br />
                      <strong>Where to get it:</strong> Meta for Developers (<code>developers.facebook.com</code>) → Tools → Graph API Explorer → Generate User Token with <code>instagram_content_publish</code>.
                    </div>
                  </div>

                  {/* Key 2 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        IG_BUSINESS_ACCOUNT_ID
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#e879f9", background: "rgba(232,121,249,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Instagram ID</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> The numeric ID of your Instagram Professional (Business or Creator) account.<br />
                      <strong>What it does:</strong> Identifies which Instagram account will receive the Reel. Meta API requires an Instagram Professional account linked to a Facebook Page.<br />
                      <strong>Where to get it:</strong> In Graph API Explorer, query <code>GET /me/accounts?fields=instagram_business_account</code> and copy the numeric <code>id</code>.
                    </div>
                  </div>

                  {/* Key 3 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        FB_PAGE_ACCESS_TOKEN
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Page Token</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> A Page-scoped access token with <code>pages_manage_posts</code> permission.<br />
                      <strong>What it does:</strong> Authorizes the bot to upload and publish the video post directly onto your Facebook Page feed.<br />
                      <strong>Where to get it:</strong> In Graph API Explorer, select your Page in the User/Page dropdown, or query <code>GET /&#123;page-id&#125;?fields=access_token</code>.
                    </div>
                  </div>

                  {/* Key 4 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        FB_PAGE_ID
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Facebook ID</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> The numeric ID representing your Facebook Page (e.g. <code>7192834190</code>).<br />
                      <strong>What it does:</strong> Specifies the Facebook Page destination endpoint (<code>POST /&#123;FB_PAGE_ID&#125;/videos</code>) for video publishing.<br />
                      <strong>Where to get it:</strong> Visit your Facebook Page → About section → Page Transparency, or copy it from your Page URL.
                    </div>
                  </div>
                </div>
              </div>

              {/* Supabase */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <div className="card-icon sb" style={{ width: "42px", height: "42px", fontSize: "20px" }}>🗄️</div>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Supabase Backend</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>3 configuration keys</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.86rem" }}>
                  {/* Key 1 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        SUPABASE_URL
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: "999px" }}>REST URL</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> Your Supabase project REST API endpoint (e.g. <code>https://xyz.supabase.co</code>).<br />
                      <strong>What it does:</strong> Allows serverless functions to connect to your PostgreSQL database and object storage buckets over HTTPS.<br />
                      <strong>Where to get it:</strong> Supabase Dashboard → Settings → API → Project URL.
                    </div>
                  </div>

                  {/* Key 2 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        SUPABASE_SERVICE_ROLE_KEY
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Admin Secret</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> The secret admin API key that bypasses PostgreSQL Row Level Security (RLS).<br />
                      <strong>What it does:</strong> Because serverless webhooks are stateless, the bot persists multi-step conversation states (waiting for video, waiting for caption, publishing locks) in the <code>bot_sessions</code> table across cold starts.<br />
                      <strong>Where to get it:</strong> Supabase Dashboard → Settings → API → Project API Keys → <code>service_role</code> (secret).
                    </div>
                  </div>

                  {/* Key 3 */}
                  <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)", fontWeight: 700, fontSize: "0.88rem" }}>
                        SUPABASE_BUCKET_NAME
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: "999px" }}>Staging Bucket</span>
                    </div>
                    <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
                      <strong>What it is:</strong> The name of your public storage bucket (recommended: <code>reels</code>).<br />
                      <strong>What it does:</strong> Meta's Graph API requires a public URL to ingest video into Instagram & Facebook. The bot stages the video here, provides the public link to Meta, and <em>automatically deletes the file immediately after publishing</em> to keep storage clean and free!<br />
                      <strong>Where to get it:</strong> Supabase Dashboard → Storage → Create Bucket named <code>reels</code> → Set to <strong>Public bucket</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deployment Health & Env Vars */}
          <div id="status" style={{ scrollMarginTop: "80px" }}>
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
