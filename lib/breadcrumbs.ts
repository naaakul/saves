import { prisma } from "@/lib/prisma";

export async function getFolderBreadcrumbs(folderId: string) {
  const breadcrumbs = [];

  let currentId: string | null = folderId;

  while (currentId) {
    const folder: any = await prisma.collection.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    if (!folder) break;

    breadcrumbs.unshift({
      id: folder.id,
      name: folder.name,
    });

    currentId = folder.parentId;
  }

  return breadcrumbs;
}
