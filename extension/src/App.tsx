"use client";

import { useEffect, useRef, useState } from "react";
import { getCollections, saveBookmark } from "./lib/api";
import { Tree, CollectionNode } from "./Tree";
import logo from "./assets/logo.svg";
import { BookmarkIcon, BookmarkIconHandle } from "./components/bookmark";

type ViewState = "checking" | "login" | "app";

export default function App() {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [view, setView] = useState<ViewState>("checking");
  const [token, setToken] = useState<string | null>(null);

  const [collections, setCollections] = useState<CollectionNode[]>([]);
  const iconRef = useRef<BookmarkIconHandle>(null);
  const [filled, setFilled] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url) {
        setCurrentUrl(tab.url);
      }
    });
  }, []);

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

  const handleClick = () => {
    setFilled((prev) => !prev);
    iconRef.current?.startAnimation();
  };

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
      },
    );
  }

  function prettifyUrl(url: string) {
    try {
      const u = new URL(url);
      return u.hostname + u.pathname;
    } catch {
      return url;
    }
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
    return (
      <div className="w-[363px] h-[600px] p-2 bg-black text-white">
        <div className="bg-[#0A0A0A] h-full w-full rounded-xl flex flex-col items-center justify-center gap-2">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="w-[363px] h-[600px] p-2 bg-black">
        <div className="bg-[#0A0A0A] h-full w-full rounded-xl flex flex-col items-center justify-center gap-2">
          <img src={logo} alt="logo" className="w-28 h-28" />
          <p className="font-serif text-[#fef28e] italic text-3xl text-aver">
            Saves
          </p>

          <button
            onClick={handleLogin}
            className="rounded-md px-4 py-2 w-4/6 mt-7 text-sm font-medium cursor-pointer bg-[#fffdee] text-[#0a0a0a]"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[363px] h-[600px] p-2 flex flex-col gap-2 bg-black text-[#fffdee]">
      <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center gap-2">
        <img src={logo} alt="logo" className="w-7 h-7" />
        <p className="font-serif text-[#fef28e] italic text-2xl text-aver">
          Saves
        </p>
      </div>
      <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center gap-2">
        <button
          onClick={handleClick}
          className="cursor-pointer w-7 h-7 bg-[#232323] rounded-lg flex items-center justify-center"
        >
          <BookmarkIcon ref={iconRef} filled={filled} />
        </button>
        <div className="px-2 h-7 bg-[#232323] rounded-lg flex items-center">
          <p>{prettifyUrl(currentUrl)}</p>
        </div>
      </div>
      <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center gap-2 flex-1"></div>
    </div>
  );

  // return (
  //   <div className="w-[300px] p-2 text-sm">
  //     <h3 className="font-semibold mb-2">Save bookmark</h3>

  //     <div className="max-h-[200px] overflow-auto border rounded-lg p-2">
  //       <Tree
  //         nodes={collections}
  //         selectedId={selectedId}
  //         onSelect={setSelectedId}
  //       />
  //     </div>

  //     <button
  //       disabled={!selectedId}
  //       onClick={onSave}
  //       className="mt-3 w-full py-2 rounded-lg bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800 transition"
  //     >
  //       Done
  //     </button>
  //   </div>
  // );
}
