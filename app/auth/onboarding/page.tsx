"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  /* ---------------- PREFILL NAME (GOOGLE USERS) ---------------- */
  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return;

      const session = await res.json();
      if (session?.user?.name) {
        setName(session.user.name);
      }
    }

    loadUser();
  }, []);

  /* ---------------- HELPERS ---------------- */

  async function saveProfile(data: Partial<{
    name: string;
    username: string;
    isPublic: boolean;
  }>) {
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function checkUsernameAvailability(username: string) {
    const res = await fetch(
      `/api/user/check-username?username=${encodeURIComponent(username)}`
    );
    if (!res.ok) return false;
    const data = await res.json();
    return data.available === true;
  }

  /* ---------------- STEP 1: NAME ---------------- */

  async function handleNameNext() {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setError(null);
    setLoading(true);
    await saveProfile({ name });
    setLoading(false);
    setStep(2);
  }

  /* ---------------- STEP 2: USERNAME ---------------- */

  async function handleUsernameNext() {
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    const available = await checkUsernameAvailability(username);

    if (!available) {
      setLoading(false);
      setError("Username is already taken");
      return;
    }

    await saveProfile({ username });
    setLoading(false);
    setStep(3);
  }

  /* ---------------- STEP 3: VISIBILITY ---------------- */

  async function handleVisibilityNext() {
    setLoading(true);
    await saveProfile({ isPublic });
    setLoading(false);
    setStep(4);
  }

  /* ---------------- UI ---------------- */

  return (
      <div className="w-full max-w-md space-y-6">
        <p className="text-xs text-neutral-500">Step {step} of 4</p>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* STEP 1 — NAME */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">What’s your name?</h2>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <Button
              onClick={handleNameNext}
              disabled={loading}
              className="w-full"
            >
              Next
            </Button>
          </>
        )}

        {/* STEP 2 — USERNAME */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">Choose a username</h2>

            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="nakuldev"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
              >
                Back
              </Button>

              <Button
                onClick={handleUsernameNext}
                disabled={loading}
                className="w-full"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* STEP 3 — VISIBILITY */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold">
              Profile visibility
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => setIsPublic(true)}
                className={`w-full rounded-lg border p-4 text-left ${
                  isPublic ? "border-white" : "border-neutral-800"
                }`}
              >
                <p className="font-medium">Public</p>
                <p className="text-xs text-neutral-500">
                  Anyone can view your profile
                </p>
              </button>

              <button
                onClick={() => setIsPublic(false)}
                className={`w-full rounded-lg border p-4 text-left ${
                  !isPublic ? "border-white" : "border-neutral-800"
                }`}
              >
                <p className="font-medium">Private</p>
                <p className="text-xs text-neutral-500">
                  Only you can view it
                </p>
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full"
              >
                Back
              </Button>

              <Button
                onClick={handleVisibilityNext}
                disabled={loading}
                className="w-full"
              >
                Next
              </Button>
            </div>
          </>
        )}

        {/* STEP 4 — IMPORT (SKIPPED) */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold">
              Import bookmarks
            </h2>

            <p className="text-sm text-neutral-500">
              You can import from your browser now or later.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="w-full"
              >
                Back
              </Button>

              <Button
                onClick={() => {
                  window.location.href = "/inventory";
                }}
                className="w-full"
              >
                Finish
              </Button>
            </div>
          </>
        )}
      </div>
  );
}
