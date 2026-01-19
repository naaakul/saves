import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/utils/getServerSession";

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { urls, collectionId } = await req.json();

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json(
      { error: "No URLs provided" },
      { status: 400 }
    );
  }

  const cleanUrls = urls
    .map((u: string) => u.trim())
    .filter((u: string) => isValidUrl(u));

  if (cleanUrls.length === 0) {
    return NextResponse.json(
      { error: "No valid URLs" },
      { status: 400 }
    );
  }

  if (collectionId) {
    const folder = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: session.user.id,
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Invalid folder" },
        { status: 400 }
      );
    }
  }

  const data = cleanUrls.map((url) => {
    const parsed = new URL(url);
    return {
      url,
      domain: parsed.hostname,
      userId: session.user.id,
      collectionId: collectionId ?? null,
    };
  });

  await prisma.bookmark.createMany({
    data,
    skipDuplicates: true,
  });

  return NextResponse.json({ success: true });
}
