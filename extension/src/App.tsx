"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCollections, saveBookmark } from "./lib/api";
import { Tree, CollectionNode } from "./Tree";
import logo from "./assets/logo.svg";
import { BookmarkIcon, BookmarkIconHandle } from "./components/bookmark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownTree,
} from "./components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const TEST_TREE = [
  {
    id: "root",
    name: "Root",
    children: [
      {
        id: "work",
        name: "Work",
        children: [
          {
            id: "frontend",
            name: "Frontend",
            children: [
              { id: "react", name: "React", children: [] },
              { id: "next", name: "Next.js", children: [] },
            ],
          },
          {
            id: "backend",
            name: "Backend",
            children: [
              { id: "auth", name: "Auth", children: [] },
              {
                id: "db",
                name: "Database",
                children: [
                  { id: "postgres", name: "Postgres", children: [] },
                  { id: "redis", name: "Redis", children: [] },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "personal",
        name: "Personal",
        children: [
          { id: "reading", name: "Reading", children: [] },
          { id: "ideas", name: "Ideas", children: [] },
        ],
      },
    ],
  },
  {
    id: "hub",
    name: "Hub",
    children: [
      {
        id: "projects",
        name: "Projects",
        children: [
          {
            id: "webapps",
            name: "Web Apps",
            children: [
              { id: "portfolio", name: "Portfolio", children: [] },
              { id: "dashboard", name: "Dashboard", children: [] },
            ],
          },
          {
            id: "tools",
            name: "Tools",
            children: [
              { id: "cli", name: "CLI Utilities", children: [] },
              {
                id: "automation",
                name: "Automation",
                children: [
                  { id: "scripts", name: "Scripts", children: [] },
                  { id: "bots", name: "Bots", children: [] },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "learning",
        name: "Learning",
        children: [
          { id: "courses", name: "Courses", children: [] },
          { id: "notes", name: "Notes", children: [] },
        ],
      },
      {
        id: "lifestyle",
        name: "Lifestyle",
        children: [
          { id: "fitness", name: "Fitness", children: [] },
          { id: "travel", name: "Travel", children: [] },
        ],
      },
    ],
  },
];

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

  const handleRemove = () => {
    setFilled((prev) => !prev);
  };

  function flattenCollections(
    collections: any,
    depth = 0,
  ): { id: string; name: string; depth: number }[] {
    return collections.flatMap((c: any) => [
      { id: c.id, name: c.name, depth },
      ...(c.children ? flattenCollections(c.children, depth + 1) : []),
    ]);
  }

  const flat = useMemo(() => flattenCollections(collections), [collections]);
  const [open, setOpen] = useState(false);

  const selected = flat.find((f) => f.id === selectedId);

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
    <div className="bg-black">
      <div className="w-[363px] h-[600px] p-2 flex flex-col gap-2 bg-black rounded-2xl text-[#fffdee]">
        <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center gap-2">
          <img src={logo} alt="logo" className="w-7 h-7" />
          <p className="font-serif text-[#fef28e] italic text-2xl text-aver">
            Saves
          </p>
        </div>

        <DropdownMenu>
          <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center overflow-hidden">
            <DropdownMenuTrigger>
              <button
                onClick={handleClick}
                className="cursor-pointer w-7 h-7 rounded-lg flex items-center justify-center"
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
              nodes={TEST_TREE}
              selectedId={selectedId}
              onSelect={(id) => {
                console.log("Selected folder:", id);
                setSelectedId(id);
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        
        <div className="bg-[#0A0A0A] px-3 py-1.5 rounded-xl flex gap-1 flex-1 flex-col">
          <DropdownMenu>
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
          <div className="bg-white/10 h-[0.3px]" />

        </div>
      </div>
    </div>
  );
}
