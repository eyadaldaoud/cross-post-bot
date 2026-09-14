import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "Documentation & Setup Guide — CrossPost Bot",
  description:
    "Complete open-source documentation, architecture, and step-by-step setup guide for CrossPost Bot.",
};

export default function ReadmePage() {
  return (
    <>
      <div className="glow-blob" />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="doc-container">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(124, 58, 237, 0.12)",
              color: "var(--purple-l)",
              fontSize: "0.78rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
              border: "1px solid rgba(124, 58, 237, 0.25)",
            }}
          >
            <span>📖</span> Open Source Documentation
          </div>
          <h1
            style={{
              fontSize: "2.6rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: "0.75rem",
            }}
          >
            CrossPost Bot Setup & Guide
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem" }}>
            Automate publishing Instagram Reels across Telegram Channels, Instagram Reels, and Facebook Pages simultaneously with zero duplicate postings.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                color: "#cbd5e1",
              }}
            >
              Next.js 16 (Turbopack)
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                color: "#cbd5e1",
              }}
            >
              Meta Graph API v21.0
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                color: "#cbd5e1",
              }}
            >
              Supabase Storage & Database
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 10px",
                borderRadius: "6px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "var(--green)",
              }}
            >
              MIT Licensed
            </span>
          </div>
        </div>

        {/* Documentation Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          {/* Section 1: Overview */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              ⚡ Overview
            </h2>
            <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
              CrossPost Bot eliminates the tedious process of manually re-uploading and captioning vertical short-form videos across multiple platforms.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginTop: "1.25rem",
              }}
            >
              <div style={{ padding: "1rem", background: "rgba(0,0,0,0.25)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>✈️</div>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>Telegram Channel</div>
                <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  Posts video and caption directly to your channel with 1024-character caption limit auto-handling.
                </div>
              </div>
              <div style={{ padding: "1rem", background: "rgba(0,0,0,0.25)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>📸</div>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>Instagram Reels</div>
                <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  Uses official Graph API 3-step container flow (create → poll with live progress → publish).
                </div>
              </div>
              <div style={{ padding: "1rem", background: "rgba(0,0,0,0.25)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>📘</div>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>Facebook Page</div>
                <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  Direct video publishing to Facebook Page feed via Page Access Token.
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Quick Start */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              🚀 Quickstart (5 Minutes)
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", color: "var(--purple-l)", fontWeight: 600, marginBottom: "0.5rem" }}>
                  1. Clone and install dependencies
                </h3>
                <div className="code-block">
                  <span className="kw">git</span> clone https://github.com/your-username/cross-post-bot.git{"\n"}
                  <span className="kw">cd</span> cross-post-bot{"\n"}
                  <span className="kw">npm</span> install
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: "1rem", color: "var(--purple-l)", fontWeight: 600, marginBottom: "0.5rem" }}>
                  2. Create your .env.local file
                </h3>
                <div className="code-block">
                  <span className="kw">cp</span> .env.local.example .env.local
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: "1rem", color: "var(--purple-l)", fontWeight: 600, marginBottom: "0.5rem" }}>
                  3. Run Database Setup in Supabase
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Go to your Supabase Dashboard → SQL Editor and run this statement:
                </p>
                <div className="code-block">
                  <span className="kw">CREATE TABLE</span> bot_sessions ({"\n"}
                  {"  "}chat_id          <span className="str">BIGINT PRIMARY KEY</span>,{"\n"}
                  {"  "}state            <span className="str">TEXT</span>,{"\n"}
                  {"  "}reel_url         <span className="str">TEXT</span>,{"\n"}
                  {"  "}video_public_url <span className="str">TEXT</span>,{"\n"}
                  {"  "}tg_caption       <span className="str">TEXT</span>,{"\n"}
                  {"  "}updated_at       <span className="str">TIMESTAMPTZ DEFAULT now()</span>{"\n"}
                  );
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: "1rem", color: "var(--purple-l)", fontWeight: 600, marginBottom: "0.5rem" }}>
                  4. Register Telegram Webhook
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  Run this curl command in your terminal (replace token and your domain):
                </p>
                <div className="code-block">
                  <span className="kw">curl</span> -X POST <span className="str">"https://api.telegram.org/bot&lt;TELEGRAM_BOT_TOKEN&gt;/setWebhook"</span> \{"\n"}
                  {"  "}-H <span className="str">"Content-Type: application/json"</span> \{"\n"}
                  {"  "}-d <span className="str">'&#123;"url": "https://your-domain.com/api/telegram/webhook"&#125;'</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Environment Variables Reference */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              🔐 Environment Variables Reference
            </h2>
            <div className="table-wrapper">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Variable</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Where to Get It</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Purpose</th>
                  </tr>
                </thead>
                <tbody style={{ color: "#cbd5e1" }}>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>TELEGRAM_BOT_TOKEN</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>@BotFather on Telegram</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Authenticates bot API calls</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>TELEGRAM_ALLOWED_USER_ID</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>@userinfobot on Telegram</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Security guard (bot only responds to you)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>TELEGRAM_CHANNEL_ID</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Channel username (e.g. @mychannel) or -100... ID</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Destination channel for final videos</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>SUPABASE_URL</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Supabase Settings → API</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>PostgreSQL REST endpoint</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>SUPABASE_SERVICE_ROLE_KEY</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Supabase Settings → API</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Server-side database bypass for state</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>SUPABASE_BUCKET_NAME</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Supabase Storage (e.g. reels)</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Temporary video staging (Public bucket)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>IG_ACCESS_TOKEN</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Meta Developers Graph Explorer</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Token with instagram_content_publish</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>IG_BUSINESS_ACCOUNT_ID</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Meta Graph API /me/accounts</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Numeric Instagram Business Account ID</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>FB_PAGE_ACCESS_TOKEN</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>GET /&#123;page-id&#125;?fields=access_token</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Page-scoped token (pages_manage_posts)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "var(--font-geist-mono)", color: "var(--purple-l)" }}>FB_PAGE_ID</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Facebook Page About Section / URL</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Numeric Facebook Page ID</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Architecture & Deduplication */}
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              🛡️ Zero Duplicate Guarantee
            </h2>
            <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>
              Publishing video reels through Meta’s Graph API container flow requires 15–35 seconds of status polling. Because Telegram’s webhook timeout is ~10–15 seconds, ordinary bots get stuck in infinite retry loops, causing duplicate posts. CrossPost Bot solves this with a robust 3-layer architecture:
            </p>
            <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", color: "#cbd5e1", fontSize: "0.92rem" }}>
              <li>
                <strong>Immediate 200 OK via Next.js after():</strong> Responds to Telegram in under 100ms, satisfying Telegram’s timeout immediately while allowing background publishing to proceed.
              </li>
              <li>
                <strong>Database State Locking:</strong> Transitions session state to <code style={{ color: "var(--purple-l)" }}>publishing</code> in Supabase before kicking off background workers. Any concurrent duplicate request is dropped on sight.
              </li>
              <li>
                <strong>In-Memory update_id Cache:</strong> Keeps a sliding window of recent update IDs to discard immediate network duplicate packets from Telegram edges.
              </li>
            </ul>
          </section>

        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        CrossPost Bot · Open Source MIT License ·{" "}
        <Link href="/" style={{ color: "var(--purple-l)", textDecoration: "none" }}>
          Dashboard
        </Link>
      </footer>
    </>
  );
}
