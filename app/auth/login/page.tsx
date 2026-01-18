"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- GOOGLE LOGIN ---------------- */

  const handleGoogle = async () => {
    setError(null);

    await signIn.social(
      {
        provider: "google",
        callbackURL: "/inventory",
      },
      {
        onRequest: () => setLoading("google"),
        onResponse: () => setLoading(null),
        onError: (ctx) => {
          setLoading(null);

          const msg =
            (typeof ctx === "object" &&
              ctx !== null &&
              "error" in ctx &&
              typeof ctx.error === "string" &&
              ctx.error) ||
            "Invalid email or password";

          setError(msg);
        },
      },
    );
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("email");
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn.email(
      {
        email,
        password,
        callbackURL: "/inventory",
      },
      {
        onResponse: () => setLoading(null),
        onError: (ctx) => {
          setLoading(null);

          const msg =
            (typeof ctx === "object" &&
              ctx !== null &&
              "error" in ctx &&
              typeof ctx.error === "string" &&
              ctx.error) ||
            "Invalid email or password";

          setError(msg);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex gap-3 mb-6 text-xl">
        <p>login</p>
        <Link href="/auth/signup">
          <p className="text-muted-foreground">signup</p>
        </Link>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
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

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button type="submit" disabled={loading !== null} className="w-full">
          {loading === "email" ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Login"
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
