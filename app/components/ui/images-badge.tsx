"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ImagesBadgeProps {
  images?: string[];
  className?: string;
  href?: string;
  target?: string;
  folderSize?: { width: number; height: number };
  teaserImageSize?: { width: number; height: number };
  hoverImageSize?: { width: number; height: number };
  hoverTranslateY?: number;
  hoverSpread?: number;
  hoverRotation?: number;
}

export function ImagesBadge({
  images,
  className,
  href,
  target,
  folderSize = { width: 32, height: 24 },
  teaserImageSize = { width: 189, height: 240 },
  hoverImageSize = { width: 283.5, height: 360 },
  hoverTranslateY = -205,
  hoverSpread = 20,
  hoverRotation = 15,
}: ImagesBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const fallbackImages = ["/file.svg", "/file.svg", "/file.svg"];

  const displayImages =
    images && images.length > 0
      ? [...images.slice(0, 3), ...fallbackImages].slice(0, 3)
      : fallbackImages;

  const tabWidth = folderSize.width * 0.375;
  const tabHeight = folderSize.height * 0.25;

  const Component = href ? "a" : "div";

  return (
    <Component
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 perspective-[1000px] transform-3d",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative"
        style={{
          width: folderSize.width,
          height: folderSize.height,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Folder Back */}
        <div className="absolute left-1/2 transform bottom-[.10rem] -translate-x-1/2 rounded-[1.8rem] bg-[#1a1a1a] h-[120%] w-[92%] shadow-[inset_0px_0px_30px_rgba(255,255,255,0.4),0px_15px_45px_rgba(0,0,0,0.5)]" />

        {/* Images */}
        {displayImages.map((image, index) => {
          const totalImages = displayImages.length;

          const baseRotation =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * hoverRotation
                : (index - 1) * hoverRotation;

          const hoverY = hoverTranslateY - (totalImages - 1 - index) * 3;

          const hoverX =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * hoverSpread
                : (index - 1) * hoverSpread;

          const teaseY = -40 - (totalImages - 1 - index) * 1;

          const teaseRotation =
            totalImages === 1
              ? 0
              : totalImages === 2
                ? (index - 0.5) * 16
                : (index - 1) * 16;

          return (
            <motion.div
              key={index}
              className="absolute top-0.5 left-1/2 origin-bottom overflow-hidden"
              animate={{
                x: `calc(-50% + ${isHovered ? hoverX : 0}px)`,
                y: isHovered ? hoverY : teaseY,
                rotate: isHovered ? baseRotation : teaseRotation,
                width: isHovered
                  ? hoverImageSize.width
                  : teaserImageSize.width,
                height: isHovered
                  ? hoverImageSize.height
                  : teaserImageSize.height,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: index * 0.03,
              }}
              style={{
                zIndex: 10 + index,
              }}
            >
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </motion.div>
          );
        })}

        {/* Folder Front */}
        <>
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="folderClip" clipPathUnits="objectBoundingBox">
                <path
                  d="M354.171 243.431L42.6489 242.571C28.0425 242.531 15.921 231.27 14.8076 216.706L0.583133 30.6343C-0.659698 14.3767 12.1967 0.5 28.5017 0.5H186.619C194.955 0.5 202.858 4.21418 208.177 10.6322L237.382 45.8678C242.701 52.2858 250.604 56 258.939 56H368.968C385.667 56 398.653 70.5221 396.794 87.1165L382.074 218.547C380.484 232.746 368.458 243.47 354.171 243.431Z"
                  transform="scale(0.002512, 0.004098)"
                />
              </clipPath>
            </defs>
          </svg>

          <motion.div
            className="absolute inset-x-0 bottom-0 h-[105%] origin-bottom bg-gradient-to-t to-[#38383879] from-[#191919d0] backdrop-blur-xs"
            style={{
              clipPath: "url(#folderClip)",
              transformStyle: "preserve-3d",
              zIndex: 20,
            }}
            animate={{
              rotateX: isHovered ? -25 : -15,
              // scaleY: isHovered ? 0.8 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          />
        </>
      </motion.div>
    </Component>
  );
}
