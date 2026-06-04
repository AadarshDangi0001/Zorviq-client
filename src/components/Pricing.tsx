"use client";
import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    desc: "Perfect for hobby projects",
    features: [
      "Unlimited AI Generations / month",
      "Custom Domain",
      "Basic Templates",
      "Community Support",
    ],
    cta: "Get Started",
    popular: false,
    ctaStyle: "outline",
  },
  {
    name: "Pro",
    monthlyPrice: 39,
    yearlyPrice: 29,
    desc: "For professionals & creators",
    features: [
      "Unlimited AI Generations",
      "Advanced AI Features",
      "Premium Templates",
      "Priority Support",
    ],
    cta: "Get Started",
    popular: true,
    ctaStyle: "solid",
  },
  {
    name: "Team",
    monthlyPrice: 99,
    yearlyPrice: 79,
    desc: "For teams & agencies",
    features: [
      "Everything in Pro",
      "Team Collaboration",
      "White Label",
      "Dedicated Support",
    ],
    cta: "Get Started",
    popular: false,
    ctaStyle: "outline",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      style={{ padding: "120px 24px", position: "relative" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center", marginBottom: "60px" }} className="pricing-header">
          <div>
            <span className="badge" style={{ marginBottom: "16px", display: "inline-flex" }}>
              <span className="badge-dot" /> Pricing
            </span>
            <h2 style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 900,
              fontSize: "clamp(2rem,4vw,3rem)", color: "#fff", lineHeight: 1.2,
            }}>
              Simple, transparent<br />pricing.
            </h2>
          </div>
          {/* Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setYearly(false)}
              style={{
                padding: "8px 20px", borderRadius: "8px", border: "none",
                background: !yearly ? "#fff" : "transparent",
                color: !yearly ? "#000" : "#555",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.2s",
              }}
            >Monthly</button>
            <button
              onClick={() => setYearly(true)}
              style={{
                padding: "8px 20px", borderRadius: "8px", border: "none",
                background: yearly ? "#fff" : "transparent",
                color: yearly ? "#000" : "#555",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.2s",
              }}
            >Yearly</button>
            {yearly && (
              <span style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#10B981",
                padding: "3px 10px", borderRadius: "9999px",
                fontSize: "0.72rem", fontWeight: 600,
              }}>Save 20%</span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "20px",
        }} className="pricing-cards">
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.popular ? "rgba(124,58,237,0.06)" : "#0D0D0D",
                border: plan.popular ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "32px",
                position: "relative",
                transition: "all 0.3s",
                transform: plan.popular ? "scale(1.02)" : "scale(1)",
                boxShadow: plan.popular ? "0 0 40px rgba(124,58,237,0.12)" : "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = plan.popular ? "scale(1.02) translateY(-4px)" : "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = plan.popular ? "scale(1.02)" : "scale(1)";
              }}
            >
              {plan.popular && (
                <div style={{
                  position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                  color: "#fff", padding: "4px 16px", borderRadius: "9999px",
                  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 20px rgba(124,58,237,0.5)",
                }}>Most Popular</div>
              )}

              <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: "6px" }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "24px" }}>{plan.desc}</p>

              {/* Price */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "1rem", color: "#888", fontWeight: 500 }}>$</span>
                  <span style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 900,
                    fontSize: "3rem", color: "#fff",
                  }}>
                    {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#555" }}>/month</span>
                </div>
              </div>

              {/* Features */}
              <div style={{ marginBottom: "32px" }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                      background: "rgba(124,58,237,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={10} style={{ color: "#A78BFA" }} />
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "#888" }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.1)",
                  background: plan.popular ? "linear-gradient(135deg,#7C3AED,#6366F1)" : "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: plan.popular ? "0 0 20px rgba(124,58,237,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!plan.popular) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                  else (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(124,58,237,0.6)";
                }}
                onMouseLeave={(e) => {
                  if (!plan.popular) (e.currentTarget as HTMLElement).style.background = "transparent";
                  else (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(124,58,237,0.3)";
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .pricing-cards { grid-template-columns: 1fr !important; }
          .pricing-header { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
        @media (max-width: 600px) {
          #pricing { padding: 60px 16px !important; }
          .pricing-cards > div { padding: 24px !important; }
        }
      `}</style>
    </section>
  );
}
