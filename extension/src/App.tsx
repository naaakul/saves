import { useEffect, useState } from "react";
import { getCollections, saveBookmark } from "./lib/api";
import { Tree, CollectionNode } from "./Tree";
import logo from "./assets/logo.svg";

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
    return <div className="p-3 text-sm">Loading…</div>;
  }

  if (view === "login") {
    return (
      <div className="w-[360px] h-[560px] p-3 bg-black">
        <div className="bg-[#0A0A0A] h-full w-full rounded-xl flex flex-col items-center justify-center gap-6">
          <img src={logo} alt="logo" className="w-20 h-20" />
          <button
            onClick={handleLogin}
            className="px-6 py-2 rounded-lg bg-yellow-300 text-black font-medium hover:bg-yellow-200 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[300px] p-3 text-sm">
      <h3 className="font-semibold mb-2">Save bookmark</h3>

      <div className="max-h-[200px] overflow-auto border rounded-lg p-2">
        <Tree
          nodes={collections}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <button
        disabled={!selectedId}
        onClick={onSave}
        className="mt-3 w-full py-2 rounded-lg bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800 transition"
      >
        Done
      </button>
    </div>
  );
}
