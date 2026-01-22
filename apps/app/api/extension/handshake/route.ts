import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    )
  }

  const token = crypto.randomUUID()

  await prisma.extensionToken.create({
    data: {
      token,
      userId: user.id
    }
  })

  return NextResponse.json({ token })
}
