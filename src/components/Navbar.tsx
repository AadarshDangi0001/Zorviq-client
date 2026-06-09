"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { authStore } from "@/lib/api";
import { useCurrentUser } from "@/react-query-config/queries/use-auth-queries";
import { useLogout } from "@/react-query-config/mutations/use-auth-mutations";

// ─── Mega-menu data ───────────────────────────────────────────────────────────

const solutionsData = {
  whoIsItFor: [
    { label: "Founders", desc: "Ship before you pitch." },
    { label: "Sales", desc: "Build the demo live." },
    { label: "Product managers", desc: "Prototype, don't spec." },
    { label: "Designers", desc: "Your designs, built." },
    { label: "Marketers", desc: "Launch pages in minutes." },
    { label: "Ops", desc: "Tools that fit your flow." },
    { label: "People", desc: "HR tools your team loves." },
  ],
  useCases: [
    { label: "Prototyping", desc: "Proof of concept in hours." },
    { label: "Internal tools", desc: "Built for your team." },
  ],
};

const resourcesData = {
  links: [
    { label: "Blog", desc: "Ideas, updates, stories." },
    { label: "Partners", desc: "Build more together." },
    { label: "Templates", desc: "Begin with a template." },
    { label: "Guides", desc: "Learn as you build." },
    { label: "Connectors", desc: "Build from what you already use." },
    { label: "Docs", desc: "Everything under the hood." },
  ],
  announcement: {
    title: "How Zorviq protects your apps automatically",
  },
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const megaMenuStyle: React.CSSProperties = {
  display: "flex",
  gap: "0",
  padding: "24px 28px",
  minWidth: "640px",
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "0.72rem",
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 600,
  marginBottom: "14px",
};

const dividerStyle: React.CSSProperties = {
  width: "1px",
  background: "rgba(255,255,255,0.07)",
  margin: "0 28px",
  flexShrink: 0,
};

// ─── DropdownItem ─────────────────────────────────────────────────────────────

function DropdownItem({ label, desc }: { label: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        padding: "6px 0",
        transition: "opacity 0.15s",
        opacity: hovered ? 1 : 0.85,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: "0.93rem",
          color: hovered ? "#a78bfa" : "#e2e2e2",
          transition: "color 0.15s",
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: hovered ? "#7c6aad" : "#888",
          lineHeight: 1.4,
          transition: "color 0.15s",
        }}
      >
        {desc}
      </div>
    </div>
  );
}

// ─── SolutionsDropdown ────────────────────────────────────────────────────────

