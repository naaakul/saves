import { EyeIcon, FolderIcon, Link } from "lucide-react";
import Image from "next/image";
import React from "react";

const Folder = () => {
  return (
    <div className="bg-card relative h-60 w-60 rounded-3xl">
      <Image
        className="absolute scale-90 rounded-b-3xl rounded-2xl"
        alt=""
        src={"/png.png"}
        height={500}
        width={500}
      ></Image>
      {/* <Image className="absolute scale-90 bottom-0" alt="" src={"/folder.svg"} height={500} width={500}></Image> */}
      <div className="absolute p-1 px-3 -bottom-[4.7rem] scale-90 bg-card h-[240px] w-[240px] [mask-image:url('/folder.svg')] [mask-repeat:no-repeat] [mask-position:top] [mask-size:contain] [-webkit-mask-image:url('/folder.svg')] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:top] [-webkit-mask-size:contain]">
        <p className="text-sm ml-6"></p>
        <p className="mt-7">unreal-tools</p>
        <p className="text-xs">website design tools which are unrealstick</p>
        <div className="flex text-xs w-full justify-between mt-9">
          <div className="flex gap-1 items-center">
            <Link className="size-3" />
            <p>Websites</p>
          </div>
          <div className="flex gap-1 items-center">
            <FolderIcon className="size-3" />
            <p>Folders</p>
          </div>
          <div className="flex gap-1 items-center">
            <EyeIcon className="size-3" />
            <p>Public</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
