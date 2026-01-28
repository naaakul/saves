import { NextResponse } from "next/server";
import { prisma } from "@/utils/auth-helpers"; 

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { available: false },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
    select: { id: true },
  });

  return NextResponse.json({
    available: existing === null,
  });
}
