"use client"

import { useEffect } from "react"

export default function ExtensionConnectPage() {
  useEffect(() => {
    fetch("/api/extension/handshake", {
      method: "POST"
    })
      .then(res => res.json())
      .then(({ token }) => {
        window.postMessage(
          {
            type: "SAVES_EXTENSION_TOKEN",
            token
          },
          "*"
        )
      })
  }, [])

  return <p>Connecting extension… You can close this tab.</p>
}
