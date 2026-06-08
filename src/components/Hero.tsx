"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import WebsiteShowcase from "@/components/WebsiteShowcase";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { authStore } from "@/lib/api";
import { useCurrentUser } from "@/react-query-config/queries/use-auth-queries";
import "@/i18n";

/* ─── Data ─────────────────────────────────────────── */
const PROMPTS = [
  "Portfolio for a motion designer",
  "Coffee shop with online ordering",
  "Landing page for an AI product",
  "Personal site for a developer",
  "E-commerce store for ceramics",
];

export default function Hero() {
  const { t } = useTranslation();
  const { data: user } = useCurrentUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(user || (typeof window !== "undefined" && authStore.get())));
  }, [user]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  const [promptIdx, setPromptIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const [inputVal, setInputVal] = useState("");

  const [promptHover, setPromptHover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Typewriter ─────────────────────────────────── */
  useEffect(() => {
    if (inputVal || isFocused) return;
    const target = PROMPTS[promptIdx];
    if (typing) {
      if (displayed.length < target.length) {
        typingRef.current = setTimeout(
          () => setDisplayed(target.slice(0, displayed.length + 1)),
          38
        );
      } else {
        typingRef.current = setTimeout(() => setTyping(false), 2000);
      }
    } else {
      if (displayed.length > 0) {
        typingRef.current = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          18
        );
      } else {
        typingRef.current = setTimeout(() => {
          setPromptIdx((i) => (i + 1) % PROMPTS.length);
          setTyping(true);
        }, 50);
      }
    }
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [displayed, typing, promptIdx, inputVal, isFocused]);


  /* ── Three.js wave grid — +25% visibility ───────── */
  useEffect(() => {
    let THREE: typeof import("three");
    let renderer: import("three").WebGLRenderer;
    let scene: import("three").Scene;
    let camera: import("three").PerspectiveCamera;
    let gridLines: import("three").LineSegments;
    let time = 0;
    /* Denser grid for more presence */
    const COLS = 32, ROWS = 20, SPACING = 1.6;

    async function init() {
      THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(52, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
      camera.position.set(0, 9, 15);
      camera.lookAt(0, 0, 0);
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setClearColor(0x000000, 0);

      const positions: number[] = [];
      const W = COLS * SPACING, D = ROWS * SPACING;
      for (let r = 0; r <= ROWS; r++) {
        const z = -D / 2 + r * SPACING;
        for (let c = 0; c < COLS; c++) {
          positions.push(-W / 2 + c * SPACING, 0, z, -W / 2 + (c + 1) * SPACING, 0, z);
        }
      }
      for (let c = 0; c <= COLS; c++) {
        const x = -W / 2 + c * SPACING;
        for (let r = 0; r < ROWS; r++) {
          positions.push(x, 0, -D / 2 + r * SPACING, x, 0, -D / 2 + (r + 1) * SPACING);
        }
      }
      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(positions);
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute("origPos", new THREE.BufferAttribute(posArr.slice(), 3));
      /* Opacity 0.28 — slightly reduced for better headline hierarchy */
      const mat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.28 });
      gridLines = new THREE.LineSegments(geo, mat);
      scene.add(gridLines);
      /* Lighter fog so grid reads more clearly */
      scene.fog = new THREE.FogExp2(0x060606, 0.026);
      animate(0);
    }

    let lastFrame = 0;
    function animate(ts: number) {
      animRef.current = requestAnimationFrame(animate);
      if (ts - lastFrame < 33) return;
      lastFrame = ts;
      time += 0.013;
      const posAttr = gridLines.geometry.getAttribute("position") as import("three").BufferAttribute;
      const origAttr = gridLines.geometry.getAttribute("origPos") as import("three").BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        const ox = origAttr.getX(i), oz = origAttr.getZ(i);
        /* Slightly higher amplitude: 0.58 → 0.72 */
        posAttr.setY(i, Math.sin(ox * 0.38 + time) * Math.cos(oz * 0.28 + time * 0.65) * 0.72);
      }
      posAttr.needsUpdate = true;
      camera.position.x += (mouseRef.current.x * 1.2 - camera.position.x) * 0.022;
      camera.position.y += (9 - mouseRef.current.y * 0.7 - camera.position.y) * 0.022;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    const onResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !renderer || !camera) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    init();
    // ResizeObserver watches the canvas element directly so we react to
    // ANY size change (fullscreen, sidebar open, font scaling, etc.)
    const ro = new ResizeObserver(onResize);
    if (canvasRef.current) ro.observe(canvasRef.current);
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      renderer?.dispose();
    };
  }, []);

  return (
    <section className="hero-section" style={{
      position: "relative",
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      paddingTop: "90px",
      paddingBottom: "70px",
      background: "#060606",
    }}>
      {/* Three.js canvas */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0, opacity: 1,
      }} />

      {/* Primary ambient glow — strengthened */}
      <div style={{
        position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)",
        width: "1300px", height: "620px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, rgba(109,40,217,0.09) 42%, transparent 68%)",
        filter: "blur(80px)", pointerEvents: "none", zIndex: 0,
      }} />
      {/* Secondary accent — bottom right */}
      <div style={{
        position: "absolute", bottom: "0", left: "58%", transform: "translateX(-50%)",
        width: "700px", height: "360px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 62%)",
        filter: "blur(70px)", pointerEvents: "none", zIndex: 0,
      }} />

      {/* Vignette — tighter to preserve grid in center */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, #060606 100%)",
      }} />

      {/* ═══ Main layout ═══ */}
      <div className="hero-layout" style={{
        position: "relative", zIndex: 2,
        width: "100%", maxWidth: "1320px",
        margin: "0 auto", padding: "0 56px",
        display: "flex",
        alignItems: "center",
        gap: "84px",
        animation: "heroIn 1s cubic-bezier(0.16,1,0.3,1) both",
      }}>

        {/* ── Left column ── */}
        <div className="hero-left" style={{ flex: "1 1 520px", minWidth: 0 }}>

          {/* Badge */}
          <div style={{
            marginBottom: "36px",
            animation: "heroIn 1s cubic-bezier(0.16,1,0.3,1) 0.08s both",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "5px 16px 5px 10px", borderRadius: "9999px",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.20)",
              color: "#C4B5FD",
              fontSize: "0.655rem",
              fontWeight: 500,
              letterSpacing: "0.07em",
              fontFamily: "'Inter', sans-serif",
              textTransform: "uppercase" as const,
              boxShadow: "0 0 20px rgba(124,58,237,0.08), inset 0 1px 0 rgba(167,139,250,0.07)",
            }}>
              <span style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: "#A78BFA",
                boxShadow: "0 0 10px rgba(167,139,250,0.9), 0 0 4px rgba(167,139,250,0.6)",
                flexShrink: 0,
              }} />
              {t("hero.badge")}
            </span>
          </div>

          {/* Headline — display weight, tighter tracking */}
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.9rem, 4.8vw, 4.6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.048em",
            marginBottom: "32px",
            fontFeatureSettings: "'cv02','cv03','cv04','cv11'",
            animation: "heroIn 1s cubic-bezier(0.16,1,0.3,1) 0.12s both",
          }}>
            <span style={{ display: "block", color: "#f4f4f4", marginBottom: "2px" }}>
              {t("hero.title1")}
            </span>
            <span style={{
              display: "block",
              background: "linear-gradient(128deg, #EDE9FE 0%, #C4B5FD 22%, #A78BFA 48%, #8B5CF6 74%, #7C3AED 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "2px",
            }}>
              {t("hero.title2")}
            </span>
            <span style={{ display: "block", color: "#f4f4f4" }}>
              {t("hero.title3")}
            </span>
          </h1>

          {/* Subtext — stronger presence */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.62)",
            lineHeight: 1.75,
            maxWidth: "400px",
            marginBottom: "52px",
            fontWeight: 400,
            letterSpacing: "0.005em",
            animation: "heroIn 1s cubic-bezier(0.16,1,0.3,1) 0.18s both",
          }}>
            {t("hero.subheading")}
          </p>

          {/* ── Prompt input ── */}
          <div style={{
            width: "100%",
            maxWidth: "680px",
            marginBottom: "20px",
            position: "relative",
            animation: "heroIn 1s cubic-bezier(0.16,1,0.3,1) 0.24s both",
          }}>
            {/* Ambient glow behind input */}
            <div className="prompt-glow" style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "130%", height: "280%",
              borderRadius: "50%",
              background: promptHover
                ? "radial-gradient(ellipse, rgba(124,58,237,0.13) 0%, transparent 65%)"
                : "radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 65%)",
              filter: "blur(50px)",
              pointerEvents: "none",
              transition: "all 0.7s ease",
              zIndex: 0,
            }} />

            <div
              className="prompt-input-wrapper"
              onMouseEnter={() => setPromptHover(true)}
              onMouseLeave={() => setPromptHover(false)}
              style={{
                position: "relative", zIndex: 1,
                background: "rgba(10,10,10,0.96)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: promptHover
                  ? "1px solid rgba(124,58,237,0.32)"
                  : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "13px",
                padding: "7px 7px 7px 18px",
                boxShadow: promptHover
                  ? "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
                  : "0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.02)",
                display: "flex", alignItems: "center",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                cursor: "text",
              }}
            >
              <Sparkles className="prompt-sparkles" size={14} color={promptHover ? "#A78BFA" : "#6D28D9"} style={{
                flexShrink: 0, opacity: 0.75,
                transition: "all 0.3s ease",
              }} />
              <div className="prompt-input-container" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", padding: "0 16px", overflow: "hidden" }}>
                <input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.84rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.01em",
                    position: "relative",
                    zIndex: 2,
                  }}
                  placeholder={isFocused ? "Describe your project..." : ""}
                />
                {(!inputVal && !isFocused) && (
                  <div style={{
                    position: "absolute",
                    left: "16px",
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                    color: "rgba(255,255,255,0.30)",
                    fontSize: "0.84rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                    zIndex: 1,
                  }}>
                    {displayed}
                    <span style={{
                      display: "inline-block", width: "1.5px", height: "14px",
                      background: "#7C3AED", marginLeft: "3px",
                      animation: "blink 1s step-end infinite",
                      opacity: 0.85,
                    }} />
                  </div>
                )}
              </div>
              <Link className="prompt-cta-button" href={isLoggedIn ? "/dashboard" : "/signup"} style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                color: "#fff", textDecoration: "none",
                fontSize: "0.78rem", fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                height: "38px", padding: "0 22px", borderRadius: "9px",
                whiteSpace: "nowrap", flexShrink: 0,
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.10) inset, 0 0 20px rgba(124,58,237,0.22)",
                letterSpacing: "0.012em",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.12) inset, 0 0 32px rgba(124,58,237,0.40)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.10) inset, 0 0 20px rgba(124,58,237,0.22)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {t("hero.cta_primary")} <ArrowRight size={13} strokeWidth={2} />
              </Link>
            </div>
          </div>

        </div>

        {/* ── Right: Website Showcase ── */}
        <WebsiteShowcase />

      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtlePulse {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.45; }
        }

        /* ── Hero Responsive ── */
        @media (max-width: 1024px) {
          .hero-layout { gap: 48px !important; padding: 0 32px !important; }
        }
        @media (max-width: 900px) {
          .hero-preview { display: none !important; }
          .hero-layout {
            flex-direction: column !important;
            padding: 0 24px !important;
            gap: 40px !important;
            align-items: flex-start !important;
          }
          .hero-section {
            padding-top: 100px !important;
            padding-bottom: 60px !important;
            justify-content: flex-start !important;
          }
          .hero-left { flex: none !important; width: 100% !important; }
          
          /* Hide input and show only button on phones/tablets */
          .prompt-input-wrapper {
             background: transparent !important;
             border: none !important;
             box-shadow: none !important;
             padding: 0 !important;
             display: block !important;
          }
          .prompt-glow, .prompt-sparkles, .prompt-input-container {
             display: none !important;
          }
          .prompt-cta-button {
             width: 100% !important;
             height: 52px !important;
             font-size: 0.95rem !important;
             justify-content: center !important;
          }
        }
        @media (max-width: 600px) {
          .hero-layout { padding: 0 16px !important; }
          .hero-section { padding-top: 90px !important; }
        }
      `}</style>
    </section>
  );
}
