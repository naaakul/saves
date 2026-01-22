import { getSession } from "@/utils/getServerSession"

export async function getUserFromRequest(req: Request) {
  const session = await getSession(req)
  return session?.user ?? null
}
