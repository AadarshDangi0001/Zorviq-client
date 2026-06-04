"use client";
import React from "react";
import { Search, Globe, Copy, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function WhyZorviq() {
  return (
    <section
      id="why"
      style={{
        padding: "60px 24px 100px",
        position: "relative",
        background: "#030303",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        
        {/* ── Section Header ── */}
        <div style={{ textAlign: "center", marginBottom: 60, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ 
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600, 
            fontSize: "clamp(2rem, 4vw, 2.5rem)", 
            color: "rgba(255,255,255,0.6)",
            margin: "0 0 4px",
            lineHeight: 1.2,
            letterSpacing: "-0.02em" 
          }}>
            Whatever your role
          </h2>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
            color: "#F2F2F2",
            margin: "0 0 20px",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
          }}>
            Zorviq gives you{" "}
            <span style={{
              background: "linear-gradient(128deg,#EDE9FE 0%,#C4B5FD 22%,#A78BFA 48%,#8B5CF6 74%,#7C3AED 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              superpowers
            </span>
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.05rem",
            color: "rgba(255,255,255,0.8)",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.6
          }}>
            From idea to live product, Zorviq adapts to the way you work turning every vision into something real & fast
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "16px",
        }} className="bento-grid">
          
          {/* Card 1: Product managers (col-span-4) */}
          <div className="bento-card" style={{ gridColumn: "span 4", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "24px 24px 0" }}>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Product managers
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>
                Go from insight to prototype in hours and test ideas with your team before the day is over.
              </p>
            </div>
            
            {/* Mockup */}
            <div style={{ padding: "24px", flex: 1, display: "flex", alignItems: "flex-end" }}>
              <div style={{
                background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px",
                fontFamily: "'Inter', sans-serif", fontSize: "12px", width: "100%",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
                borderBottom: "none", borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                marginBottom: "-24px" // bleed out the bottom
              }}>
                <p style={{ fontWeight: 600, color: "#fff", marginBottom: 2 }}>Version history</p>
                <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>Review changes, revert to a version.</p>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "8px 12px", display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                  <Search size={14} color="rgba(255,255,255,0.4)" />
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Search for a version</span>
                </div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>Bookmarked versions (1)</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{ fontWeight: 500, color: "#fff" }}>Landing page working</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>Published • Jun 7 6:00PM (Created)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Entrepreneurs (col-span-4) */}
          <div className="bento-card" style={{ gridColumn: "span 4", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "24px 24px 0" }}>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Entrepreneurs
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>
                Launch a full business in days, not months. From landing page to product, all in one flow.
              </p>
            </div>
            
            {/* Mockup */}
            <div style={{ padding: "24px", flex: 1, display: "flex", alignItems: "flex-end" }}>
              <div style={{
                background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px",
                fontFamily: "'Inter', sans-serif", fontSize: "12px", width: "100%",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
                borderBottom: "none", borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                marginBottom: "-24px" // bleed out the bottom
              }}>
                <p style={{ fontWeight: 600, color: "#fff", marginBottom: 16 }}>Publish your project</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: 6 }}>
                  <Globe size={14} color="rgba(255,255,255,0.4)" />
                  <span style={{ color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://dunder-mifflin.com</span>
                  <Copy size={12} color="rgba(255,255,255,0.4)" style={{ marginLeft: "auto", flexShrink: 0 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "rgba(255,255,255,0.6)" }}>
                  <Clock size={14} />
                  <span>1min ago</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
                  <span style={{ color: "#fff", fontWeight: 500 }}>Up to date</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Share it with friends and coworkers</p>
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                  <div style={{ width: 24, height: 24, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: "bold" }}>X</div>
                  <div style={{ width: 24, height: 24, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: "bold" }}>in</div>
                  <div style={{ width: 24, height: 24, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: "bold" }}>D</div>
                </div>
                <button style={{ width: "100%", background: "#2563EB", color: "#fff", border: "none", borderRadius: "6px", padding: "8px", fontWeight: 500, cursor: "pointer" }}>Update</button>
              </div>
            </div>
          </div>

          {/* Card 3: Marketers (col-span-4) */}
          <div className="bento-card" style={{ gridColumn: "span 4", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "24px 24px 0" }}>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Marketers
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>
                Spin up high-performing campaign pages in hours, with SEO and hosting built in.
              </p>
            </div>
            
            {/* Mockup */}
            <div style={{ padding: "24px", flex: 1, display: "flex", alignItems: "flex-end" }}>
              <div style={{
                background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px",
                fontFamily: "'Inter', sans-serif", fontSize: "12px", width: "100%", height: "220px", position: "relative",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
                borderBottom: "none", borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                marginBottom: "-24px" // bleed out the bottom
              }}>
                <p style={{ fontWeight: 600, color: "#fff", marginBottom: 20 }}>Unique visitors</p>
                
                {/* Y-axis */}
                <div style={{ position: "absolute", left: 16, top: 46, bottom: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "rgba(255,255,255,0.3)", fontSize: "9px", fontFamily: "monospace" }}>
                  <span>100</span>
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                </div>

                {/* Grid lines */}
                <div style={{ position: "absolute", left: 40, right: 0, top: 50, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                <div style={{ position: "absolute", left: 40, right: 0, top: 100, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                <div style={{ position: "absolute", left: 40, right: 0, top: 150, height: "1px", background: "rgba(255,255,255,0.05)" }} />
                <div style={{ position: "absolute", left: 40, right: 0, top: 200, height: "1px", background: "rgba(255,255,255,0.05)" }} />

                {/* Area Chart - Mocked with SVG */}
                <svg style={{ position: "absolute", left: 40, right: 0, top: 50, width: "calc(100% - 40px)", height: "150px", pointerEvents: "none" }} viewBox="0 0 200 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 C20,70 40,20 80,30 C120,40 160,0 200,10 L200,100 L0,100 Z" fill="url(#chart-grad)" />
                  <path d="M0,80 C20,70 40,20 80,30 C120,40 160,0 200,10" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4: Agencies (col-span-6) */}
          <div className="bento-card" style={{ gridColumn: "span 6", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            {/* Mockup Top */}
            <div style={{ padding: "0", background: "#050505", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", height: 260, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "120%", display: "flex", gap: "16px", transform: "rotate(-5deg) scale(1.1)", opacity: 0.8 }}>
                {/* Visual mocked layout of dashboards */}
                <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  <div style={{ height: 60, background: "#1A1A1A", borderRadius: 6 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ height: 80, background: "linear-gradient(135deg, #FF5722 0%, #FF9800 100%)", borderRadius: 6, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", right: -20, bottom: -20, width: 80, height: 80, background: "rgba(255,255,255,0.2)", borderRadius: "50%" }} />
                      <div style={{ padding: 12 }}>
                        <p style={{ color: "#fff", fontSize: 12, fontWeight: "bold", margin: 0 }}>We craft extraordinary</p>
                      </div>
                    </div>
                    <div style={{ height: 80, background: "#1A1A1A", borderRadius: 6 }} />
                  </div>
                </div>

                <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 12, flex: 1, marginTop: 40 }}>
                  <div style={{ height: 100, background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)", borderRadius: 6, position: "relative", overflow: "hidden" }}>
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                       <p style={{ color: "#fff", fontSize: 16, fontWeight: "bold", margin: 0 }}>AI Prompts</p>
                       <span style={{ marginTop: 8, background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 20, fontSize: 10, color: "#fff" }}>500,000+</span>
                    </div>
                  </div>
                  <div style={{ height: 60, background: "#1A1A1A", borderRadius: 6 }} />
                </div>
              </div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0A0A0A 5%, transparent 40%)", pointerEvents: "none" }} />
            </div>

            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Agencies
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: "0 auto", maxWidth: 400 }}>
                Multiply your impact: deliver more projects, faster, without scaling headcount.
              </p>
            </div>
          </div>

          {/* Card 5: Students & builders (col-span-6) */}
          <div className="bento-card" style={{ gridColumn: "span 6", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            
            {/* Mockup Top */}
            <div style={{ padding: "32px", background: "#050505", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                background: "#161616", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px",
                fontFamily: "'Inter', sans-serif", fontSize: "13px", width: "100%", maxWidth: 420,
                display: "flex", flexDirection: "column", gap: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
              }}>
                <p style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>Plan</p>
                {[
                  "Analyze current project structure and dependencies",
                  "Design todo app component structure",
                  "Create todo data types and interfaces",
                  "Implement todo state management",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
                {/* Faded out item */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: 0.3, maskImage: "linear-gradient(to right, black 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 50%, transparent 100%)" }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Create todo result component</span>
                </div>
              </div>
            </div>

            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Students & builders
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: "0 auto", maxWidth: 400 }}>
                Learn by doing. Take ideas from class or side projects and turn them into fully working apps.
              </p>
            </div>
          </div>
          
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .bento-card { grid-column: span 12 !important; }
        }
        @media (max-width: 600px) {
          #why { padding: 40px 16px 60px !important; }
          .bento-card > div:first-child { padding: 20px 20px 0 !important; }
          .bento-card > div:last-child { padding: 20px !important; }
        }
      `}</style>
    </section>
  );
}
