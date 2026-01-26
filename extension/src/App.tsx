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
};

export default function App() {
  const [collections, setCollections] = useState<CollectionNode[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filled, setFilled] = useState<boolean>(false);
  const [view, setView] = useState<ViewState>("checking");
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    chrome.storage.local.get("token").then(({ token }) => {
      if (!token) {
        setView("login");
      } else {
        setView("app");
        bootstrap({
          setCollections,
          setSelectedId,
          setBookmarks,
          setFilled,
          currentUrl,
        });
      }
    });
  }, []);

  if (view === "checking") {
    return <Checking />;
  }

  if (view === "login") {
    return (
      <Login
        setCollections={setCollections}
        setSelectedId={setSelectedId}
        setBookmarks={setBookmarks}
        setFilled={setFilled}
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
      filled={filled}
      setFilled={setFilled}
      currentUrl={currentUrl}
      setCurrentUrl={setCurrentUrl}
    />
  );
}
