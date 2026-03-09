"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  hasMega?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#", hasMega: true },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/customers" },
  { label: "About", href: "/about" },
];

const platformFeatures = [
  {
    icon: "🎯",
    name: "AI Strategy Builder",
    description: "ICP, DMU, ABM & GTM in minutes",
  },
  {
    icon: "🔍",
    name: "Lead Discovery",
    description: "Qualified leads in 3 tiers",
  },
  {
    icon: "📊",
    name: "Built-in CRM",
    description: "Pipeline, team & deals in one place",
  },
  {
    icon: "🤖",
    name: "ARIA AI Coach",
    description: "Your AI sales mentor & meeting assistant",
  },
];

const intelligenceFeatures = [
  {
    icon: "📈",
    name: "Outreach Templates",
    description: "Personalized for every channel",
  },
  {
    icon: "👥",
    name: "Team Management",
    description: "Attendance, tasks & bonuses",
  },
  {
    icon: "📋",
    name: "Reports & Forecasting",
    description: "AI-powered insights",
  },
  {
    icon: "🔗",
    name: "Integrations",
    description: "Connect your existing tools",
  },
];

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <motion.line
        x1="3" y1="6" x2="21" y2="6"
        stroke="#0A1628"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        style={{ originX: "12px", originY: "6px" }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1="3" y1="12" x2="21" y2="12"
        stroke="#0A1628"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1="3" y1="18" x2="21" y2="18"
        stroke="#0A1628"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        style={{ originX: "12px", originY: "18px" }}
        transition={{ duration: 0.2 }}
      />
    </svg>
  );
}

function AvoraLogo() {
  return (
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: "24px",
        letterSpacing: "-0.5px",
        color: "#14B8A6",
        userSelect: "none",
      }}
    >
      AV
      <span style={{ color: "#14B8A6" }}>O</span>
      R
      <span style={{ color: "#F97316" }}>•</span>
      A
    </span>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "72px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "640px",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        padding: "24px",
        zIndex: 1000,
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        {/* Platform column */}
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              marginBottom: "12px",
              margin: "0 0 12px 0",
            }}
          >
            Platform
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {platformFeatures.map((feature) => (
              <Link
                key={feature.name}
                href="#"
                onClick={onClose}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "10px",
                    borderRadius: "10px",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F0FDFA")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>
                    {feature.icon}
                  </span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0A1628",
                        lineHeight: 1.3,
                      }}
                    >
                      {feature.name}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: "12px",
                        color: "#6B7280",
                        lineHeight: 1.4,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Intelligence column */}
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              marginBottom: "12px",
              margin: "0 0 12px 0",
            }}
          >
            Intelligence
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {intelligenceFeatures.map((feature) => (
              <Link
                key={feature.name}
                href="#"
                onClick={onClose}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "10px",
                    borderRadius: "10px",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F0FDFA")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>
                    {feature.icon}
                  </span>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0A1628",
                        lineHeight: 1.3,
                      }}
                    >
                      {feature.name}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        fontSize: "12px",
                        color: "#6B7280",
                        lineHeight: 1.4,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          borderTop: "1px solid #F3F4F6",
          marginTop: "16px",
          paddingTop: "14px",
        }}
      >
        <Link
          href="/features"
          onClick={onClose}
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#14B8A6",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "gap 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.gap = "8px";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.gap = "4px";
          }}
        >
          See all features →
        </Link>
      </div>
    </motion.div>
  );
}

