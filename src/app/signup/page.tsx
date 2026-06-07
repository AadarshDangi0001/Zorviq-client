"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, registerUser } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerUser({ fullname, contact: contact.trim() || undefined, email, password });
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#fff" }}>ZORVIQ</span>
          </Link>
          <p style={{ color: "#555", fontSize: "0.85rem", marginTop: "8px" }}>Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "#0D0D0D",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "36px",
        }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#fff", marginBottom: "28px" }}>
            Get started
          </h1>

          <a href={`${API_BASE_URL}/api/auth/google`} style={{
            width: "100%", padding: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", color: "#CCC",
            fontSize: "0.9rem", fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            marginBottom: "20px", textDecoration: "none",
          }}>
            <span>G</span> Continue with Google
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: "0.75rem", color: "#444" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          </div>

          {[
            { label: "Full name", type: "text", value: fullname, setter: setFullname, placeholder: "Your name" },
            { label: "Contact", type: "tel", value: contact, setter: setContact, placeholder: "Optional 10 digit mobile number" },
            { label: "Email", type: "email", value: email, setter: setEmail, placeholder: "you@example.com" },
            { label: "Password", type: "password", value: password, setter: setPassword, placeholder: "Min. 6 characters" },
          ].map(({ label, type, value, setter, placeholder }) => (
            <div key={label} style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "6px", fontWeight: 500 }}>
                {label}
              </label>
              <input
                type={type}
                value={value}
                onChange={(event) => setter(event.target.value)}
                placeholder={placeholder}
                required={label !== "Contact"}
                minLength={label === "Password" ? 6 : undefined}
                pattern={label === "Contact" ? "\\d{10}" : undefined}
                style={{
                  width: "100%", padding: "11px 14px",
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", color: "#CCC", fontSize: "0.9rem",
                  outline: "none",
                }}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "16px", lineHeight: 1.5 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(135deg,#7C3AED,#6366F1)",
            border: "none", borderRadius: "10px",
            color: "#fff", fontWeight: 700, fontSize: "0.95rem",
            cursor: isSubmitting ? "default" : "pointer", marginTop: "8px",
            boxShadow: "0 0 24px rgba(124,58,237,0.3)",
            opacity: isSubmitting ? 0.65 : 1,
          }}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#444", marginTop: "20px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#A78BFA", textDecoration: "none" }}>Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
