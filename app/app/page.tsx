import { getServerSession } from "@/utils/getServerSession";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async () => {
  const session = await getServerSession();
  return (
    <div className="bg-black h-screen p-3">
      <div className="bg-secondary h-full w-full rounded-2xl flex">
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

        <div className="flex-1 flex justify-center items-center">
          {session?.user ? (
            <Link
              href={"/inventory"}
              className="bg-amber-100 text-black py-1 px-3 rounded"
            >
              Inventory
            </Link>
          ) : (
            <Link
              href={"/auth/login"}
              className="bg-amber-100 text-black py-1 px-3 rounded"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