function NavLink({
  item,
  onMegaOpen,
  onMegaClose,
  isMegaOpen,
  textColor,
}: {
  item: NavItem;
  onMegaOpen: () => void;
  onMegaClose: () => void;
  isMegaOpen: boolean;
  textColor: string;
}) {
  const [hovered, setHovered] = useState(false);

  const isActive = item.hasMega ? isMegaOpen : hovered;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => {
        setHovered(true);
        if (item.hasMega) onMegaOpen();
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (!item.hasMega) return;
      }}
    >
      <Link
        href={item.href}
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: textColor,
          textDecoration: "none",
          padding: "8px 4px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          position: "relative",
        }}
      >
        {item.label}
        {item.hasMega && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              transition: "transform 0.2s",
              transform: isMegaOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </Link>
      {/* Teal underline slide-in */}
      <motion.div
        initial={false}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "#14B8A6",
          borderRadius: "1px",
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const textColor = scrolled ? "#0A1628" : "#ffffff";
  const borderColor = scrolled ? "#E5E7EB" : "rgba(255,255,255,0.4)";

  useEffect(() => {
    const stored = localStorage.getItem("avora-lang");
    if (stored === "AR" || stored === "EN") {
      setLang(stored);
      document.documentElement.dir = stored === "AR" ? "rtl" : "ltr";
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = () => {
    const next = lang === "EN" ? "AR" : "EN";
    setLang(next);
    localStorage.setItem("avora-lang", next);
    document.documentElement.dir = next === "AR" ? "rtl" : "ltr";
  };

  const handleMegaOpen = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  };

  const handleMegaClose = () => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 120);
  };

  return (
    <>
      <motion.nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "72px",
          zIndex: 100,
          fontFamily: "Inter, sans-serif",
          display: "flex",
          alignItems: "center",
          transition: "background 0.25s, box-shadow 0.25s",
          background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled
            ? "0 1px 0 rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)"
            : "none",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: "24px",
                letterSpacing: "-0.5px",
                color: scrolled ? "#14B8A6" : "#ffffff",
                userSelect: "none",
              }}
            >
              AV<span style={{ color: scrolled ? "#14B8A6" : "#ffffff" }}>O</span>R
              <span style={{ color: "#F97316" }}>•</span>A
            </span>
          </Link>

          {/* Desktop nav links */}
          <div
            className="avora-desktop-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
            onMouseLeave={handleMegaClose}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                onMegaOpen={handleMegaOpen}
                onMegaClose={handleMegaClose}
                isMegaOpen={item.hasMega ? megaOpen : false}
                textColor={textColor}
              />
            ))}

            <AnimatePresence>
              {megaOpen && (
                <div
                  ref={megaRef}
                  onMouseEnter={handleMegaOpen}
                  onMouseLeave={handleMegaClose}
                >
                  <MegaMenu onClose={() => setMegaOpen(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right side actions */}
          <div
            className="avora-desktop-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                color: textColor,
                borderRadius: "8px",
                transition: "background 0.15s",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = scrolled ? "#F3F4F6" : "rgba(255,255,255,0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <GlobeIcon />
              {lang}
            </button>

            {/* Sign In */}
            <Link
              href="/sign-in"
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 600,
                color: textColor,
                textDecoration: "none",
                border: `1.5px solid ${borderColor}`,
                borderRadius: "10px",
                transition: "border-color 0.15s, color 0.15s",
                background: "transparent",
                display: "inline-flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#14B8A6";
                (e.currentTarget as HTMLAnchorElement).style.color = "#14B8A6";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = borderColor;
                (e.currentTarget as HTMLAnchorElement).style.color = textColor;
              }}
            >
              Sign In
            </Link>

            {/* Get Started Free */}
            <Link
              href="/sign-up"
              style={{
                padding: "8px 18px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#ffffff",
                textDecoration: "none",
                background: "#F97316",
                borderRadius: "10px",
                border: "1.5px solid #F97316",
                display: "inline-flex",
                alignItems: "center",
                transition: "background 0.15s, transform 0.1s",
                boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "#EA6C0A";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  "#F97316";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
              }}
            >
              Get Started Free
            </Link>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="avora-mobile-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
            }}
            aria-label="Toggle menu"
          >
            <HamburgerIcon isOpen={mobileOpen} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "#ffffff",
              zIndex: 999,
              fontFamily: "Inter, sans-serif",
              display: "flex",
              flexDirection: "column",
              paddingTop: "72px",
            }}
          >
            {/* Mobile nav links */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.22 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#0A1628",
                      textDecoration: "none",
                      padding: "14px 8px",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile bottom CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.22 }}
              style={{
                padding: "24px",
                borderTop: "1px solid #F3F4F6",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Language toggle mobile */}
              <button
                onClick={toggleLang}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  background: "#F9FAFB",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0A1628",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <GlobeIcon />
                {lang === "EN" ? "Switch to Arabic" : "Switch to English"}
              </button>

              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#0A1628",
                  textDecoration: "none",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                }}
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#ffffff",
                  textDecoration: "none",
                  background: "#F97316",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
                }}
              >
                Get Started Free
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .avora-desktop-nav {
            display: none !important;
          }
          .avora-desktop-actions {
            display: none !important;
          }
          .avora-mobile-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
