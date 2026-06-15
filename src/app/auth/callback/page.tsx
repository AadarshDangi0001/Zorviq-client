"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authToken } from "@/lib/http/auth-token";
import { authService } from "@/services/auth.service";
import Loader from "@/components/Loader";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login?error=No token received");
      return;
    }

    // Save token to localStorage and cookie
    authToken.set(token, undefined);

    // Fetch user details using the token
    authService
      .me()
      .then(() => {
        router.replace("/dashboard");
      })
      .catch((err) => {
        authToken.clear();
        const msg = err instanceof Error ? err.message : "Failed to load user profile";
        router.replace(`/login?error=${encodeURIComponent(msg)}`);
      });
  }, [searchParams, router]);

  return <Loader />;
}

export default function AuthCallbackPage() {
  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "#060608" }}>
      <Suspense fallback={<Loader />}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
