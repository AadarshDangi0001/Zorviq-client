"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useLogin } from "@/react-query-config/mutations/use-auth-mutations";
import { Button } from "@/shared/components/button";
import { ErrorMessage } from "@/shared/components/error-message";
import { Input } from "@/shared/components/input";
import { AuthCard } from "@/shared/layouts/auth-card";

export default function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const err = new URLSearchParams(window.location.search).get("error");
      if (err) {
        setUrlError(decodeURIComponent(err));
      }
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <AuthCard title="Sign In" subtitle="Welcome back">
      <a href={`${API_BASE_URL}/api/auth/google`} className="auth-provider-link">
        <span>G</span> Continue with Google
      </a>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form onSubmit={handleSubmit}>
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
          placeholder="Your password"
          required
        />

        <ErrorMessage
          message={login.error instanceof Error ? login.error.message : (urlError || undefined)}
        />

        <Button
          type="submit"
          isLoading={login.isPending || login.isSuccess}
          disabled={!email || !password || login.isSuccess}
          style={{ width: "100%" }}
        >
          {login.isPending || login.isSuccess ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link href="/signup">Sign up free</Link>
      </p>
    </AuthCard>
  );
}
