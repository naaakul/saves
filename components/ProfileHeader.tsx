type Props = {
  user: {
    username: string | null
    image: string | null
  }
  isOwner?: boolean
}

export function ProfileHeader({ user, isOwner }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={user.image ?? "/avatar.png"}
          alt="avatar"
          className="h-12 w-12 rounded-full"
        />
        <span className="text-lg font-medium">
          @{user.username}
        </span>
      </div>

      {isOwner && (
        <div className="flex gap-2">
          <a href="/settings/profile">Edit profile</a>
          <a href="/inventory">Inventory</a>
        </div>
      )}
    </div>
  )
}
