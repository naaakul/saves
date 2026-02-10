"use client";
import { signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

import React from "react";

const signOutButton = async () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg bg-red-500 text-white cursor-pointer"
    >
      Logout
    </button>
  );
};

export default signOutButton;
