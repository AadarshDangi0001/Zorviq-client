"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { authStore } from "@/lib/api";
import { useCurrentUser } from "@/react-query-config/queries/use-auth-queries";



/* ── Template data ─────────────────────────────────── */
const TEMPLATES = [
  { id: "forma", name: "Forma Interiors", category: "Furniture", img: "/templates/img1.jpg" },
  { id: "acentic", name: "Acentic AI", category: "Software", img: "/templates/img2.jpg" },
  { id: "iron", name: "IRON Dashboard", category: "Analytics", img: "/templates/img3.jpg" },
  { id: "destin", name: "Destin Adventures", category: "Travel", img: "/templates/img4.jpg" },
  { id: "gigi", name: "GiGi Energy", category: "FMCG", img: "/templates/img5.jpg" },
  { id: "saas", name: "SaaS Landing", category: "Software", img: "/templates/img6.png" },
];

/* ── Section ───────────────────────────────────────── */
export default function Templates() {
  const [hovered, setHovered] = useState<string | null>(null);
  const { data: user } = useCurrentUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(user || (typeof window !== "undefined" && authStore.get())));
  }, [user]);

  return (
    <section
      id="templates"
      style={{
        padding: "60px 24px",
        position: "relative",
        background: "#060608",
        overflow: "hidden",
      }}
    >
      {/* Ambient layer — extremely subtle top-left purple and bottom-right neutral */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 60% 40% at 15% 0%, rgba(124,58,237,0.055) 0%, transparent 100%)",
          "radial-gradient(ellipse 50% 35% at 85% 100%, rgba(255,255,255,0.018) 0%, transparent 100%)",
        ].join(","),
      }} />

      {/* Top fade from preceding section */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 64,
        background: "linear-gradient(to bottom, #060608, transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* ── Section header ── */}
        <div style={{ textAlign: "center", marginBottom: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span className="badge" style={{ marginBottom: 12, display: "inline-flex" }}>
            <span className="badge-dot" /> Templates
          </span>
          <h2 style={{
            fontFamily: "'Inter',sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.85rem,3vw,2.55rem)",
            color: "#F2F2F2",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            margin: "0 0 10px",
          }}>
            Launch faster with{" "}
            <span style={{
              background: "linear-gradient(128deg,#EDE9FE 0%,#C4B5FD 22%,#A78BFA 48%,#8B5CF6 74%,#7C3AED 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              AI website templates.
            </span>
          </h2>
          <p style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "0.92rem",
            color: "rgba(255,255,255,0.36)",
            maxWidth: 420,
            margin: "0 auto 20px",
            lineHeight: 1.68,
          }}>
            Production-ready no-code website templates for landing pages, portfolios, SaaS pages, and online stores.
          </p>

        </div>





        {/* ── Card grid ── */}
        <div className="tpl-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gridAutoRows: "1fr",
          gap: 20,
        }}>
          {TEMPLATES.map(({ id, name, category, img }) => {
            const on = hovered === id;
            return (
              <div
                key={id}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 14,
                  overflow: "hidden",
                  border: on
                    ? "1px solid rgba(255,255,255,0.13)"
                    : "1px solid rgba(255,255,255,0.07)",
                  cursor: "pointer",
                  transform: on ? "translateY(-3px)" : "translateY(0)",
                  transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s ease, border-color 0.25s ease",
                  boxShadow: on
                    ? "0 8px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.35)",
                  background: "#0A0A0E",
                }}
              >
                {/* Preview */}
                <div style={{ height: 164, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                  {img && (
                    <Image
                      src={img}
                      alt={`${name} AI website template preview`}
                      width={1024}
                      height={682}
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {/* Bottom vignette */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: 40,
                    background: "linear-gradient(to top, rgba(10,10,14,0.7) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }} />
                  {/* Hover overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: on ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
                    backdropFilter: on ? "blur(2px)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.25s ease, backdrop-filter 0.25s ease",
                    pointerEvents: on ? "auto" : "none",
                  }}>
                    {on && (
                      <Link
                        href={isLoggedIn ? "/dashboard" : "/signup"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: "#fff",
                          color: "#000", textDecoration: "none",
                          fontSize: "0.72rem", fontWeight: 650,
                          fontFamily: "'Inter',sans-serif",
                          padding: "7px 14px", borderRadius: 7,
                          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Use template <ArrowRight size={12} strokeWidth={2.2} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div style={{
                  padding: "11px 15px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: on ? "#0D0D12" : "#0A0A0E",
                  transition: "background 0.25s ease",
                }}>
                  <div>
                    <p style={{
                      fontSize: "0.8rem", fontWeight: 600,
                      color: on ? "#fff" : "rgba(255,255,255,0.78)",
                      fontFamily: "'Inter',sans-serif",
                      letterSpacing: "-0.015em",
                      transition: "color 0.2s ease",
                      margin: 0,
                      lineHeight: 1.2,
                    }}>{name}</p>
                    <p style={{
                      fontSize: "0.62rem",
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "'Inter',sans-serif",
                      marginTop: 2,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                    }}>{category}</p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <Link href={isLoggedIn ? "/dashboard" : "/signup"} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#FFFFFF",
            padding: "10px 24px",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            Browse AI website templates
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .tpl-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 560px) {
          .tpl-grid { grid-template-columns: 1fr !important; }
          #templates { padding: 40px 16px !important; }
        }
        #templates button:hover {
          color: rgba(255,255,255,0.7) !important;
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </section>
  );
}
