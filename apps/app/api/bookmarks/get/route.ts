import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromExtensionToken } from "@/lib/extension-auth"

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")
  const token = auth?.replace("Bearer ", "")

  const userId = await getUserFromExtensionToken(token)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { url, title, collectionId } = await req.json()

  const domain = new URL(url).hostname

  await prisma.bookmark.create({
    data: {
      url,
      title,
      domain,
      userId,
      collectionId
    }
  })

  return NextResponse.json({ success: true })
}
