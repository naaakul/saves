import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "").trim();

  const extensionToken = await prisma.extensionToken.findUnique({
    where: { token },
  });

  if (!extensionToken || extensionToken.revoked) return null;

  return extensionToken.userId;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookmarkId } = await context.params;
    const userId = await getUser(req);
    if (!userId) return unauthorized();

    const body = await req.json().catch(() => null);
    if (!body?.collectionId) {
      return NextResponse.json({ error: "collectionId required" }, { status: 400 });
    }

    const folder = await prisma.collection.findFirst({
      where: { id: body.collectionId, userId },
      select: { id: true },
    });

    if (!folder) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    const updated = await prisma.bookmark.updateMany({
      where: { id: bookmarkId, userId, isArchived: false },
      data: { collectionId: body.collectionId },
    });

    if (!updated.count) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[BOOKMARK_MOVE_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ------------------ DELETE BOOKMARK (HARD) ------------------ */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookmarkId } = await context.params;
    const userId = await getUser(req);
    if (!userId) return unauthorized();

    const deleted = await prisma.bookmark.deleteMany({
      where: { id: bookmarkId, userId },
    });

    if (!deleted.count) {
      return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[BOOKMARK_DELETE_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

