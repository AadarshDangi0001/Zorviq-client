"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { authStore } from "@/lib/api";
import { useCurrentUser } from "@/react-query-config/queries/use-auth-queries";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 19,
    yearlyPrice: 15,
    desc: "Perfect for hobby projects",
    features: [
      "Unlimited AI generations",
      "Custom domain",
      "Basic templates",
      "Community support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 39,
    yearlyPrice: 29,
    desc: "For professionals and creators",
    features: [
      "Unlimited AI generations",
      "Advanced AI editing",
      "Premium templates",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Team",
    monthlyPrice: 99,
    yearlyPrice: 79,
    desc: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "White-label exports",
      "Dedicated support",
    ],
    popular: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { data: user } = useCurrentUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(user || (typeof window !== "undefined" && authStore.get())));
  }, [user]);

  return (
    <section id="pricing" style={{ padding: "96px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="pricing-header">
          <div>
            <span className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>
              <span className="badge-dot" /> Pricing
            </span>
            <h2 className="pricing-title">Simple, transparent pricing.</h2>
          </div>
          <div className="billing-toggle" aria-label="Billing cycle">
            <button type="button" onClick={() => setYearly(false)} className={!yearly ? "active" : ""}>
              Monthly
            </button>
            <button type="button" onClick={() => setYearly(true)} className={yearly ? "active" : ""}>
              Yearly
            </button>
            <span>Save 20%</span>
          </div>
        </div>

        <div className="pricing-cards">
          {plans.map((plan) => (
            <article key={plan.name} className={plan.popular ? "pricing-card popular" : "pricing-card"}>
              {plan.popular && <div className="popular-badge">Most popular</div>}
              <h3>{plan.name}</h3>
              <p>{plan.desc}</p>
              <div className="price-row">
                <span>$</span>
                <strong>{yearly ? plan.yearlyPrice : plan.monthlyPrice}</strong>
                <span>/month</span>
              </div>
              <div className="feature-list">
                {plan.features.map((feature) => (
                  <div key={feature}>
                    <span>
                      <Check size={12} />
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
              <Link href={isLoggedIn ? "/dashboard" : "/signup"} className={plan.popular ? "plan-cta solid" : "plan-cta"}>
                Get started
              </Link>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .pricing-header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 28px;
          align-items: end;
          margin-bottom: 40px;
        }
        .pricing-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.05;
          color: #fff;
          font-weight: 900;
          max-width: 620px;
        }
        .billing-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
        }
        .billing-toggle button {
          border: 0;
          border-radius: 7px;
          padding: 8px 14px;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          font-weight: 700;
        }
        .billing-toggle button.active {
          background: #fff;
          color: #050505;
        }
        .billing-toggle span {
          color: #34d399;
          font-size: 0.75rem;
          font-weight: 700;
          padding-inline: 8px;
        }
        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .pricing-card {
          position: relative;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 28px;
          background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018));
          box-shadow: 0 20px 70px rgba(0,0,0,0.24);
        }
        .pricing-card.popular {
          border-color: rgba(124,58,237,0.52);
          background: linear-gradient(180deg, rgba(124,58,237,0.16), rgba(255,255,255,0.026));
        }
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 24px;
          border-radius: 999px;
          padding: 5px 12px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 800;
        }
        .pricing-card h3 {
          color: #fff;
          font-size: 1.1rem;
          margin: 0 0 6px;
        }
        .pricing-card p {
          color: #a1a1aa;
          margin: 0 0 24px;
          font-size: 0.9rem;
        }
        .price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 24px;
        }
        .price-row strong {
          color: #fff;
          font-size: 3rem;
          line-height: 1;
          font-family: 'Syne', sans-serif;
        }
        .price-row span {
          color: #a1a1aa;
          font-weight: 700;
        }
        .feature-list {
          display: grid;
          gap: 12px;
          margin-bottom: 28px;
        }
        .feature-list div {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #d4d4d8;
          font-size: 0.9rem;
        }
        .feature-list span {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #c4b5fd;
          background: rgba(124,58,237,0.18);
        }
        .plan-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 12px;
          color: #fff;
          text-decoration: none;
          font-weight: 800;
          background: rgba(255,255,255,0.04);
        }
        .plan-cta.solid {
          border: 0;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
        }
        @media (max-width: 900px) {
          .pricing-header { grid-template-columns: 1fr; align-items: start; }
          .pricing-cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          #pricing { padding: 64px 16px !important; }
          .billing-toggle { width: 100%; flex-wrap: wrap; }
          .billing-toggle button { flex: 1; }
        }
      `}</style>
    </section>
  );
}
