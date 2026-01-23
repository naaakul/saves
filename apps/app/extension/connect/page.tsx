"use client";

import { useEffect } from "react";

export default function ExtensionConnectPage() {
  useEffect(() => {
    fetch("/api/extension/handshake", { method: "POST" })
      .then((res) => res.json())
      .then(({ token }) => {
        if (!token) return;

        // 🔑 redirect ONCE to a different page
        window.location.replace(
          `/extension/done?token=${encodeURIComponent(token)}`
        );
      });
  }, []);

  return <p>Connecting extension…</p>;
}
