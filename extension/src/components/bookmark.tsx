"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { cn } from "../lib/utils";

export interface BookmarkIconHandle {
  startAnimation: () => void;
}

interface BookmarkIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  filled?: boolean;
}

const BOOKMARK_BOUNCE: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 1.25, 0.92, 1.05, 1],
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const pathD =
  "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z";

const BookmarkIcon = forwardRef<BookmarkIconHandle, BookmarkIconProps>(
  ({ className, size = 18, filled = false, ...props }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start("animate"),
    }));

    return (
      <div className={cn("inline-flex", className)} {...props}>
        <svg
          height={size}
          width={size}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bounce Layer */}
          <motion.g
            variants={BOOKMARK_BOUNCE}
            initial="normal"
            animate={controls}
            style={{ originX: "50%", originY: "50%" }}
          >
            {/* Stroke */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="#fffdee"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Fill (animated separately) */}
            <motion.path
              d={pathD}
              stroke="none"
              animate={{ opacity: filled ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              fill="#fffdee"
            />
          </motion.g>
        </svg>
      </div>
    );
  }
);

BookmarkIcon.displayName = "BookmarkIcon";
export { BookmarkIcon };
