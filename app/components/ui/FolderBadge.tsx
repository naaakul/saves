"use client";
import { ImagesBadge } from "@/components/ui/images-badge";
 
export default function FolderBadge() {
  return (
    <div className="flex w-full items-center justify-center mt-20">
      <ImagesBadge
        // images={[
        //   "https://assets.aceternity.com/pro/agenforce-2.webp",
        //   "https://assets.aceternity.com/pro/minimal-3-min.webp",
        //   "https://assets.aceternity.com/pro/bento-4.png",
        // ]}
        folderSize={{ width: 398, height: 244 }}
        // teaserImageSize={{ width: 100, height: 180 }}
        // hoverImageSize={{ width: 240, height: 408 }}
        // hoverTranslateY={-110}
        hoverSpread={50}
      />
    </div>
  );
}