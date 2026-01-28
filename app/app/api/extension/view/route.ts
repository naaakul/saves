import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFolderBreadcrumbs } from "@/lib/breadcrumbs";

/* ---------------- helpers ---------------- */

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/* ---------------- GET ---------------- */

export async function GET(req: NextRequest) {
  try {
    /* ---------- AUTH ---------- */

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized("Missing extension token");
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const extensionToken = await prisma.extensionToken.findUnique({
      where: { token },
    });

    if (!extensionToken || extensionToken.revoked) {
      return unauthorized("Invalid or revoked extension token");
    }

    const userId = extensionToken.userId;

    /* ---------- FOLDER RESOLUTION ---------- */

    const { searchParams } = new URL(req.url);
    const requestedFolderId = searchParams.get("folder");

    const currentFolderId =
      requestedFolderId ??
      extensionToken.lastUsedCollectionId ??
      null;

    /* ---------- OWNERSHIP CHECK ---------- */

    if (currentFolderId) {
      const exists = await prisma.collection.findFirst({
        where: {
          id: currentFolderId,
          userId,
        },
        select: { id: true },
      });

      if (!exists) {
        return badRequest("Folder does not exist or access denied");
      }
    }

    /* ---------- BREADCRUMBS ---------- */

    const breadcrumbs = currentFolderId
      ? await getFolderBreadcrumbs(currentFolderId)
      : [];

    const currentFolderName =
      breadcrumbs.at(-1)?.name ?? "All";

    /* ---------- BOOKMARKS ---------- */

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        collectionId: currentFolderId,
        isArchived: false,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        url: true,
        domain: true,
        faviconUrl: true,
      },
    });

    /* ---------- PERSIST LAST USED ---------- */

    if (
      requestedFolderId &&
      requestedFolderId !== extensionToken.lastUsedCollectionId
    ) {
      await prisma.extensionToken.update({
        where: { id: extensionToken.id },
        data: { lastUsedCollectionId: requestedFolderId },
      });
    }

    /* ---------- RESPONSE ---------- */

    return NextResponse.json({
      currentFolder: {
        id: currentFolderId,
        name: currentFolderName,
        breadcrumbs,
      },
      bookmarks,
    });
  } catch (err) {
    console.error("[EXTENSION_VIEW_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
