import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}


export async function POST(req: NextRequest) {
  try {

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


    const { url, title, collectionId } = await req.json();

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return badRequest("Invalid URL");
    }


    if (collectionId) {
      const folder = await prisma.collection.findFirst({
        where: {
          id: collectionId,
          userId,
        },
        select: { id: true },
      });

      if (!folder) {
        return badRequest("Invalid folder");
      }
    }


    const parsed = new URL(url);

    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title: title?.trim() || null,
        domain: parsed.hostname,
        userId,
        collectionId: collectionId ?? null,
      },
      select: {
        id: true,
        url: true,
        title: true,
        domain: true,
        faviconUrl: true,
      },
    });


    if (collectionId && collectionId !== extensionToken.lastUsedCollectionId) {
      await prisma.extensionToken.update({
        where: { id: extensionToken.id },
        data: { lastUsedCollectionId: collectionId },
      });
    }


    return NextResponse.json({
      success: true,
      bookmark,
    });
  } catch (err) {
    console.error("[EXTENSION_BOOKMARK_CREATE_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
