import Folder from "@/components/ui/folder";
import { getServerSession } from "@/utils/getServerSession";
import Image from "next/image";
import React from "react";

const page = async () => {
      const session = await getServerSession();

  return (
    <div className="h-screen p-3 flex flex-col gap-3">
      <nav className="p-3 bg-secondary w-full rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            className="size-8"
            alt=""
            src={"/logo.svg"}
            height={200}
            width={200}
          ></Image>
          {/* <p className="font-aver text-2xl text-[#fef28e]">Saves</p> */}
          <p className="text-xl">Inventory</p>
        </div>
        <Image
          className="size-8 rounded-lg"
          alt=""
          src={session?.user.image ?? "/logo.svg"}
          height={200}
          width={200}
        ></Image>
      </nav>
      <div className="p-3 bg-secondary w-full rounded-2xl flex-1">
        <p className="ml-3">Bookmarks</p>
        <div className="w-full bg-muted-foreground h-[0.025rem] mt-3"></div>
        <div className="flex gap-2 py-3">

        <Folder/>
        <Folder/>
        <Folder/>
        <Folder/>
        <Folder/>
        <Folder/>
        </div>
      </div>
    </div>
  );
};

export default page;
