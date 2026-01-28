"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownTree,
} from "../ui/dropdown-menu";
import { ChevronRight, Globe } from "lucide-react";
import { motion } from "framer-motion";

type Node = {
  id: string;
  name: string;
  children?: Node[];
};

type Bookmark = {
  id: string;
  title: string;
  url: string;
  domain: string;
  faviconUrl: string | null;
};

interface ViewProps {
  collections: Node[];
}

const View = ({ collections }: ViewProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const url = selectedId
          ? `http://localhost:3000/api/extension/bookmarks/get?folderId=${selectedId}`
          : `http://localhost:3000/api/extension/bookmarks/get`;

        const res = await fetch(url, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch bookmarks");

        const data = await res.json();
        setBookmarks(data);
      } catch (err) {
        console.error(err);
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [selectedId]);

  return (
    <div className="bg-[#0A0A0A] px-2 py-1.5 rounded-xl flex gap-2 flex-1 flex-col">
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="w-full mt-1 mb-0.5 flex items-center justify-between bg-[#121212] rounded-xl px-3 py-2 text-sm text-left">
            <span>
              {collections.find((node) => node.id === selectedId)?.name ??
                "Select folder"}
            </span>

            <motion.span
              animate={{ rotate: dropdownOpen ? 90 : 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="inline-flex"
            >
              <ChevronRight size={18} />
            </motion.span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-[#121212] max-h-[400px] h-fit border-white/10">
          <DropdownTree
            nodes={collections}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-col gap-1 mt-1 overflow-y-auto">
        {loading && (
          <p className="text-xs text-white/40 px-2 py-1">Loading links...</p>
        )}

        {!loading && bookmarks.length === 0 && (
          <p className="text-xs text-white/30 px-2 py-1">
            No links in this folder
          </p>
        )}

        {bookmarks.map((b) => (
          <a
            key={b.id}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#121212] hover:bg-[#1A1A1A] transition-colors rounded-lg px-2 py-1.5 text-sm"
          >
            {b.faviconUrl ? (
              <img src={b.faviconUrl} alt="" className="w-4 h-4 rounded-sm" />
            ) : (
              <Globe size={16} className="text-white/40" />
            )}

            <span className="truncate">{b.title || b.domain}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default View;
