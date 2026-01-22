import { CreateFolderModal } from "@/components/inventory/create-folder-modal";
import Folder from "@/components/inventory/folder";
import { getServerSession } from "@/utils/getServerSession";
import { prisma } from "@/lib/prisma";
import { getFolderBreadcrumbs } from "@/lib/breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { AddBookmarkModal } from "@/components/inventory/add-bookmark-modal";
import Website from "@/components/inventory/website";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) => {
  const session = await getServerSession();
  if (!session?.user) return null;

  // ✅ IMPORTANT: unwrap searchParams
  const { folder } = await searchParams;
  const currentFolderId = folder ?? null;

  // ✅ Validate ownership if inside folder
  if (currentFolderId) {
    const exists = await prisma.collection.findFirst({
      where: {
        id: currentFolderId,
        userId: session.user.id,
      },
    });

    if (!exists) {
      return null;
    }
  }

  const breadcrumbs = currentFolderId
    ? await getFolderBreadcrumbs(currentFolderId)
    : [];

  // ✅ THIS QUERY IS NOW CORRECT
  const folders = await prisma.collection.findMany({
    where: {
      userId: session.user.id,
      parentId: currentFolderId,
      type: "USER",
    },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
      collectionId: currentFolderId,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="h-screen p-3 flex flex-col gap-3">
      {/* NAV */}
      <nav className="p-3 bg-secondary w-full rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            className="size-8"
            alt=""
            src={"/logo.svg"}
            height={200}
            width={200}
          />
          <p className="text-xl">Inventory</p>
        </div>
        <Image
          className="size-8 rounded-lg"
          alt=""
          src={session.user.image ?? "/logo.svg"}
          height={200}
          width={200}
        />
      </nav>

      {/* CONTENT */}
      <div className="p-3 bg-secondary w-full rounded-2xl flex-1">
        {/* Breadcrumb */}
        <div className="flex gap-2 text-sm text-muted-foreground mb-3">
          <Link href="/inventory">All</Link>
          {breadcrumbs.map((b) => (
            <span key={b.id} className="flex gap-2">
              <span>/</span>
              <Link href={`/inventory?folder=${b.id}`}>{b.name}</Link>
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="ml-3">{breadcrumbs.at(-1)?.name ?? "Folders"}</p>
          <div className="flex gap-2">
            <AddBookmarkModal collectionId={currentFolderId} />
            <CreateFolderModal parentId={currentFolderId} />
          </div>
        </div>

        <div className="w-full bg-muted-foreground h-[0.025rem] mt-3"></div>

        <div className="flex gap-4 py-4 flex-wrap">
          {/* Folders */}
          {folders.map((folder) => (
            <Folder
              key={folder.id}
              id={folder.id}
              name={folder.name}
              isPublic={folder.visibility === "PUBLIC"}
              bookmarkCount={folder._count.bookmarks}
              folderCount={folder._count.children}
            />
          ))}

          {/* Websites */}
          {bookmarks.map((b) => (
            <Website
              key={b.id}
              id={b.id}
              title={b.title}
              url={b.url}
              domain={b.domain}
              favicon={b.faviconUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
