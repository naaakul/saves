import Navbar from "@/components/section/Navbar";
import { Button } from "@/components/ui/button";
import FolderBadge from "@/components/ui/FolderBadge";
import { getServerSession } from "@/utils/getServerSession";
import Image from "next/image";
import Link from "next/link";

import React from "react";

const page = async () => {
  const session = await getServerSession();
  return (
    <div className="bg-black h-screen p-3 overflow-hidden relative ">
      <Image
        src={"/ribbon.svg"}
        alt=""
        height={1000}
        width={1000}
        className="absolute size-[20rem] bottom-5"
      />
      <Image
        src={"/ribbon.svg"}
        alt=""
        height={1000}
        width={1000}
        className="absolute size-[20rem] -top-28 right-3 transform scale-x-[-1]"
      />
      <div className="bg-[#D4D4D4] h-full w-full rounded-2xl flex justify-center flex-col">
        <Navbar  />
        <div className="flex justify-center items center h-9/12 w-full">
          <div className="w-1/2 h-full text-black pl-24 flex justify-center flex-col py-16 relative">
            <div className="w-[0.100rem] bg-[linear-gradient(to_bottom,_#00000000_0%,_#00000025_25%,_#00000030_50%,_#00000025_75%,_#00000000_100%)] h-10/12 absolute top-3 left-12" />
            <div className="w-[0.100rem] bg-[linear-gradient(to_bottom,_#00000000_0%,_#00000025_25%,_#00000030_50%,_#00000025_75%,_#00000000_100%)] h-10/12 absolute left-32" />
            <div className="w-[0.100rem] bg-[linear-gradient(to_bottom,_#00000000_0%,_#00000025_25%,_#00000030_50%,_#00000025_75%,_#00000000_100%)] h-10/12 absolute top-10 left-[28rem]" />
            <div className="w-[0.100rem] bg-[linear-gradient(to_bottom,_#00000000_0%,_#00000025_25%,_#00000030_50%,_#00000025_75%,_#00000000_100%)] h-9/12 absolute top-12 left-[34rem]" />
            <div className="w-[0.100rem] bg-[linear-gradient(to_bottom,_#00000000_0%,_#00000025_25%,_#00000030_50%,_#00000025_75%,_#00000000_100%)] h-7/12 absolute top-15 left-[40rem]" />
            <div className="flex z-10 items-baseline gap-5">
              <Image
                className="size-20 rounded-lg"
                alt=""
                src={"/logo-bw.svg"}
                height={500}
                width={500}
              ></Image>
              <p className="font-aver text-6xl">Saves</p>
            </div>
            <p className="text-[4rem] z-10 font-semibold leading-[0.9]">
              Your second brain <br /> for the web.
            </p>
            <p className="font-medium z-10 leading-none mt-2.5">
              Saves is a
              <span className="font-bold"> visual bookmark system</span> that
              remembers websites the way your brain does —
              <span className="font-bold">
                by how they look, feel, and connect. Organize everything. Lose
                nothing. Ever.
              </span>
            </p>
            {session?.user ? (
              <Link href={"/inventory"} className="w-fit">
                <Button className="bg-black z-10 px-12 w-fit mt-3 text-lg py-7 rounded-xl shadow-[inset_0px_0px_30px_rgba(255,255,255,0.2),0px_15px_45px_rgba(0,0,0,0.3)] text-white hover:bg-black cursor-pointer">
                  inventory
                </Button>
              </Link>
            ) : (
              <Link href={"/auth/login"} className="w-fit">
                <Button className="bg-black z-10 px-12 w-fit mt-3 text-lg py-7 rounded-xl shadow-[inset_0px_0px_30px_rgba(255,255,255,0.2),0px_15px_45px_rgba(0,0,0,0.3)] text-white hover:bg-black cursor-pointer">
                  Sign up now
                </Button>
              </Link>
            )}
          </div>
          <div className="w-1/2 h-full flex justify-center items-center">
            <FolderBadge />
          </div>
        </div>

        {/* <div className="flex-1 flex justify-center items-center">
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
        </div> */}
      </div>
    </div>
  );
};

export default page;
