"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";

export default function SignupPage() {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- GOOGLE SIGNUP ---------------- */

  const handleGoogle = async () => {
    setError(null);

    await signIn.social(
      {
        provider: "google",
        callbackURL: "/auth/onboarding",
      },
      {
        onRequest: () => setLoading("google"),
        onResponse: () => setLoading(null),
        onError: () => {
          setLoading(null);
          setError("Google signup failed");
        },
      },
    );
  };

  /* ---------------- EMAIL SIGNUP ---------------- */

  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading("email");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // ✅ client-side validation
    if (password !== confirmPassword) {
      setLoading(null);
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        // ❌ do NOT set name here
      }),
    });

    setLoading(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data?.message ?? "Signup failed");
      return;
    }

    window.location.href = "/auth/onboarding";
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full max-w-sm space-y-2">
      {/* Tabs */}
      <div className="flex gap-3 mb-6 text-xl">
        <Link href="/auth/login">
          <p className="text-muted-foreground">login</p>
        </Link>
        <p>signup</p>
      </div>

      {/* Email signup */}
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="megan@fox.com"
            required
            className="border-b border-muted-foreground rounded-none"
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="border-b border-muted-foreground rounded-none"
          />
        </div>

        <div>
          <Label>Confirm password</Label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            className="border-b border-muted-foreground rounded-none"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" disabled={loading !== null} className="w-full">
          {loading === "email" ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center justify-center text-xs text-neutral-400">
        or
      </div>

      {/* Google */}
      <Button
        disabled={loading !== null}
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-lg border bg-secondry hover:bg-secondary text-forehead border-neutral-800 py-3"
      >
        {loading === "google" ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Image src="/google.svg" alt="Google" width={20} height={20} />
        )}
        Continue with Google
      </Button>
    </div>
  );
}
