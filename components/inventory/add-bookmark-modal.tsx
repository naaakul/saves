"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function AddBookmarkModal({
  collectionId,
}: {
  collectionId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [urls, setUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateUrl(index: number, value: string) {
    const next = [...urls];
    next[index] = value;
    setUrls(next);
  }

  function addField() {
    setUrls([...urls, ""]);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls,
        collectionId: collectionId ?? null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add bookmarks");
      setLoading(false);
      return;
    }

    setLoading(false);
    setUrls([""]);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Bookmark</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add websites</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {urls.map((url, i) => (
            <Input
              key={i}
              placeholder="https://example.com"
              value={url}
              onChange={(e) => updateUrl(i, e.target.value)}
            />
          ))}

          <Button
            variant="ghost"
            className="w-fit"
            onClick={addField}
          >
            + Add another
          </Button>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
