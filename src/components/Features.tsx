"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AIBuildDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#070707] border border-white/10">

      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),transparent_70%)]" />

      {/* Browser */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 2
        }}
        className="absolute inset-6 rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden"
      >

        {/* Browser Header */}
        <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />

          <div className="mx-auto bg-white/5 rounded-md px-4 py-1 text-xs text-white/40">
            zorviq.app
          </div>
        </div>

        {/* Prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatDelay: 2
          }}
          className="mx-6 mt-6 rounded-xl border border-violet-500/20 bg-black/60 p-4"
        >
          <div className="text-xs text-violet-300 mb-2">
            Prompt
          </div>

          <div className="text-white/80 text-sm">
            Build a fintech dashboard with stock analytics
          </div>
        </motion.div>

        {/* Progress */}
        <div className="px-6 mt-5">
          <div className="space-y-3">

            {[
              "Generating Layout",
              "Creating Components",
              "Writing Content",
              "Applying Theme"
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-green-400" />

                <span className="text-white/70 text-xs">
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Generated UI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0, 1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity
          }}
          className="px-6 mt-8"
        >

          {/* Hero */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{
              delay: 2,
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 4
            }}
            className="h-28 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />

          {/* Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">

            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: 2.5 + i * 0.2,
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 4
                }}
                className="h-20 rounded-xl bg-white/5 border border-white/10"
              />
            ))}
          </div>

          {/* Analytics */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              delay: 3.5,
              duration: 1,
              repeat: Infinity,
              repeatDelay: 4
            }}
            className="mt-5 h-28 rounded-xl bg-white/5 border border-white/10 flex items-end gap-3 p-4"
          >
            {[40, 70, 90, 55, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-md bg-violet-500"
                style={{ height: `${h}%` }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Deploy Badge */}
        <motion.div
          animate={{
            opacity: [0, 0, 0, 1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity
          }}
          className="absolute bottom-5 right-5"
        >
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2">
            <div className="text-green-400 text-xs">
              ✓ Live on zorviq.app
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating AI Orb */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 10,
          repeat: Infinity
        }}
        className="absolute right-6 top-10"
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-[1px]" />
      </motion.div>
    </div>
  );
}

