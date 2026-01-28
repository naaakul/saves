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

function normalizeUrl(raw: string) {
  try {
    const u = new URL(raw);

    u.searchParams.forEach((_, key) => {
      if (key.startsWith("utm_")) u.searchParams.delete(key);
    });

    u.hash = "";
    u.protocol = "https:";

    if (u.pathname.endsWith("/") && u.pathname !== "/") {
      u.pathname = u.pathname.slice(0, -1);
    }

    return u.toString();
  } catch {
    return raw;
  }
}

async function getUserFromToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  const extensionToken = await prisma.extensionToken.findUnique({
    where: { token },
  });

  if (!extensionToken || extensionToken.revoked) {
    return null;
  }

  return extensionToken;
}

export async function GET(req: NextRequest) {
  try {
    const extensionToken = await getUserFromToken(req);
    if (!extensionToken)
      return unauthorized("Invalid or missing extension token");

    const userId = extensionToken.userId;

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url || !isValidUrl(url)) {
      return badRequest("Invalid URL");
    }

    const normalizedUrl = normalizeUrl(url);

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId,
        url: normalizedUrl,
        isArchived: false,
      },
      select: {
        id: true,
        collectionId: true,
      },
    });

    if (!bookmark) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      bookmark,
    });
  } catch (err) {
    console.error("[EXTENSION_BOOKMARK_CHECK_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const extensionToken = await getUserFromToken(req);
    if (!extensionToken)
      return unauthorized("Invalid or missing extension token");

    const userId = extensionToken.userId;

    const { url, title, collectionId } = await req.json();

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return badRequest("Invalid URL");
    }

    const normalizedUrl = normalizeUrl(url);
    const parsed = new URL(normalizedUrl);

    if (collectionId) {
      const folder = await prisma.collection.findFirst({
        where: { id: collectionId, userId },
        select: { id: true },
      });

      if (!folder) return badRequest("Invalid folder");
    }

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        url: normalizedUrl,
        isArchived: false,
      },
      select: { id: true, collectionId: true },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        bookmark: existing,
        duplicate: true,
      });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        url: normalizedUrl,
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
        collectionId: true,
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
