import Image from "next/image";

type WebsiteProps = {
  id: string;
  title: string | null;
  url: string;
  domain: string;
  favicon?: string | null;
};

const Website = ({ title, url, domain, favicon }: WebsiteProps) => {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div className="bg-card relative h-60 w-60 rounded-3xl cursor-pointer hover:scale-[1.02] transition overflow-hidden">
        <iframe
          className="absolute inset-0 scale-90 rounded-2xl pointer-events-none"
          src={url}
        />

        <div className="absolute bottom-0 left-0 right-0 bg-card/90 backdrop-blur p-3">
          <p className="text-sm font-medium truncate">
            {title ?? domain}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {favicon && (
              <Image
                src={favicon}
                alt=""
                width={14}
                height={14}
              />
            )}
            <span className="truncate">{domain}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default Website;
