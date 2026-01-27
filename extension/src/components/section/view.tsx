"use client"

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownTree,
} from "../ui/dropdown-menu";

type node = {
  id: string;
  name: string;
  children?: node[];
};

interface viewProps {
  collections: node[];
}

const View = ({ collections }: viewProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="bg-[#0A0A0A] px-3 py-1.5 rounded-xl flex gap-1 flex-1 flex-col">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full mt-2 transition rounded-lg px-3 py-2 text-sm text-left">
            {collections.find((node) => node.id === selectedId)?.name ??
              "Select folder"}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-[#121212] h-[376px] border-white/10">
          <DropdownTree
            nodes={collections}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="bg-white/10 h-[0.3px]" />
    </div>
  );
};

export default View;
