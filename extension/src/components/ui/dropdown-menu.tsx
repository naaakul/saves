"use client";

import React, {
  createContext,
  useContext,
  useState,
} from "react";

import { motion, type Variants } from "motion/react";
import { cn } from "../../lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, ChevronDown, Folder } from "lucide-react";

/* --------------------------------------------------
 * Animations
 * -------------------------------------------------- */

const content: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};


/* --------------------------------------------------
 * Context
 * -------------------------------------------------- */

type MenuContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Context = createContext<MenuContextType | null>(null);

function useDropdownMenu() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("DropdownMenu components must be used inside DropdownMenu");
  }
  return ctx;
}

function DropdownMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Context.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </Context.Provider>
  );
}

/* --------------------------------------------------
 * Root
 * -------------------------------------------------- */

type DropdownMenuProps = React.ComponentProps<"nav">;

export function DropdownMenu({
  className,
  children,
  ...props
}: DropdownMenuProps) {
  return (
    <DropdownMenuProvider>
      <nav
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </nav>
    </DropdownMenuProvider>
  );
}

/* --------------------------------------------------
 * Trigger
 * -------------------------------------------------- */

type DropdownMenuTriggerProps = {
  asChild?: boolean;
} & React.ComponentProps<"button">;

export function DropdownMenuTrigger({
  asChild = false,
  children,
  className,
  ...props
}: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen } = useDropdownMenu();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={className}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
    </Comp>
  );
}

/* --------------------------------------------------
 * Content
 * -------------------------------------------------- */

type DropdownMenuContentProps = React.ComponentProps<typeof motion.div>;

export function DropdownMenuContent({
  className,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { isOpen } = useDropdownMenu();

  return (
    <motion.div
      className={cn(
        "absolute left-0 mt-2 w-full rounded-xl bg-[#0a0a0a] z-50",
        "h-[476px] overflow-y-auto overflow-x-hidden",
        "p-1",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
        className,
      )}
      variants={content}
      initial="hidden"
      animate={isOpen ? "show" : "hidden"}
      {...props}
    >
      {children}
    </motion.div>
  );
}


/* --------------------------------------------------
 * Explorer-style Tree
 * -------------------------------------------------- */

export type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

type TreeProps = {
  nodes: TreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DropdownTree({
  nodes,
  selectedId,
  onSelect,
}: TreeProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <TreeRow
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

type TreeRowProps = {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function TreeRow({
  node,
  depth,
  selectedId,
  onSelect,
}: TreeRowProps) {
  const hasChildren = node.children && node.children.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg py-1 cursor-pointer select-none",
          "hover:bg-white/10",
          selectedId === node.id && "bg-white/5 text-primary",
        )}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            className="h-4 w-4 flex items-center justify-center opacity-70"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <Folder size={14} className="opacity-70 shrink-0" />
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {open &&
        node.children?.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}
