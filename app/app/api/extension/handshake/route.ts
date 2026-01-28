import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/utils/getServerSession";

export async function GET(req: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const token = crypto.randomUUID();

  await prisma.extensionToken.create({
    data: {
      token,
      userId: session.user.id,
    },
  });

  const EXTENSION_ID = "nmelmgcgndooeoidfkapoaebcaocpald";

  return NextResponse.redirect(
    `https://${EXTENSION_ID}.chromiumapp.org/callback?token=${token}`
  );
}
