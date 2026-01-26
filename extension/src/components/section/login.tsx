import { Dispatch, SetStateAction } from "react";
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
};

interface loginProps {
    setView: Dispatch<SetStateAction<ViewState>>;
    setCollections: Dispatch<SetStateAction<CollectionNode[]>>;
    setSelectedId: Dispatch<SetStateAction<string | null>>
    setBookmarks: Dispatch<SetStateAction<Bookmark[]>>
    setFilled: Dispatch<SetStateAction<boolean>>
    currentUrl: String
}

const Login = ({ setView, setCollections, setSelectedId, setBookmarks, setFilled, currentUrl }: loginProps) => {
  async function handleLogin() {
    chrome.identity.launchWebAuthFlow(
      {
        url: "http://localhost:3000/auth/login?from=extension",
        interactive: true,
      },
      async (redirectUrl) => {
        if (!redirectUrl) return;
        const url = new URL(redirectUrl);
        const token = url.searchParams.get("token");
        if (!token) return;

        await chrome.storage.local.set({ token });
        setView("app");
        bootstrap({
          setCollections,
          setSelectedId,
          setBookmarks,
          setFilled,
          currentUrl,
        });
      },
    );
  }
  return (
    <div className="w-[363px] h-[600px] bg-black flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="bg-[#fffdee] text-black px-4 py-2 rounded-md"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
