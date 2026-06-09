"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useRegister } from "@/react-query-config/mutations/use-auth-mutations";
import { Button } from "@/shared/components/button";
import { ErrorMessage } from "@/shared/components/error-message";
import { Input } from "@/shared/components/input";
import { AuthCard } from "@/shared/layouts/auth-card";

export default function SignUpPage() {
  const router = useRouter();
  const register = useRegister();
  const [fullname, setFullname] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    register.mutate(
      { fullname, contact: contact.trim() || undefined, email, password },
      { onSuccess: () => router.push("/login?registered=1") },
    );
  };

  return (
    <AuthCard title="Get started" subtitle="Create your free account">
      <a href={`${API_BASE_URL}/api/auth/google`} className="auth-provider-link">
        <span>G</span> Continue with Google
      </a>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          label="Full name"
          type="text"
          value={fullname}
          onChange={(event) => setFullname(event.target.value)}
          placeholder="Your name"
          required
        />
        <Input
          label="Contact"
          type="tel"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="Optional 10 digit mobile number"
          pattern="\\d{10}"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Min. 6 characters"
          minLength={6}
          required
        />

        <ErrorMessage
          message={register.error instanceof Error ? register.error.message : undefined}
        />

        <Button
          type="submit"
          isLoading={register.isPending || register.isSuccess}
          disabled={!fullname || !email || password.length < 6 || register.isSuccess}
          style={{ width: "100%", marginTop: 8 }}
        >
          {register.isPending || register.isSuccess ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </AuthCard>
  );
}
