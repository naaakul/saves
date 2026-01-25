"use client";

import { useEffect, useRef, useState } from "react";
import logo from "./assets/logo.svg";
import { BookmarkIcon, BookmarkIconHandle } from "./components/bookmark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownTree,
} from "./components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

/* --------------------------------------------------
 * Types
 * -------------------------------------------------- */

type ViewState = "checking" | "login" | "app";

type CollectionNode = {
  id: string;
  name: string;
  children?: CollectionNode[];
};

type Bookmark = {
  id: string;
  url: string;
};

/* --------------------------------------------------
 * App
 * -------------------------------------------------- */

export default function App() {
  const iconRef = useRef<BookmarkIconHandle>(null);

  const [view, setView] = useState<ViewState>("checking");
  const [currentUrl, setCurrentUrl] = useState("");
  const [collections, setCollections] = useState<CollectionNode[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* --------------------------------------------------
   * Helpers
   * -------------------------------------------------- */

  function prettifyUrl(url: string) {
    try {
      const u = new URL(url);
      return u.hostname + u.pathname;
    } catch {
      return url;
    }
  }

  async function getExtensionToken(): Promise<string> {
    const { token } = await chrome.storage.local.get("token");
    if (!token) throw new Error("No extension token");
    return token;
  }

  function getFirstCollection(nodes: CollectionNode[]): string | null {
    return nodes[0]?.id ?? null;
  }

  /* --------------------------------------------------
   * Init
   * -------------------------------------------------- */

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url) setCurrentUrl(tab.url);
    });

    chrome.storage.local.get("token").then(({ token }) => {
      if (!token) {
        setView("login");
      } else {
        setView("app");
        bootstrap();
      }
    });
  }, []);

  /* --------------------------------------------------
   * Bootstrap (collections + view)
   * -------------------------------------------------- */

  async function bootstrap() {
    const token = await getExtensionToken();

    /* ---- collections ---- */
    const colRes = await fetch(
      "http://localhost:3000/api/extension/collections",
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const { collections } = await colRes.json();
    setCollections(collections);

    /* ---- view ---- */
    const viewRes = await fetch("http://localhost:3000/api/extension/view", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await viewRes.json();

    const resolvedFolder =
      data.currentFolder.id ?? getFirstCollection(collections);

    setSelectedId(resolvedFolder);
    setBookmarks(data.bookmarks);
    setFilled(data.bookmarks.some((b: Bookmark) => b.url === currentUrl));
  }

  /* --------------------------------------------------
   * Save (optimistic)
   * -------------------------------------------------- */

  async function handleSave() {
    if (filled || !selectedId) {
      setDropdownOpen(true);
      return;
    }

    iconRef.current?.startAnimation();
    setFilled(true);
    setDropdownOpen(false);

    const token = await getExtensionToken();

    fetch("http://localhost:3000/api/extension/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: currentUrl,
        title: document.title,
        collectionId: selectedId,
      }),
    });
  }

  /* --------------------------------------------------
   * Remove (optimistic)
   * -------------------------------------------------- */

  async function handleRemove() {
    const bookmark = bookmarks.find((b) => b.url === currentUrl);
    if (!bookmark) return;

    setFilled(false);

    const token = await getExtensionToken();

    fetch(`http://localhost:3000/api/extension/bookmarks/${bookmark.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /* --------------------------------------------------
   * Folder select
   * -------------------------------------------------- */

  async function handleFolderSelect(id: string) {
    setSelectedId(id);
    setDropdownOpen(false);

    const token = await getExtensionToken();

    const res = await fetch(
      `http://localhost:3000/api/extension/view?folder=${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const data = await res.json();
    setBookmarks(data.bookmarks);
    setFilled(data.bookmarks.some((b: Bookmark) => b.url === currentUrl));
  }

  /* --------------------------------------------------
   * Keyboard: Enter = Save
   * -------------------------------------------------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") handleSave();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filled, selectedId, currentUrl]);

  /* --------------------------------------------------
   * Login
   * -------------------------------------------------- */

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
        setView("app");
        bootstrap();
      },
    );
  }

  /* --------------------------------------------------
   * Views
   * -------------------------------------------------- */

  if (view === "checking") {
    return <div className="w-[363px] h-[600px] bg-black" />;
  }

  if (view === "login") {
    return (
      <div className="w-[363px] h-[600px] bg-black flex items-center justify-center">
        <button
          onClick={handleLogin}
          className="bg-[#fffdee] text-black px-4 py-2 rounded-md"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-[363px] h-[600px] bg-black p-2 text-[#fffdee] flex flex-col gap-2">
      <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center gap-2">
        <img src={logo} className="w-7 h-7" />
        <p className="italic text-2xl">Saves</p>
      </div>

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center">
          <DropdownMenuTrigger>
            <button
              onClick={handleSave}
              className="w-7 h-7 flex items-center justify-center"
            >
              <BookmarkIcon ref={iconRef} filled={filled} />
            </button>
          </DropdownMenuTrigger>

          <div className="relative flex-1 min-w-0 h-7 rounded-lg overflow-hidden">
            <div
              className={`px-2 h-full flex items-center overflow-x-auto whitespace-nowrap overflow-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300 ${
                filled ? "pr-16" : "pr-2"
              }`}
            >
              <p className="shrink-0">{prettifyUrl(currentUrl)}</p>
            </div>

            <div className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-[#0a0a0a] to-transparent" />

            <div className="pointer-events-none absolute right-0 top-0 h-full w-2 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

            <AnimatePresence>
              {filled && (
                <motion.button
                  key="remove-btn"
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                    x: 56,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 48,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    x: 56,
                  }}
                  transition={{
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 pl-8 pr-12 text-xs rounded-full bg-[radial-gradient(circle,_#0a0a0a_0%,_#0a0a0a_55%,_transparent_75%)] shadow-md pointer-events-auto"
                  onClick={handleRemove}
                >
                  <div className="bg-red-800 px-4 py-0.5 rounded-md">
                    Remove
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DropdownMenuContent>
          <DropdownTree
            nodes={collections}
            selectedId={selectedId}
            onSelect={handleFolderSelect}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="bg-[#0A0A0A] px-3 py-1.5 rounded-xl flex gap-1 flex-1 flex-col">
        {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full mt-2 transition rounded-lg px-3 py-2 text-sm text-left">
                {collections.find(node => node.id === selectedId)?.name ?? "Select folder"}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-[#121212] border-white/10">
              <DropdownTree
                nodes={collections}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="bg-white/10 h-[0.3px]" /> */}
      </div>
    </div>
  );
}
