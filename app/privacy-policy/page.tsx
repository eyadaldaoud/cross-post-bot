import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — CrossPost Bot",
  description:
    "Privacy Policy for CrossPost Bot — a private, personal-use automation tool.",
};

export default function PrivacyPolicy() {
  return (
    <>

      <div className="glow-blob" />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="nav">
        <Link href="/" className="nav-brand" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="nav-logo">⚡</div>
          CrossPost Bot
        </Link>
        <Link
          href="/"
          style={{
            color: "var(--purple-l)",
            fontSize: "0.85rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontWeight: 500,
          }}
        >
          ← Back to Dashboard
        </Link>
      </nav>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "800px",
          margin: "0 auto",
          padding: "3rem 1.5rem 6rem",
          lineHeight: 1.7,
        }}
      >
        <div style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-block",
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
            Legal & Compliance
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Last updated: September 13, 2026 · Effective immediately
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            color: "#cbd5e1",
            fontSize: "0.98rem",
          }}
        >
          {/* Section 1 */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              1. Overview & Scope
            </h2>
            <p style={{ marginBottom: "0.75rem" }}>
              <strong>CrossPost Bot</strong> is a private, personal-use automation utility
              engineered exclusively for the project owner. It is <strong>not</strong> a
              commercial service, multi-tenant SaaS, consumer software, or public-facing product.
            </p>
            <p>
              Access to the bot is strictly restricted to a single authorized Telegram user ID
              via server-side verification. The general public cannot register, create accounts,
              or interact with this application.
            </p>
          </section>

          {/* Section 2 */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              2. Data We Collect and Process
            </h2>
            <p style={{ marginBottom: "0.75rem" }}>
              Because this tool is used solely by its operator, data processing is minimal and strictly limited to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <strong>User-Submitted Content:</strong> Video files, reel URLs, and captions explicitly sent by the authorized user to the bot for cross-posting.
              </li>
              <li>
                <strong>API Credentials:</strong> Meta Graph API tokens (Instagram access token, Facebook Page access token) and Telegram bot credentials, stored securely in private environment variables to authenticate with official platform APIs.
              </li>
              <li>
                <strong>Transient Session State:</strong> Chat ID and current workflow stage (e.g., awaiting video or caption) temporarily maintained in a secure database to track multi-step conversations.
              </li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              We do <strong>not</strong> collect personal information, browsing behavior, cookies, advertising identifiers, or data from third-party individuals or audience members.
            </p>
          </section>

          {/* Section 3 */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              3. Purpose of Data Processing
            </h2>
            <p style={{ marginBottom: "0.75rem" }}>
              All information processed by this application is used exclusively to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>Temporarily stage video content in cloud storage so platform APIs can fetch it.</li>
              <li>Publish video reels and captions to the operator’s authorized Instagram account.</li>
              <li>Publish videos and descriptions to the operator’s authorized Facebook Page.</li>
              <li>Post videos and captions to the operator’s designated Telegram channel.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              4. Data Retention & Deletion
            </h2>
            <p style={{ marginBottom: "0.75rem" }}>
              We adhere to strict data minimization and transient retention practices:
            </p>
            <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <strong>Video Files:</strong> Uploaded video files staged in cloud storage (Supabase Storage) are automatically deleted immediately after all target platforms have ingested the media, or immediately upon user cancellation (via <code>/cancel</code>).
              </li>
              <li>
                <strong>Conversation Sessions:</strong> Workflow state records are purged automatically from the database upon completion of the publishing cycle or cancellation.
              </li>
              <li>
                <strong>No Long-Term Media Archiving:</strong> The application does not maintain an ongoing library or permanent archive of uploaded video files.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              5. Third-Party Services
            </h2>
            <p style={{ marginBottom: "0.75rem" }}>
              This application interfaces directly with the following official platform APIs:
            </p>
            <ul style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li>
                <strong>Meta Graph API (Instagram & Facebook):</strong> Used in accordance with the Meta Platform Terms and Developer Policies to publish media to the owner’s linked accounts.
              </li>
              <li>
                <strong>Telegram Bot API:</strong> Used to receive administrative instructions and dispatch media to the owner’s channel.
              </li>
              <li>
                <strong>Supabase:</strong> Provides temporary cloud storage and database session persistence.
              </li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              Data is never shared with, sold to, or monetized by third-party advertisers, brokers, or marketing networks.
            </p>
          </section>

          {/* Section 6 */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              6. User Rights & Data Deletion Instructions
            </h2>
            <p style={{ marginBottom: "0.75rem" }}>
              Because this application processes data exclusively for its owner, no external end-user accounts exist. If you have questions regarding data processing or wish to request the manual removal of any residual logs or records, you may initiate a deletion request at any time.
            </p>
            <p>
              To request data deletion or review any stored metadata, contact the application administrator directly via GitHub or the contact channel provided below. Requests are processed within 24 hours.
            </p>
          </section>

          {/* Section 7 */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
              }}
            >
              7. Contact & Administrator Information
            </h2>
            <p>
              For inquiries regarding this Privacy Policy or this private utility, please contact the developer and application owner through the project’s repository or administrative communication channels.
            </p>
          </section>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        CrossPost Bot · Personal use only ·{" "}
        <Link href="/" style={{ color: "var(--purple-l)", textDecoration: "none" }}>
          Dashboard
        </Link>
      </footer>
    </>
  );
}
