import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/utils/getServerSession";

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { name, visibility, parentId } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Invalid folder name" },
      { status: 400 }
    );
  }

  if (name.trim().toLowerCase() === "all") {
    return NextResponse.json(
      { error: `"All" is a reserved folder` },
      { status: 400 }
    );
  }

  if (visibility && !["PUBLIC", "PRIVATE"].includes(visibility)) {
    return NextResponse.json(
      { error: "Invalid visibility" },
      { status: 400 }
    );
  }

  // Validate parent folder (if provided)
  if (parentId) {
    const parent = await prisma.collection.findFirst({
      where: {
        id: parentId,
        userId: session.user.id,
      },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Invalid parent folder" },
        { status: 400 }
      );
    }
  }

  const folder = await prisma.collection.create({
    data: {
      name: name.trim(),
      visibility: visibility ?? "PRIVATE",
      type: "USER",
      userId: session.user.id,
      parentId: parentId ?? null,
    },
  });

  return NextResponse.json(folder);
}