export function AICopyDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#070707] border border-white/10 flex flex-col p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(109,40,217,0.15),transparent_70%)]" />
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
        <div className="text-xs text-white/40 font-mono">meridian-copy.md (Optimizing)</div>
      </div>
      <div className="relative z-10 p-5 rounded-xl border border-violet-500/30 bg-violet-500/10 mb-4">
        <div className="absolute -top-3 right-4 bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded">
          98% Match
        </div>
        <div className="text-[10px] text-violet-400 mb-2 font-mono uppercase tracking-wider">Hero Headline</div>
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold text-white leading-tight"
        >
          Turn data into decisions.<br />
          <span className="text-violet-400">In real time.</span>
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{ delay: i * 2, duration: 4, repeat: Infinity }}
            className="p-3 rounded-lg border border-white/5 bg-white/5"
          >
            <div className="text-[10px] text-white/40 mb-2 font-mono uppercase">Generating Variant {i}</div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-white/10 rounded-full" />
              <div className="h-1.5 w-4/5 bg-white/10 rounded-full" />
              <div className="h-1.5 w-2/3 bg-white/10 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DesignSystemDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#070707] border border-white/10 flex flex-col p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_70%)]" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="text-xs text-white/40 font-mono">tokens.json</div>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent"
        />
      </div>
      <div className="grid grid-cols-5 gap-3 mb-6 relative z-10">
        {['#0F62FE', '#161616', '#393939', '#F4F4F4', '#42BE65'].map((hex, i) => (
          <motion.div 
            key={hex}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ delay: i * 0.4, duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg border border-white/10 shadow-lg" style={{ backgroundColor: hex }} />
            <div className="text-[9px] text-white/40 font-mono">{hex}</div>
          </motion.div>
        ))}
      </div>
      <div className="space-y-3 relative z-10">
        {[
          { size: "text-2xl", font: "IBM Plex Sans", label: "Display" },
          { size: "text-lg", font: "Inter", label: "Heading" },
          { size: "text-xs", font: "JetBrains Mono", label: "Monospace" }
        ].map((t, i) => (
          <motion.div 
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.5, duration: 1, repeat: Infinity, repeatDelay: 3 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
          >
            <div className={`${t.size} text-white/80 font-bold`}>{t.font}</div>
            <div className="text-[10px] text-white/30 uppercase">{t.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DeployDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#070707] border border-white/10 flex flex-col p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
      <div className="flex-1 rounded-xl bg-black border border-white/10 p-4 font-mono text-xs overflow-hidden relative z-10">
        <div className="flex gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        <div className="space-y-2">
          <div className="text-white/60">$ zorviq deploy --prod</div>
          {[
            { text: "Building project...", color: "text-white/40" },
            { text: "Optimizing assets (147kb)", color: "text-white/40" },
            { text: "Deploying to edge network...", color: "text-white/40" },
            { text: "✓ Live on 38 global regions", color: "text-emerald-400" },
          ].map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.8, duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              className={line.color}
            >
              {line.text}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 4, duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            className="mt-6 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            zorviq.app/live
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function FigmaDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#070707] border border-white/10 p-6 flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(242,78,30,0.15),transparent_70%)]" />
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="px-3 py-1 rounded-md bg-white/5 text-[10px] text-white/50 font-mono">figma.com/file/...</div>
        <motion.div 
          animate={{ x: [0, 10, 0] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/30"
        >→</motion.div>
        <div className="px-3 py-1 rounded-md bg-violet-500/20 text-[10px] text-violet-400 font-mono">Code Generated</div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 relative z-10">
        <div className="rounded-xl border border-white/10 bg-[#1E1E1E] p-4 flex flex-col justify-center items-center relative overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-24 border border-[#0fA958] bg-[#0fA958]/10 rounded flex flex-col items-center justify-center relative p-2"
          >
            <div className="absolute top-0 left-0 bg-[#0fA958] text-white text-[8px] px-1">Frame</div>
            <div className="w-20 h-4 bg-white/20 rounded-sm mb-2" />
            <div className="w-24 h-2 bg-white/10 rounded-sm" />
          </motion.div>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-black p-4 font-mono text-[8px] sm:text-[10px] text-white/40 leading-relaxed overflow-hidden">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            <div className="text-violet-400">export default function Hero() {"{"}</div>
            <div className="pl-2">return (</div>
            <div className="pl-4 text-emerald-400">{"<div className=\"flex flex-col\">"}</div>
            <div className="pl-6 text-blue-400">{"<h1>Hello World</h1>"}</div>
            <div className="pl-4 text-emerald-400">{"</div>"}</div>
            <div className="pl-2">)</div>
            <div className="text-violet-400">{"}"}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function AnimationDemo() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[#070707] border border-white/10 p-6 flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(167,139,250,0.15),transparent_70%)]" />
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="text-xs text-white/40 font-mono">Motion Timeline</div>
        <div className="text-xs text-violet-400 font-mono animate-pulse">Running</div>
      </div>
      <div className="flex-1 space-y-4 relative z-10">
        {[
          { label: "Navbar", color: "bg-blue-500" },
          { label: "Hero Text", color: "bg-violet-500" },
          { label: "Cards", color: "bg-emerald-500" },
          { label: "Footer", color: "bg-fuchsia-500" },
        ].map((track, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-16 text-[10px] text-white/40 font-mono">{track.label}</div>
            <div className="flex-1 h-6 bg-white/5 rounded-md relative overflow-hidden">
              <motion.div
                initial={{ left: "-20%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "linear" }}
                className={`absolute top-1 bottom-1 w-1/3 rounded ${track.color} opacity-60`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    id: "generator",
    tag: "Core",
    title: "AI Page Generator",
    headline: "From prompt to production in seconds.",
    desc: "Describe your vision in plain English. ZORVIQ writes the code, structures the layout, and generates pixel-perfect pages — no templates, no drag-and-drop.",
    stat: "< 5s",
    statLabel: "avg. generation time",
    accent: "#7C3AED",
    preview: <AIBuildDemo />,
  },
  {
    id: "copy",
    tag: "Content",
    title: "AI Copywriting",
    headline: "Words that convert, written instantly.",
    desc: "Headlines, CTAs, feature descriptions — ZORVIQ writes on-brand copy that resonates. Trained on the highest-converting landing pages on the web.",
    stat: "3×",
    statLabel: "avg. conversion lift",
    accent: "#6D28D9",
    preview: <AICopyDemo />,
  },
  {
    id: "design",
    tag: "Design",
    title: "AI Design System",
    headline: "Brand-perfect, every single time.",
    desc: "ZORVIQ extracts your brand DNA — colors, typography, spacing — and applies it consistently across every component and page it generates.",
    stat: "100%",
    statLabel: "brand consistency",
    accent: "#8B5CF6",
    preview: <DesignSystemDemo />,
  },
  {
    id: "deploy",
    tag: "Deploy",
    title: "One Click Deploy",
    headline: "Live on the web in under a second.",
    desc: "No CI/CD configuration. No DNS headaches. Hit deploy and your site is globally distributed on edge infrastructure — instantly.",
    stat: "0.8s",
    statLabel: "avg. deploy time",
    accent: "#5B21B6",
    preview: <DeployDemo />,
  },
  {
    id: "figma",
    tag: "Import",
    title: "Figma to Website",
    headline: "Your designs, shipped — not translated.",
    desc: "Paste a Figma link. ZORVIQ reads your layers, extracts design tokens, and outputs clean, responsive React components that match your designs exactly.",
    stat: "1:1",
    statLabel: "design fidelity",
    accent: "#6D28D9",
    preview: <FigmaDemo />,
  },
  {
    id: "animations",
    tag: "Motion",
    title: "AI Animations",
    headline: "Motion that communicates, not decorates.",
    desc: "Purposeful reveals, smooth transitions, scroll-driven effects — ZORVIQ adds animation that enhances your UX without you writing a single keyframe.",
    stat: "60fps",
    statLabel: "guaranteed smooth",
    accent: "#7C3AED",
    preview: <AnimationDemo />,
  },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll-driven animation (pinned scroll-jacking)
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isMobile) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const scrollDistance = rect.height - window.innerHeight;
            if (scrollDistance > 0) {
              let progress = -rect.top / scrollDistance;
              progress = Math.max(0, Math.min(1, progress));
              const index = Math.min(
                FEATURES.length - 1,
                Math.floor(progress * FEATURES.length)
              );
              setActive(index);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const feat = FEATURES[active];

  // ── Mobile layout: all features stacked ──
  if (isMobile) {
    return (
      <section
        id="features"
        aria-label="Product features"
        style={{
          position: "relative",
          background: "linear-gradient(to bottom, #060606 0%, #060606 85%, #000000 100%)",
          padding: "60px 20px",
        }}
      >
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "4px 14px 4px 10px",
            borderRadius: "9999px",
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.18)",
            color: "#C4B5FD",
            fontSize: "0.635rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            fontFamily: "'Inter', sans-serif",
            textTransform: "uppercase" as const,
            marginBottom: "16px",
          }}>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#A78BFA", boxShadow: "0 0 8px rgba(167,139,250,0.9)" }} />
            Built for speed
          </span>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 7vw, 2.6rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            color: "#f4f4f4",
            marginBottom: "12px",
          }}>
            Every tool you need,{" "}
            <span style={{
              background: "linear-gradient(128deg, #EDE9FE 0%, #C4B5FD 25%, #A78BFA 55%, #7C3AED 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* All features stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "600px", margin: "0 auto" }}>
          {FEATURES.map((f) => (
            <div key={f.id} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              overflow: "hidden",
            }}>
              {/* Preview */}
              <div style={{ height: "240px", padding: "16px", position: "relative" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  background: `radial-gradient(circle at center, ${f.accent}15, transparent 60%)`,
                  pointerEvents: "none",
                }} />
                <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
                  {f.preview}
                </div>
              </div>
              {/* Text */}
              <div style={{ padding: "20px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "2px 10px", borderRadius: "9999px",
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#C4B5FD", fontSize: "0.55rem", fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase" as const,
                  fontFamily: "'Inter', sans-serif", marginBottom: "12px",
                }}>
                  {f.tag}
                </span>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  marginBottom: "10px",
                }}>
                  {f.headline}
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.65,
                }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Desktop layout: sticky scroll-jacking ──

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-label="Product features"
      style={{
        position: "relative",
        height: "250vh", // Reduced from 400vh to make scrolling through features much faster
        background: "linear-gradient(to bottom, #060606 0%, #060606 85%, #000000 100%)",
      }}
    >
      {/* Ambient glow — continuous with hero (Stays at the very top of the section) */}
      <div style={{
        position: "absolute",
        top: "-200px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "900px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, transparent 65%)",
        filter: "blur(80px)",
        pointerEvents: "none",
      }} />

      {/* Sticky container pins to the screen for 400vh */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: "1280px", width: "100%", margin: "0 auto", padding: "0 24px" }}>
          
          {/* Section header */}
          <div style={{
            textAlign: "center",
            marginBottom: "64px",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "4px 14px 4px 10px",
              borderRadius: "9999px",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.18)",
              color: "#C4B5FD",
              fontSize: "0.635rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              fontFamily: "'Inter', sans-serif",
              textTransform: "uppercase" as const,
              marginBottom: "20px",
            }}>
              <span style={{
                width: "4px", height: "4px", borderRadius: "50%",
                background: "#A78BFA",
                boxShadow: "0 0 8px rgba(167,139,250,0.9)",
              }} />
              Built for speed
            </span>

            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              color: "#f4f4f4",
              marginBottom: "14px",
            }}>
              Every tool you need,{" "}
              <span style={{
                background: "linear-gradient(128deg, #EDE9FE 0%, #C4B5FD 25%, #A78BFA 55%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>nothing you don&apos;t.</span>
            </h2>
          </div>

          {/* Main interactive panel */}
          <div style={{
            display: "flex",
            alignItems: "stretch", // Stretch so both columns are exactly the same height
            gap: "80px",
            position: "relative",
          }}>

            {/* Scroll Indicator Dots - Centered relative to main content */}
            <div style={{
              position: "absolute",
              left: "-32px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center", // Ensure dots are perfectly centered horizontally in their column
              gap: "16px",
              zIndex: 10,
            }}>
              {FEATURES.map((_, i) => (
                <div 
                  key={i}
                  style={{
                    width: "6px",
                    height: i === active ? "32px" : "6px",
                    borderRadius: "999px",
                    backgroundColor: i === active ? "#A78BFA" : "rgba(255,255,255,0.15)",
                    boxShadow: i === active ? "0 0 10px rgba(167,139,250,0.5)" : "none",
                    transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)", // Match the text transition!
                  }}
                />
              ))}
            </div>

            {/* Left Column: Crossfading text block */}
            <div style={{ flex: "1 1 40%", position: "relative", display: "flex", alignItems: "center" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{
                    opacity: 0,
                    y: 120,
                    position: "absolute",
                    width: "100%",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    position: "relative",
                  }}
                  exit={{
                    opacity: 0,
                    y: -120,
                    position: "absolute",
                    width: "100%",
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ width: "100%" }}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "3px 12px 3px 8px",
                    borderRadius: "9999px",
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "#C4B5FD",
                    fontSize: "0.55rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    fontFamily: "'Inter', sans-serif",
                    textTransform: "uppercase" as const,
                    marginBottom: "16px",
                  }}>
                    {feat.tag}
                  </span>

                  <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.8rem, 3vw, 2.4rem)", // Kept smaller font size
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "#fff",
                    marginBottom: "16px",
                  }}>
                    {feat.headline}
                  </h2>

                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "1rem", // Kept smaller font size
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.6,
                    fontWeight: 400,
                    maxWidth: "400px", // Kept less width
                  }}>
                    {feat.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Crossfading Preview Pane */}
            <div style={{
              flex: "1 1 60%",
              height: "50vh",
              minHeight: "400px",
              position: "relative",
            }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -30, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
              >
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "20px",
                  padding: "24px",
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  {/* Accent glow behind preview */}
                  <div style={{
                    position: "absolute",
                    top: "-50%", right: "-50%",
                    width: "200%", height: "200%",
                    background: `radial-gradient(circle at center, ${feat.accent}15, transparent 60%)`,
                    pointerEvents: "none",
                  }} />
                  {/* The actual preview component */}
                  <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
                    {feat.preview}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
      </div>
      
      <style>{`
        @keyframes blink {
          0%,100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}