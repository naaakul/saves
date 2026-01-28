import { prisma } from "@/lib/prisma"

export async function getUserFromExtensionToken(token?: string) {
  if (!token) return null

  const record = await prisma.extensionToken.findFirst({
    where: {
      token,
      revoked: false
    }
  })

  return record?.userId ?? null
}
