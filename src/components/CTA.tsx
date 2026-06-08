"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { authStore } from "@/lib/api";
import { useCurrentUser } from "@/react-query-config/queries/use-auth-queries";

export default function CTA() {
  const { data: user } = useCurrentUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(user || (typeof window !== "undefined" && authStore.get())));
  }, [user]);
  return (
    <section
      id="cta"
      style={{ padding: "80px 30px", position: "relative", overflow: "hidden" }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.15), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        position: "relative", 
        zIndex: 1, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        textAlign: "center" 
      }}>
        <span className="badge" style={{ marginBottom: "20px", display: "inline-flex" }}>
          <span className="badge-dot" /> Ready to Build
        </span>
        <h2 style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 900,
          fontSize: "clamp(2.5rem,5vw,4rem)", color: "#fff", lineHeight: 1.1,
          marginBottom: "16px",
        }}>
          Build the future.<br />
          <span style={{
            background: "linear-gradient(135deg,#A78BFA,#818CF8,#C4B5FD)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Your way.</span>
        </h2>
        <p style={{ fontSize: "1rem", color: "#555", lineHeight: 1.7, marginBottom: "36px", maxWidth: "500px" }}>
          Join thousands of creators who are building faster with AI.
        </p>
        <Link
          href={isLoggedIn ? "/dashboard" : "/signup"}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg,#7C3AED,#6366F1)",
            color: "#fff", textDecoration: "none",
            fontSize: "1rem", fontWeight: 700,
            padding: "16px 32px", borderRadius: "12px",
            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
            transition: "all 0.25s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 60px rgba(124,58,237,0.7)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(124,58,237,0.4)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
          id="cta-primary-button"
        >
          Start Building for Free <ArrowRight size={18} />
        </Link>
      </div>
      <style>{`
        @media (max-width: 600px) {
          #cta { padding: 60px 16px !important; }
        }
      `}</style>
    </section>
  );
}
