import { useEffect, useState } from "react";
import { getCollections, saveBookmark } from "./lib/api";
import { Tree, CollectionNode } from "./Tree";

type ViewState = "checking" | "login" | "app";

export default function App() {
  const [view, setView] = useState<ViewState>("checking");
  const [token, setToken] = useState<string | null>(null);


  const [collections, setCollections] = useState<CollectionNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get("token").then(({ token }) => {
      if (!token) {
        setView("login");
      } else {
        setToken(token);
        setView("app");
        loadCollections(token);
      }
    });
  }, []);

  async function loadCollections(token: string) {
    try {
      const data = await getCollections(token);
      setCollections(data);
    } catch {
      await chrome.storage.local.remove("token");
      setView("login");
    }
  }

  async function handleLogin() {
    chrome.identity.launchWebAuthFlow(
      {
        url: "http://localhost:3000/auth/login?from=extension",
        interactive: true,
      },
      async (redirectUrl) => {
        if (!redirectUrl) return;

        const url = new URL(redirectUrl);
        const token = url.searchParams.get("token");

        if (!token) return;

        await chrome.storage.local.set({ token });

        setToken(token);
        setView("app");
        loadCollections(token);
      }
    );
  }

  async function onSave() {
    if (!selectedId || !token) return;

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    await saveBookmark(token, {
      url: tab.url!,
      title: tab.title ?? "",
      collectionId: selectedId,
    });

    window.close();
  }

  if (view === "checking") {
    return <div style={{ padding: 12 }}>Loading…</div>;
  }

  if (view === "login") {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={handleLogin}>Login</button>
      </div>
    );
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
  );
}
