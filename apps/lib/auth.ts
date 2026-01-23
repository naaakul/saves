import { getServerSession } from "@/utils/getServerSession"

export async function getUserFromRequest() {
  const session = await getServerSession()
  return session?.user ?? null
}
