import { Dispatch, SetStateAction } from 'react';

type CollectionNode = {
  id: string;
  name: string;
  children?: CollectionNode[];
};

type Bookmark = {
  id: string;
  url: string;
};

interface bootstrapProps {
    setCollections: Dispatch<SetStateAction<CollectionNode[]>>;
    setSelectedId: Dispatch<SetStateAction<string | null>>
    setBookmarks: Dispatch<SetStateAction<Bookmark[]>>
    setFilled: Dispatch<SetStateAction<boolean>>
    currentUrl: String
}

export async function getExtensionToken(): Promise<string> {
  const { token } = await chrome.storage.local.get("token");
  if (!token) throw new Error("No extension token");
  return token;
}

function getFirstCollection(nodes: CollectionNode[]): string | null {
  return nodes[0]?.id ?? null;
}

export async function bootstrap({setCollections, setSelectedId, setBookmarks, setFilled, currentUrl}: bootstrapProps) {
  const token = await getExtensionToken();

  /* ---- collections ---- */
  const colRes = await fetch(
    "http://localhost:3000/api/extension/collections",
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const { collections } = await colRes.json();
  setCollections(collections);

  /* ---- view ---- */
  const viewRes = await fetch("http://localhost:3000/api/extension/view", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await viewRes.json();

  const resolvedFolder =
    data.currentFolder.id ?? getFirstCollection(collections);

  setSelectedId(resolvedFolder);
  setBookmarks(data.bookmarks);
  setFilled(data.bookmarks.some((b: Bookmark) => b.url === currentUrl));
}
