import { NextResponse } from "next/server";
import { prisma } from "@/utils/auth-helpers";
import { getServerSession } from "@/utils/getServerSession";

export async function PATCH(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { name, username, isPublic } = body;

  // basic validation
  if (name !== undefined && !name.trim()) {
    return NextResponse.json(
      { error: "Name cannot be empty" },
      { status: 400 }
    );
  }

  if (username !== undefined && !username.trim()) {
    return NextResponse.json(
      { error: "Username cannot be empty" },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && {
          username: username.toLowerCase(),
        }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // unique constraint violation (username race condition)
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
