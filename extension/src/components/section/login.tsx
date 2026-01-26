import { Dispatch, SetStateAction } from "react";
import logo from "../../assets/logo.svg";
import { bootstrap } from "../../utils/bootstrap";

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

interface LoginProps {
  setView: Dispatch<SetStateAction<ViewState>>;
  setCollections: Dispatch<SetStateAction<CollectionNode[]>>;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  setBookmarks: Dispatch<SetStateAction<Bookmark[]>>;
  setBookmarked: Dispatch<SetStateAction<boolean>>;
  currentUrl: string;
}

const Login = ({
  setView,
  setCollections,
  setSelectedId,
  setBookmarks,
  setBookmarked,
  currentUrl,
}: LoginProps) => {
  const handleLogin = async () => {
    try {
      chrome.identity.launchWebAuthFlow(
        {
          url: "http://localhost:3000/auth/login?from=extension",
          interactive: true,
        },
        async (redirectUrl) => {
          if (!redirectUrl) throw new Error("No redirect URL");

          const url = new URL(redirectUrl);
          const token = url.searchParams.get("token");
          if (!token) throw new Error("Token missing in redirect");

          await chrome.storage.local.set({ token });

          setView("app");

          await bootstrap({
            setCollections,
            setSelectedId,
            setBookmarks,
            setBookmarked,
            currentUrl,
          });
        },
      );
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="w-[363px] h-[600px] gap-10 bg-black flex flex-col items-center justify-center">
        <img src={logo} className="w-44 h-w-44" />
        
      <button
        onClick={handleLogin}
        className="bg-[#fffdee] text-black px-4 py-2 rounded-md font-medium"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
