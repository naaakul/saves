"use client";

import { useEffect } from "react";

export default function ExtensionCallbackPage() {
  useEffect(() => {
    window.close();
  }, []);

  return (
    <p>
      Login successful. You can close this window.
    </p>
  );
}