function SolutionsDropdown() {
  const leftCol = solutionsData.whoIsItFor.filter((_, i) => i % 2 === 0);
  const rightCol = solutionsData.whoIsItFor.filter((_, i) => i % 2 !== 0);

  return (
    <div style={megaMenuStyle}>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <div style={sectionLabelStyle}>Who is it for?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {leftCol.map((item) => (
              <DropdownItem key={item.label} {...item} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rightCol.map((item) => (
              <DropdownItem key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>

      <div style={dividerStyle} />

      <div style={{ width: "200px", flexShrink: 0 }}>
        <div style={sectionLabelStyle}>Use cases</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {solutionsData.useCases.map((item) => (
            <DropdownItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ResourcesDropdown ────────────────────────────────────────────────────────

function ResourcesDropdown() {
  const leftLinks = resourcesData.links.slice(0, 4);
  const rightLinks = resourcesData.links.slice(4);

  const [learnHovered, setLearnHovered] = useState(false);

  return (
    <div style={megaMenuStyle}>
      <div style={{ flex: "1 1 0", minWidth: 0 }}>
        <div style={sectionLabelStyle}>Resources</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {leftLinks.map((item) => (
              <DropdownItem key={item.label} {...item} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rightLinks.map((item) => (
              <DropdownItem key={item.label} {...item} />
            ))}
          </div>
        </div>
      </div>

      <div style={dividerStyle} />

      <div style={{ width: "220px", flexShrink: 0 }}>
        <div style={sectionLabelStyle}>Announcement</div>
        <div
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "12px",
            height: "110px",
            background:
              "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #c4b5fd 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.88rem",
            color: "#e2e2e2",
            marginBottom: "8px",
            lineHeight: 1.4,
          }}
        >
          {resourcesData.announcement.title}
        </div>
        <span
          onMouseEnter={() => setLearnHovered(true)}
          onMouseLeave={() => setLearnHovered(false)}
          style={{
            fontSize: "0.82rem",
            color: learnHovered ? "#a78bfa" : "#aaa",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "color 0.15s",
            fontWeight: 500,
          }}
        >
          Learn more <span style={{ fontSize: "0.9em" }}>›</span>
        </span>
      </div>
    </div>
  );
}

// ─── Nav items config ─────────────────────────────────────────────────────────

type NavItem =
  | { label: string; href: string; dropdown?: never }
  | { label: string; href?: never; dropdown: "solutions" | "resources" };

const navItems: NavItem[] = [
  { label: "Solutions", dropdown: "solutions" },
  { label: "Resources", dropdown: "resources" },
  { label: "Community", href: "/#community" },
  { label: "Pricing", href: "/#pricing" },
];

// ─── NavLinkItem ──────────────────────────────────────────────────────────────

function NavLinkItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  if (!item.dropdown) {
    return (
      <Link
        href={item.href!}
        style={{
          color: "#888",
          textDecoration: "none",
          fontSize: "0.875rem",
          fontWeight: 500,
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button */}
      <button
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: open ? "#fff" : "#888",
          fontSize: "0.875rem",
          fontWeight: 500,
          padding: "0",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
        aria-expanded={open}
      >
        {item.label}
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown — absolute to the containing header pill */}
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          marginTop: "10px",
          background: "#060606",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(124,58,237,0.15)",
          borderRadius: "14px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(-8px)",
          transition:
            "opacity 0.22s cubic-bezier(0.4,0,0.2,1), transform 0.22s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 2200,
          overflow: "hidden",
        }}
      >
        {item.dropdown === "solutions" ? <SolutionsDropdown /> : <ResourcesDropdown />}
      </div>
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(user || (typeof window !== "undefined" && authStore.get())));
  }, [user]);

  const handleLogout = async () => {
    await logout.mutateAsync();
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      data-inline-editor-ignore
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        padding: scrolled ? "12px 24px" : "0 0",
        transition: "padding 0.4s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: scrolled ? "fit-content" : "100%",
          maxWidth: scrolled ? "960px" : "100%",
          pointerEvents: "auto",
          willChange: "width, max-width, background, border-radius, box-shadow",
          transition:
            "width 0.4s cubic-bezier(0.4,0,0.2,1), max-width 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s cubic-bezier(0.4,0,0.2,1), border-radius 0.4s cubic-bezier(0.4,0,0.2,1), border 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1)",
          background: scrolled ? "rgba(6,6,6,0.85)" : "transparent",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: scrolled ? "9999px" : "0px",
          border: scrolled
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div
          style={{
            padding: scrolled ? "0 20px" : "0 24px",
            height: scrolled ? "52px" : "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            transition:
              "padding 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div style={{ width: "32px", height: "32px" }}>
              <svg
                viewBox="75 55 300 340"
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="crispEdges"
                width="32"
                height="32"
              >
                <polygon fill="white" points="198,116 195,120 188,122 180,124 168,126 157,128 153,130 150,132 148,134 145,136 143,138 140,140 138,142 136,146 136,148 225,148 225,138 225,134 224,132 222,130 218,128 214,126 211,124 204,120" />
                <polygon fill="white" points="249,126 255,126 263,126 267,126 268,128 269,130 269,132 295,132 296,134 295,136 295,138 295,148 241,148 241,138 241,136 243,132 245,130 247,128" />
                <polygon fill="white" points="143,138 140,140 138,142 136,146 135,150 134,154 133,158 132,162 131,166 130,170 129,174 128,176 126,180 125,184 126,186 128,190 130,196 132,200 134,204 136,206 138,210 140,214 142,216 144,218 149,220 155,222 160,224 165,226 171,228 295,228 300,226 305,224 310,220 310,216 306,212 301,208 294,204 304,200 307,196 309,192 311,188 313,184 314,180 315,176 314,172 313,168 310,164 307,160 303,156 299,152 295,148 293,144 291,140 291,138" />
                <polygon fill="black" points="176,170 173,172 160,176 164,178 166,180 169,182 171,184 173,186 186,188 201,190 205,192 208,194 210,196 212,198 214,200 215,202 217,204 218,206 220,208 222,210 223,212 225,214 225,216 220,218 212,220 203,222 196,224 189,226 180,228 250,228 247,226 245,224 244,222 242,220 241,218 239,216 238,214 237,212 236,210 234,208 232,206 231,204 230,202 229,200 228,198 227,196 226,194 225,190 223,188 222,186 221,184 220,182 219,180 217,178 215,176 213,174 200,172 189,172" />
                <polygon fill="black" points="271,174 288,174 298,174 303,176 301,178 300,180 299,182 298,184 298,186 297,188 297,190 296,192 296,194 296,196 299,198 303,200 293,200 290,198 288,196 285,194 284,192 283,190 281,188 280,186 276,184 275,182 274,180 272,178 271,176" />
                <polygon fill="white" points="228,242 238,242 246,244 254,248 260,252 265,256 270,260 274,264 277,268 278,272 277,276 274,280 269,284 263,288 256,292 249,296 242,300 235,304 228,304 225,300 222,296 220,292 218,288 214,284 211,280 210,276 210,272 210,268 210,264 212,260 215,256 218,252 221,248" />
                <polygon fill="white" points="309,232 313,232 316,234 317,238 318,242 318,246 318,250 319,254 319,258 319,262 319,266 319,270 318,274 316,278 313,282 310,284 306,282 302,278 299,274 297,270 294,266 294,262 294,258 295,254 297,250 299,246 302,242 305,238 307,234" />
                <polygon fill="white" points="259,306 309,306 311,310 312,314 313,318 312,322 311,326 308,330 304,334 298,338 291,342 289,344 280,342 273,338 264,334 257,330 252,326 250,322 249,318 249,314 251,310" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: scrolled ? "1.05rem" : "1.2rem",
                color: "#FFFFFF",
                letterSpacing: "0.02em",
                transition: "font-size 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              ZORVIQ
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: "28px" }}
            className="hidden-mobile"
          >
            {navItems.map((item) => (
              <NavLinkItem key={item.label} item={item} />
            ))}
          </nav>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    color: "#888",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    padding: "8px 16px",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  className="hidden-mobile"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                    color: "#fff",
                    border: "none",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    padding: scrolled ? "7px 16px" : "9px 20px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.10) inset, 0 0 20px rgba(124,58,237,0.22)",
                    whiteSpace: "nowrap",
                  }}
                  className="hidden-mobile"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 1px 0 rgba(255,255,255,0.12) inset, 0 0 32px rgba(124,58,237,0.40)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 1px 0 rgba(255,255,255,0.10) inset, 0 0 20px rgba(124,58,237,0.22)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    color: "#888",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    padding: "8px 16px",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  className="hidden-mobile"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    padding: scrolled ? "7px 16px" : "9px 20px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.10) inset, 0 0 20px rgba(124,58,237,0.22)",
                    whiteSpace: "nowrap",
                  }}
                  className="hidden-mobile"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 1px 0 rgba(255,255,255,0.12) inset, 0 0 32px rgba(124,58,237,0.40)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 1px 0 rgba(255,255,255,0.10) inset, 0 0 20px rgba(124,58,237,0.22)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  Start Building →
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "none",
                padding: "4px",
              }}
              className="show-mobile"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            style={{
              background: "rgba(0,0,0,0.97)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              borderRadius: scrolled ? "0 0 24px 24px" : "0",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {navItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setMobileExpanded(
                          mobileExpanded === item.label ? null : item.label
                        )
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#CCC",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        fontSize: "1rem",
                        fontWeight: 500,
                        padding: "10px 0",
                        textAlign: "left",
                      }}
                    >
                      {item.label}
                      <ChevronDown
                        size={16}
                        style={{
                          transition: "transform 0.2s",
                          transform:
                            mobileExpanded === item.label
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {mobileExpanded === item.label && (
                      <div
                        style={{
                          paddingLeft: "16px",
                          paddingBottom: "8px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {(item.dropdown === "solutions"
                          ? solutionsData.whoIsItFor.concat(
                              solutionsData.useCases
                            )
                          : resourcesData.links
                        ).map((s) => (
                          <div key={s.label}>
                            <div
                              style={{
                                color: "#e2e2e2",
                                fontWeight: 600,
                                fontSize: "0.88rem",
                              }}
                            >
                              {s.label}
                            </div>
                            <div
                              style={{ color: "#666", fontSize: "0.76rem" }}
                            >
                              {s.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      color: "#CCC",
                      textDecoration: "none",
                      fontSize: "1rem",
                      fontWeight: 500,
                      display: "block",
                      padding: "10px 0",
                    }}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    padding: "12px 20px",
                    borderRadius: "8px",
                    textAlign: "center",
                    marginTop: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    setMobileOpen(false);
                    await handleLogout();
                  }}
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                    color: "#fff",
                    border: "none",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    padding: "12px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  padding: "12px 20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                Start Building →
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
}
