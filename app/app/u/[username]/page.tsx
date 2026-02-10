import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/utils/getServerSession";
import Folder from "@/components/inventory/folder";
import Website from "@/components/inventory/website";
import Image from "next/image";
import Link from "next/link";
import { getFolderBreadcrumbs } from "@/lib/breadcrumbs";
import { ArrowRight } from "lucide-react";
import SignOutButton from "@/components/ui/signOutButton";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ folder?: string }>;
}) => {
  const session = await getServerSession();
  const { username } = await params;
  const { folder } = await searchParams;

  const profileUser = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      image: true,
      isPublic: true,
    },
  });

  if (!profileUser) notFound();

  const isOwner = session?.user?.id === profileUser.id;
  const canView = profileUser.isPublic || isOwner;

  if (!canView) {
    return (
      <div className="h-screen p-3">
        <nav className="p-3 bg-secondary rounded-2xl flex items-center gap-3">
          <Image
            className="size-8 rounded-lg"
            src={profileUser.image ?? "/logo.svg"}
            alt=""
            width={32}
            height={32}
          />
          <p className="text-xl">@{profileUser.username}</p>
        </nav>
      </div>
    );
  }

  const currentFolderId = folder ?? null;

  if (currentFolderId) {
    const folderExists = await prisma.collection.findFirst({
      where: {
        id: currentFolderId,
        userId: profileUser.id,
        ...(isOwner ? {} : { visibility: "PUBLIC" }),
      },
      select: { id: true },
    });

    if (!folderExists) notFound();
  }

  const breadcrumbs = currentFolderId
    ? await getFolderBreadcrumbs(currentFolderId)
    : [];

  const folders = await prisma.collection.findMany({
    where: {
      userId: profileUser.id,
      parentId: currentFolderId,
      type: "USER",
      ...(isOwner ? {} : { visibility: "PUBLIC" }),
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

  const bookmarks =
    currentFolderId === null
      ? []
      : await prisma.bookmark.findMany({
          where: {
            userId: profileUser.id,
            collectionId: currentFolderId,
            isArchived: false,
            ...(isOwner
              ? {}
              : {
                  Collection: {
                    visibility: "PUBLIC",
                  },
                }),
          },
          orderBy: {
            createdAt: "desc",
          },
        });

  return (
    <div className="h-screen p-3 flex flex-col gap-3">
      <nav className="p-3 bg-secondary w-full rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            className="size-8 rounded-lg"
            src={profileUser.image ?? "/logo.svg"}
            alt=""
            width={32}
            height={32}
          />
          <p className="text-xl">@{profileUser.username}</p>
          {isOwner && <SignOutButton />}
        </div>

        {isOwner && (
          <Link
            href="/inventory"
            className="text-sm opacity-80 hover:opacity-100 flex gap-1 items-center"
          >
            <p className="text-md">Inventory</p>
            <ArrowRight size={15} />
          </Link>
        )}
      </nav>

      <div className="p-3 bg-secondary w-full rounded-2xl flex-1">
        <div className="flex gap-2 text-sm text-muted-foreground mb-3">
          <Link href={`/u/${username}`}>@{username}</Link>
          {breadcrumbs.map((b) => (
            <span key={b.id} className="flex gap-2">
              <span>/</span>
              <Link href={`/u/${username}?folder=${b.id}`}>{b.name}</Link>
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="ml-3">{breadcrumbs.at(-1)?.name ?? "Inventory"}</p>

          {/* {isOwner && (
            <div className="flex gap-2">
              <AddBookmarkModal collectionId={currentFolderId} />
              <CreateFolderModal parentId={currentFolderId} />
            </div>
          )} */}
        </div>

        <div className="w-full bg-muted-foreground h-[0.025rem] mt-3" />

        <div className="flex gap-4 py-4 flex-wrap">
          {
            // @ts-ignore
            folders.map((folder) => (
              <Folder
                key={folder.id}
                id={folder.id}
                name={folder.name}
                isPublic={folder.visibility === "PUBLIC"}
                bookmarkCount={folder._count.bookmarks}
                folderCount={folder._count.children}
              />
            ))
          }

          {
            // @ts-ignore
            bookmarks.map((b) => (
              <Website
                key={b.id}
                id={b.id}
                title={b.title}
                url={b.url}
                domain={b.domain}
                favicon={b.faviconUrl}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default page;
