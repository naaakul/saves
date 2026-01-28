import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromExtensionToken } from "@/lib/extension-auth"

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  const token = auth?.replace("Bearer ", "")

  const userId = await getUserFromExtensionToken(token)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const collections = await prisma.collection.findMany({
    where: { userId },
    include: { children: true }
  })

  return NextResponse.json(collections)
}
