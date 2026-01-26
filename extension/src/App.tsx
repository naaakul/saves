"use client";

import { useEffect, useState } from "react";
import MainApp from "./components/section/mainApp";
import Login from "./components/section/login";
import Checking from "./components/section/checking";
import { bootstrap } from "./utils/bootstrap";

type ViewState = "checking" | "login" | "app";

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

export default function App() {
  const [collections, setCollections] = useState<CollectionNode[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [view, setView] = useState<ViewState>("checking");
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
  const init = async () => {
    const [{ url }] = await chrome.tabs.query({ active: true, currentWindow: true });
    const current = url || "";
    setCurrentUrl(current);

    const { token } = await chrome.storage.local.get("token");

    if (!token) {
      setView("login");
      return;
    }

    setView("app");

    await bootstrap({
      setCollections,
      setSelectedId,
      setBookmarks,
      setBookmarked,
      currentUrl: current,
    });
  };

  init();
}, []);


  if (view === "checking") return <Checking />;

  if (view === "login") {
    return (
      <Login
        setCollections={setCollections}
        setSelectedId={setSelectedId}
        setBookmarks={setBookmarks}
        setBookmarked={setBookmarked}
        currentUrl={currentUrl}
        setView={setView}
      />
    );
  }

  return (
    <MainApp
      collections={collections}
      bookmarks={bookmarks}
      setBookmarks={setBookmarks}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
      bookmarked={bookmarked}
      setBookmarked={setBookmarked}
      currentUrl={currentUrl}
      setCurrentUrl={setCurrentUrl}
    />
  );
}
