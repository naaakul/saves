type Props = {
  collections: Array<{
    id: string
    name: string
    visibility: "PUBLIC" | "PRIVATE"
    bookmarks: any[]
  }>
  isOwner: boolean
}

export function CollectionsView({ collections }: Props) {
  if (collections.length === 0) {
    return (
      <p className="opacity-60">
        No public collections
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {collections.map((c) => (
        <div
          key={c.id}
          className="rounded-lg border p-4"
        >
          <div className="font-medium">
            {c.name}
          </div>

          <div className="text-sm opacity-60">
            {c.bookmarks.length} saves
          </div>
        </div>
      ))}
    </div>
  )
}
