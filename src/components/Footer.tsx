"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Templates", "Updates"],
  Resources: ["Documentation", "Help Center", "Blog", "Changelog"],
  Company: ["About", "Careers", "Contact", "Affiliate"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

const socials = [
  { 
    label: "X", href: "#", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  { 
    label: "LinkedIn", href: "#", 
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  },
  { 
    label: "Discord", href: "#", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
      </svg>
    )
  },
  { 
    label: "GitHub", href: "#", 
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    )
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "80px 24px 40px",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr repeat(4,auto) 1fr",
          gap: "40px",
          marginBottom: "60px",
        }} className="footer-grid">
          {/* Logo + tagline */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <svg viewBox="75 55 300 340" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges" width="28" height="28">
                <polygon fill="white" points="198,116 195,120 188,122 180,124 168,126 157,128 153,130 150,132 148,134 145,136 143,138 140,140 138,142 136,146 136,148 225,148 225,138 225,134 224,132 222,130 218,128 214,126 211,124 204,120"/>
                <polygon fill="white" points="249,126 255,126 263,126 267,126 268,128 269,130 269,132 295,132 296,134 295,136 295,138 295,148 241,148 241,138 241,136 243,132 245,130 247,128"/>
                <polygon fill="white" points="143,138 140,140 138,142 136,146 135,150 134,154 133,158 132,162 131,166 130,170 129,174 128,176 126,180 125,184 126,186 128,190 130,196 132,200 134,204 136,206 138,210 140,214 142,216 144,218 149,220 155,222 160,224 165,226 171,228 295,228 300,226 305,224 310,220 310,216 306,212 301,208 294,204 304,200 307,196 309,192 311,188 313,184 314,180 315,176 314,172 313,168 310,164 307,160 303,156 299,152 295,148 293,144 291,140 291,138"/>
                <polygon fill="black" points="176,170 173,172 160,176 164,178 166,180 169,182 171,184 173,186 186,188 201,190 205,192 208,194 210,196 212,198 214,200 215,202 217,204 218,206 220,208 222,210 223,212 225,214 225,216 220,218 212,220 203,222 196,224 189,226 180,228 250,228 247,226 245,224 244,222 242,220 241,218 239,216 238,214 237,212 236,210 234,208 232,206 231,204 230,202 229,200 228,198 227,196 226,194 225,190 223,188 222,186 221,184 220,182 219,180 217,178 215,176 213,174 200,172 189,172"/>
                <polygon fill="black" points="271,174 288,174 298,174 303,176 301,178 300,180 299,182 298,184 298,186 297,188 297,190 296,192 296,194 296,196 299,198 303,200 293,200 290,198 288,196 285,194 284,192 283,190 281,188 280,186 276,184 275,182 274,180 272,178 271,176"/>
                <polygon fill="white" points="228,242 238,242 246,244 254,248 260,252 265,256 270,260 274,264 277,268 278,272 277,276 274,280 269,284 263,288 256,292 249,296 242,300 235,304 228,304 225,300 222,296 220,292 218,288 214,284 211,280 210,276 210,272 210,268 210,264 212,260 215,256 218,252 221,248"/>
                <polygon fill="white" points="309,232 313,232 316,234 317,238 318,242 318,246 318,250 319,254 319,258 319,262 319,266 319,270 318,274 316,278 313,282 310,284 306,282 302,278 299,274 297,270 294,266 294,262 294,258 295,254 297,250 299,246 302,242 305,238 307,234"/>
                <polygon fill="white" points="259,306 309,306 311,310 312,314 313,318 312,322 311,326 308,330 304,334 298,338 291,342 289,344 280,342 273,338 264,334 257,330 252,326 250,322 249,318 249,314 251,310"/>
              </svg>
              <span style={{
                fontFamily: "'Syne',sans-serif", fontWeight: 800,
                fontSize: "1.1rem", color: "#fff",
              }}>ZORVIQ</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.7, marginBottom: "20px" }}>
              The AI website builder<br />for the next generation.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", marginBottom: "16px" }}>
                {section}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {links.map((l) => (
                  <Link
                    key={l}
                    href="#"
                    style={{
                      fontSize: "0.8rem", color: "#444", textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#CCC")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
              Stay in the loop
            </h4>
            <p style={{ fontSize: "0.75rem", color: "#444", marginBottom: "14px", lineHeight: 1.6 }}>
              Get the latest updates and<br />news from Zorviq.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1, background: "#141414",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", padding: "9px 12px",
                  color: "#CCC", fontSize: "0.78rem", outline: "none",
                  minWidth: "0",
                }}
              />
              <button
                style={{
                  width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                  background: "linear-gradient(135deg,#7C3AED,#6366F1)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                }}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: "28px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <p style={{ fontSize: "0.75rem", color: "#333" }}>
            © 2026 Zorviq. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#555", textDecoration: "none", fontSize: "0.75rem",
                  fontWeight: 700, transition: "all 0.2s",
                }}
                title={s.label}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.5)";
                  (e.currentTarget as HTMLElement).style.color = "#A78BFA";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "#555";
                }}
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          footer { padding: 40px 16px 30px !important; }
        }
      `}</style>
    </footer>
  );
}
