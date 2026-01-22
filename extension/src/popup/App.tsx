import { useEffect, useState } from "react"
import { getCollections, saveBookmark } from "../lib/api"
import { Tree, CollectionNode } from "./Tree"

type ViewState = "checking" | "login" | "app"

export default function App() {
  const [view, setView] = useState<ViewState>("checking")
  const [token, setToken] = useState<string | null>(null)

  const [collections, setCollections] = useState<CollectionNode[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    chrome.storage.local.get("token").then(({ token }) => {
      if (!token) {
        setView("login")
      } else {
        setToken(token)
        setView("app")
        loadCollections(token)
      }
    })
  }, [])

  async function loadCollections(token: string) {
    try {
      const data = await getCollections(token)
      setCollections(data)
    } catch (err) {
      console.error("Auth failed, forcing login", err)
      await chrome.storage.local.remove("token")
      setView("login")
    }
  }

  async function onSave() {
    if (!selectedId || !token) return

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    await saveBookmark(token, {
      url: tab.url!,
      title: tab.title ?? "",
      collectionId: selectedId
    })

    await chrome.storage.local.set({ lastCollectionId: selectedId })
    window.close()
  }

  if (view === "checking") {
    return <div style={{ padding: 12 }}>Loading…</div>
  }

  if (view === "login") {
    return (
      <div style={{ padding: 16 }}>
        <h3>Saves</h3>
        <p>Please log in to continue</p>
        <button
          onClick={() => {
            chrome.tabs.create({
              url: "http://localhost:3000/extension/login"
            })
          }}
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div style={{ width: 300, padding: 12 }}>
      <h3>Save bookmark</h3>

      <div style={{ maxHeight: 200, overflow: "auto" }}>
        <Tree
          nodes={collections}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <button
        disabled={!selectedId}
        onClick={onSave}
        style={{ marginTop: 12, width: "100%" }}
      >
        Done
      </button>
    </div>
  )
}
