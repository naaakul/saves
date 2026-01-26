type CollectionNode = {
  id: string;
  name: string;
  children?: CollectionNode[];
};

type Bookmark = {
  id: string;
  url: string;
  collectionId: string;
};

interface BootstrapParams {
  setCollections: React.Dispatch<React.SetStateAction<CollectionNode[]>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
  setBookmarked: React.Dispatch<React.SetStateAction<boolean>>;
  currentUrl: string;
}

const API_BASE = "http://localhost:3000/api/extension";

export async function getExtensionToken(): Promise<string> {
  const { token } = await chrome.storage.local.get("token");
  if (!token) throw new Error("Extension not authenticated");
  return token;
}

async function authedFetch<T = any>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getExtensionToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export async function bootstrap({
  setCollections,
  setSelectedId,
  setBookmarks,
  setBookmarked,
  currentUrl,
}: BootstrapParams) {
  try {
    // Load folder tree
    const collectionsRes = await authedFetch<{ collections: CollectionNode[] }>(
      "/collections",
    );

    const collections = collectionsRes.collections || [];
    setCollections(collections);

    //Pick default folder (first root if nothing else)
    const defaultFolderId = collections[0]?.id ?? null;
    setSelectedId(defaultFolderId);

    //Load bookmarks for that folder
    if (defaultFolderId) {
      const folderRes = await authedFetch<{ bookmarks: Bookmark[] }>(
        `/view?folder=${defaultFolderId}`,
      );

      setBookmarks(folderRes.bookmarks || []);
    }

    //Is this page saved anywhere?
    if (currentUrl) {
      const checkRes = await authedFetch<{
        exists: boolean;
        bookmark?: Bookmark;
      }>(`/bookmarks?url=${encodeURIComponent(currentUrl)}`);

      if (checkRes.exists && checkRes.bookmark) {
        setBookmarked(true);

        if (checkRes.bookmark.collectionId) {
          setSelectedId(checkRes.bookmark.collectionId);

          // Also load correct folder bookmarks
          const correctFolder = await authedFetch<{ bookmarks: Bookmark[] }>(
            `/view?folder=${checkRes.bookmark.collectionId}`,
          );

          setBookmarks(correctFolder.bookmarks || []);
        }
      } else {
        setBookmarked(false);
      }
    } else {
      setBookmarked(false);
    }
  } catch (err) {
    console.error("Bootstrap failed:", err);
    setBookmarked(false);
  }
}
