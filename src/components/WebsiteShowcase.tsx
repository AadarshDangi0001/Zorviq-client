"use client";
import { Globe } from "lucide-react";

/* ── Browser Chrome ── */
function Chrome({ url }: { url: string }) {
  return (
    <div style={{ background: "#161616", padding: "7px 12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map(c => <span key={c} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c, opacity: 0.85 }} />)}
      <div style={{ flex: 1, marginLeft: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", padding: "3px 8px", fontSize: "0.42rem", color: "rgba(255,255,255,0.22)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: "4px" }}>
        <Globe size={7} style={{ opacity: 0.35 }} /> {url}
      </div>
    </div>
  );
}

function PortfolioCard() {
  return (
    <div style={{
      position: "absolute", width: "420px", left: "-80px", top: "80px",
      transformOrigin: "center", transform: "rotate(-12deg)",
      zIndex: 3, filter: "none", opacity: 0.85,
      borderRadius: "12px", overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)",
      pointerEvents: "none",
      background: "#fff",
    }}>
      <Chrome url="forma-interiors.com" />
      <img src="/templates/img1.jpg" alt="Forma Interiors Template" style={{ width: "100%", height: "260px", objectFit: "cover", objectPosition: "top", display: "block" }} />
    </div>
  );
}

function SaasCard() {
  return (
    <div style={{
      position: "absolute", width: "460px", left: "50%", top: "30px",
      transform: "translateX(-50%)", zIndex: 10,
      borderRadius: "13px", overflow: "hidden",
      boxShadow: "0 44px 108px rgba(0,0,0,0.72), 0 0 0 1px rgba(124,58,237,0.10), 0 0 48px rgba(124,58,237,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      background: "#fff",
    }}>
      <Chrome url="gigi-energy.com" />
      <img src="/templates/img5.jpg" alt="GiGi Energy Template" style={{ width: "100%", height: "320px", objectFit: "cover", objectPosition: "top", display: "block" }} />
    </div>
  );
}

function AgencyCard() {
  return (
    <div style={{
      position: "absolute", width: "420px", right: "-80px", top: "80px",
      transformOrigin: "center", transform: "rotate(12deg)",
      zIndex: 3, filter: "none", opacity: 0.85,
      borderRadius: "12px", overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)",
      pointerEvents: "none",
      background: "#fff",
    }}>
      <Chrome url="destin-adventures.com" />
      <img src="/templates/img4.jpg" alt="Destin Adventures Template" style={{ width: "100%", height: "260px", objectFit: "cover", objectPosition: "top", display: "block" }} />
    </div>
  );
}

/* ═══ Main Export ═══ */
export default function WebsiteShowcase() {
  return (
    <>
      <div style={{
        flex: "0 0 620px", position: "relative",
        height: "440px", minWidth: 0,
      }} className="hero-preview">
        {/* Ambient glow — reduced ~10% */}
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "380px", height: "260px", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, rgba(124,58,237,0.07) 50%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
        }} />
        <PortfolioCard />
        <AgencyCard />
        <SaasCard />

      </div>
      <style>{`
      `}</style>
    </>
  );
}