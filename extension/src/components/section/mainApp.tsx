import logo from "../../assets/logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownTree,
} from "../ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkIcon, BookmarkIconHandle } from "../ui/bookmark";
import { useEffect, useRef, useState, useCallback } from "react";
import { prettifyUrl } from "../../utils/utils";
import { getExtensionToken } from "../../utils/bootstrap";

type CollectionNode = {
  id: string;
  name: string;
  children?: CollectionNode[];
};

type Bookmark = {
  id: string;
  url: string;
  collectionId: string;
};

export interface MainAppProps {
  collections: CollectionNode[];
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  bookmarked: boolean;
  setBookmarked: React.Dispatch<React.SetStateAction<boolean>>;
  currentUrl: string;
  setCurrentUrl: React.Dispatch<React.SetStateAction<string>>;
}

const API = "http://localhost:3000/api/extension";

const MainApp = ({
  collections,
  bookmarks,
  setBookmarks,
  selectedId,
  setSelectedId,
  bookmarked,
  setBookmarked,
  currentUrl,
  setCurrentUrl,
}: MainAppProps) => {
  const iconRef = useRef<BookmarkIconHandle>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url) setCurrentUrl(tab.url);
    });
  }, [setCurrentUrl]);

  const authedFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      const token = await getExtensionToken();
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options?.headers || {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      return res.json().catch(() => ({}));
    },
    [],
  );

  const handleSave = async () => {
    if (!selectedId) {
      setDropdownOpen(true);
      return;
    }

    if (bookmarked) return;

    try {
      iconRef.current?.startAnimation();
      setBookmarked(true);

      const data = await authedFetch(`${API}/bookmarks`, {
        method: "POST",
        body: JSON.stringify({
          url: currentUrl,
          title: document.title,
          collectionId: selectedId,
        }),
      });

      setBookmarks((prev) => [...prev, data.bookmark]);
    } catch (err) {
      console.error("Save failed:", err);
      setBookmarked(false);
    }
  };

  const handleRemove = async () => {
    const bookmark = bookmarks.find((b) => b.url === currentUrl);
    if (!bookmark) return;

    try {
      const res = await authedFetch(
        `${API}/bookmarks?url=${encodeURIComponent(currentUrl)}`,
      );

      if (!res.exists) return;

      await authedFetch(`${API}/bookmarks/${res.bookmark.id}`, {
        method: "DELETE",
      });

      setBookmarked(false);

      if (selectedId) {
        const data = await authedFetch(`${API}/view?folder=${selectedId}`);
        setBookmarks(data.bookmarks || []);
      }
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const handleFolderSelect = async (id: string) => {
    try {
      setSelectedId(id);
      setDropdownOpen(false);

      const existing = bookmarks.find((b) => b.url === currentUrl);

      if (!existing) {
        const data = await authedFetch(`${API}/bookmarks`, {
          method: "POST",
          body: JSON.stringify({
            url: currentUrl,
            title: document.title,
            collectionId: id,
          }),
        });

        setBookmarks((prev) => [...prev, data.bookmark]);
        setBookmarked(true);
        return;
      }

      await authedFetch(`${API}/bookmarks/${existing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ collectionId: id }),
      });

      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === existing.id ? { ...b, collectionId: id } : b,
        ),
      );
    } catch (err) {
      console.error("Folder change failed:", err);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

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
              <BookmarkIcon ref={iconRef} filled={bookmarked} />
            </button>
          </DropdownMenuTrigger>

          <div className="relative flex-1 min-w-0 h-7 rounded-lg overflow-hidden">
            <div
              className={`px-2 h-full flex items-center overflow-x-auto whitespace-nowrap overflow-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-300 ${
                bookmarked ? "pr-16" : "pr-2"
              }`}
            >
              <p className="shrink-0">{prettifyUrl(currentUrl)}</p>
            </div>

            <div className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-[#0a0a0a] to-transparent" />

            <div className="pointer-events-none absolute right-0 top-0 h-full w-2 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

            <AnimatePresence>
              {bookmarked && (
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
};

export default MainApp;
