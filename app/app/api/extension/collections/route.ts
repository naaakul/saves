import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ---------------- helpers ---------------- */

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/* ---------------- tree builder ---------------- */

type CollectionNode = {
  id: string;
  name: string;
  parentId: string | null;
  children: CollectionNode[];
};

function buildTree(rows: CollectionNode[]) {
  const map = new Map<string, CollectionNode>();
  const roots: CollectionNode[] = [];

  // init map
  for (const row of rows) {
    map.set(row.id, { ...row, children: [] });
  }

  // link children
  for (const row of rows) {
    const node = map.get(row.id)!;

    if (row.parentId) {
      const parent = map.get(row.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
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
      select: { userId: true, revoked: true },
    });

    if (!extensionToken || extensionToken.revoked) {
      return unauthorized("Invalid or revoked extension token");
    }

    /* ---------- FETCH COLLECTIONS ---------- */

    const rows = await prisma.collection.findMany({
      where: {
        userId: extensionToken.userId,
        type: "USER",
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    /* ---------- BUILD TREE ---------- */

    const tree = buildTree(
      // @ts-ignore
      rows.map((r) => ({
        ...r,
        children: [],
      })),
    );

    /* ---------- RESPONSE ---------- */

    return NextResponse.json({
      collections: tree,
    });
  } catch (err) {
    console.error("[EXTENSION_COLLECTIONS_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
