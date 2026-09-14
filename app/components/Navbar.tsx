"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface NavbarProps {
  configuredCount?: number;
  totalEnvVars?: number;
  allEnvSet?: boolean;
}

export default function Navbar({
  configuredCount,
  totalEnvVars,
  allEnvSet,
}: NavbarProps) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState<string>("");
  const isClickingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveHash(window.location.hash);
    }

    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    // Scroll spy for #requirements and #status on homepage
    const handleScroll = () => {
      if (pathname !== "/" || isClickingRef.current) return;

      const scrollY = window.scrollY;

      // Near top of page: Overview is active
      if (scrollY < 200) {
        setActiveHash("");
        return;
      }

      const reqsEl = document.getElementById("requirements");
      const statusEl = document.getElementById("status");

      const reqsTop = reqsEl ? reqsEl.getBoundingClientRect().top + window.scrollY - 120 : Infinity;
      const statusTop = statusEl ? statusEl.getBoundingClientRect().top + window.scrollY - 120 : Infinity;

      if (scrollY >= statusTop) {
        setActiveHash("#status");
      } else if (scrollY >= reqsTop) {
        setActiveHash("#requirements");
      } else {
        setActiveHash("");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const isHome = pathname === "/";
  const isReadme = pathname === "/readme";
  const isPrivacy = pathname === "/privacy-policy";

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 860 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Smooth click handlers for section jumps on homepage
  const handleOverviewClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      isClickingRef.current = true;
      setActiveHash("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.history.pushState) {
        window.history.pushState(null, "", "/");
      }
      setTimeout(() => {
        isClickingRef.current = false;
      }, 700);
    }
  };

  const handleSectionClick = (sectionId: string) => (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        isClickingRef.current = true;
        setActiveHash(`#${sectionId}`);
        const navHeight = 70;
        const targetPos = el.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: Math.max(0, targetPos), behavior: "smooth" });
        if (window.history.pushState) {
          window.history.pushState(null, "", `#${sectionId}`);
        }
        setTimeout(() => {
          isClickingRef.current = false;
        }, 700);
      }
    }
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="nav">
        <Link
          href="/"
          onClick={(e) => {
            handleOverviewClick(e);
            closeMobile();
          }}
          className="nav-brand"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="nav-logo">⚡</div>
          <span>CrossPost Bot</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link
            href="/"
            onClick={handleOverviewClick}
            className={`nav-link ${isHome && !activeHash ? "active" : ""}`}
          >
            Overview
          </Link>
          <Link
            href={isHome ? "#requirements" : "/#requirements"}
            onClick={handleSectionClick("requirements")}
            className={`nav-link ${isHome && activeHash === "#requirements" ? "active" : ""}`}
          >
            Requirements
          </Link>
          <Link
            href={isHome ? "#status" : "/#status"}
            onClick={handleSectionClick("status")}
            className={`nav-link ${isHome && activeHash === "#status" ? "active" : ""}`}
          >
            Status
          </Link>
          <Link
            href="/readme"
            className={`nav-link ${isReadme ? "active" : ""}`}
          >
            Docs & Setup
          </Link>
          <Link
            href="/privacy-policy"
            className={`nav-link ${isPrivacy ? "active" : ""}`}
          >
            Privacy
          </Link>
        </div>

        {/* Right action items */}
        <div className="nav-right-cluster">
          <a
            href="https://github.com/eyadaldaoud/cross-post-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="github-nav-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>GitHub</span>
            <span className="star-pill">★</span>
          </a>

          {configuredCount !== undefined && totalEnvVars !== undefined && (
            <div
              className={`status-pill ${allEnvSet ? "active" : "inactive"}`}
              title={`${configuredCount}/${totalEnvVars} environment variables set`}
            >
              <span className={`status-dot ${allEnvSet ? "pulse" : ""}`} />
              {allEnvSet ? "Ready" : `${configuredCount}/${totalEnvVars}`}
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div
        className={`mobile-nav-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={closeMobile}
      >
        <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-links">
            <Link
              href="/"
              onClick={(e) => {
                handleOverviewClick(e);
                closeMobile();
              }}
              className={`mobile-nav-link ${isHome && !activeHash ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">⚡</span>
              <span>Overview & Demo</span>
            </Link>

            <Link
              href={isHome ? "#requirements" : "/#requirements"}
              onClick={(e) => {
                handleSectionClick("requirements")(e);
                closeMobile();
              }}
              className={`mobile-nav-link ${isHome && activeHash === "#requirements" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">🔑</span>
              <span>Requirements & API Keys</span>
            </Link>

            <Link
              href={isHome ? "#status" : "/#status"}
              onClick={(e) => {
                handleSectionClick("status")(e);
                closeMobile();
              }}
              className={`mobile-nav-link ${isHome && activeHash === "#status" ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">📊</span>
              <span>Deployment Health</span>
            </Link>

            <Link
              href="/readme"
              onClick={closeMobile}
              className={`mobile-nav-link ${isReadme ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">📖</span>
              <span>Docs & Setup Guide</span>
            </Link>

            <Link
              href="/privacy-policy"
              onClick={closeMobile}
              className={`mobile-nav-link ${isPrivacy ? "active" : ""}`}
            >
              <span className="mobile-nav-icon">🛡️</span>
              <span>Privacy Policy</span>
            </Link>
          </div>

          <div className="mobile-nav-footer">
            <a
              href="https://github.com/eyadaldaoud/cross-post-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-github"
              style={{ width: "100%", justifyContent: "center", minHeight: "44px" }}
              onClick={closeMobile}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Star on GitHub</span>
              <span className="star-pill">★</span>
            </a>

            {configuredCount !== undefined && totalEnvVars !== undefined && (
              <div
                className={`status-pill ${allEnvSet ? "active" : "inactive"}`}
                style={{ width: "100%", justifyContent: "center", padding: "10px 14px" }}
              >
                <span className={`status-dot ${allEnvSet ? "pulse" : ""}`} />
                {allEnvSet ? "All Environment Variables Configured" : `${configuredCount}/${totalEnvVars} Variables Set`}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
