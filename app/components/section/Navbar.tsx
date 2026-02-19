import { getServerSession } from "@/utils/getServerSession";
// import { getSession } from "better-auth/api";
import Link from "next/link";

// type SessionData = Awaited<ReturnType<typeof getSession>>;

// export default async function Navbar({
//   session,
// }: {
//   session: SessionData;
// }) {
export default async function Navbar() {
  const session = await getServerSession();
  return (
    <nav className="w-full flex justify-center top-10 fixed z-50">
      <div className="flex items-center gap-9 bg-black rounded-xl border border-white/20 p-2 shadow-[inset_0px_0px_30px_rgba(255,255,255,0.2),0px_15px_45px_rgba(0,0,0,0.3)]">
        <Link href="/" className="text-white text-lg italic font-aver pl-7">
          Saves
        </Link>

        <Link href="/about" className="text-white/80 hover:text-white text-sm">
          About
        </Link>

        <Link
          href="/privacy"
          className="text-white/80 hover:text-white text-sm"
        >
          Privacy Policy
        </Link>

        {!session?.user ? (
          <div className="flex gap-2">
            <Link
              href="/auth/login"
              className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm px-5 py-2 rounded-lg transition"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white hover:bg-white/90 text-black text-sm font-medium px-5 py-2 rounded-lg transition"
            >
              Sign up now
            </Link>
          </div>
        ) : (
          <Link
            href="/inventory"
            className="bg-white hover:bg-white/90 text-black text-sm font-medium px-5 py-2 rounded-lg transition"
          >
            inventory
          </Link>
        )}
      </div>
    </nav>
  );
}
