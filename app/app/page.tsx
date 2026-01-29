import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="bg-black h-screen p-3">
      <div className="bg-secondary h-full w-full rounded-2xl">
        <nav className="p-6">
          <div className="flex items-center gap-3">
            <Image
              className="size-10 rounded-lg"
              alt=""
              src={"/logo.svg"}
              height={200}
              width={200}
            ></Image>
            <p className="font-aver text-3xl bg-[linear-gradient(to_bottom_left,#DDE1FE_0%,#C0CAFF_25%,#BBFFD7_50%,#C1FFF9_75%,#EFFEFB_100%)] bg-clip-text text-transparent">
              saves
            </p>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default page;
