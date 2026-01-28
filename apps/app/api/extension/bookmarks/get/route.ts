import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/utils/getServerSession"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const folderId = searchParams.get("folderId") 

  if (folderId) {
    const folder = await prisma.collection.findFirst({
      where: {
        id: folderId,
        userId: session.user.id,
      },
      select: { id: true },
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
      collectionId: folderId,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      url: true,
      domain: true,
      faviconUrl: true,
      createdAt: true,
    },
  })

  return NextResponse.json(bookmarks)
}
