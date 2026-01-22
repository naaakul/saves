const API_BASE = "http://localhost:3000"

export async function getCollections(token: string) {
  const res = await fetch(`${API_BASE}/api/collections/tree`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) throw new Error("Unauthorized")
  return res.json()
}

export async function saveBookmark(
  token: string,
  data: {
    url: string
    title: string
    collectionId: string
  }
) {
  const res = await fetch(`${API_BASE}/api/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) throw new Error("Save failed")
}
