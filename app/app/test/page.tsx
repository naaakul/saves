"use client";

import React, { useEffect, useRef, useState } from "react";
import { BookmarkIcon, BookmarkIconHandle } from "@/components/ui/bookmark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownTree,
} from "@/components/ui/dropdown-menu";
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

const page = () => {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const iconRef = useRef<BookmarkIconHandle>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    setCurrentUrl(
      "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    );
  }, []);

  const handleClick = () => {
    setFilled((prev) => !prev);
    iconRef.current?.startAnimation();
  };

  const handleRemove = () => {
    setFilled((prev) => !prev);
  };

  function prettifyUrl(url: string) {
    try {
      const u = new URL(url);
      return u.hostname + u.pathname;
    } catch {
      return url;
    }
  }

  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="h-screen w-full flex justify-center items-center bg-[#232323] gap-28">
      <div className="w-[363px] h-[600px] p-2 flex flex-col gap-2 bg-black rounded-2xl text-[#fffdee]">
        <div className="bg-[#0A0A0A] p-2 rounded-xl flex items-center gap-2">
          <img src={"/logo.svg"} alt="logo" className="w-7 h-7" />
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
        x: 5,
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
        <div className="bg-[#0A0A0A] p-2 rounded-xl flex gap-2 flex-1"></div>
      </div>
    </div>
  );
};

export default page;
