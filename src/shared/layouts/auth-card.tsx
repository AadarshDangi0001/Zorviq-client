import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-page">
      <div className="auth-shell">

        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            ZORVIQ
          </Link>
          <p>{subtitle}</p>
        </div>
        <section className="auth-card">
          <h1>{title}</h1>
          {children}
        </section>
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "rgba(255,255,255,0.6)", fontSize: "14px", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
