import { EyeIcon, FolderIcon, Link } from "lucide-react";
import Image from "next/image";
import React from "react";
import NextLink from "next/link";

type FolderProps = {
  id: string;
  name: string;
  isPublic: boolean;
  bookmarkCount?: number;
  folderCount?: number;
};

const Folder = ({
  id,
  name,
  isPublic,
  bookmarkCount = 0,
  folderCount = 0,
}: FolderProps) => {
  return (
    <NextLink href={`/inventory?folder=${id}`}>
      <div className="bg-card relative h-60 w-60 rounded-3xl cursor-pointer hover:scale-[1.02] transition">
        <Image
          className="absolute scale-90 rounded-b-3xl rounded-2xl"
          alt=""
          src={"/png.png"}
          height={500}
          width={500}
        />

        <div
          className="absolute p-1 px-3 -bottom-[4.7rem] scale-90 bg-card h-[240px] w-[240px]
          [mask-image:url('/folder.svg')]
          [mask-repeat:no-repeat]
          [mask-position:top]
          [mask-size:contain]
          [-webkit-mask-image:url('/folder.svg')]
          [-webkit-mask-repeat:no-repeat]
          [-webkit-mask-position:top]
          [-webkit-mask-size:contain]"
        >
          <p className="mt-7 font-medium truncate">{name}</p>

          <div className="flex text-xs w-full justify-between mt-9">
            <div className="flex gap-1 items-center">
              <Link className="size-3" />
              <p>{bookmarkCount} links</p>
            </div>

            <div className="flex gap-1 items-center">
              <FolderIcon className="size-3" />
              <p>{folderCount} folders</p>
            </div>

            <div className="flex gap-1 items-center">
              <EyeIcon className="size-3" />
              <p>{isPublic ? "Public" : "Private"}</p>
            </div>
          </div>
        </div>
      </div>
    </NextLink>
  );
};

export default Folder;
