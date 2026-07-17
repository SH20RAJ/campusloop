"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCommunity } from "./actions";
import { Plus } from "lucide-react";

export function CreateCommunityDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newComm = await createCommunity(name, description);
      setIsOpen(false);
      router.push(`/app/communities/${newComm.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create community");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary h-9 px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
      >
        <Plus className="h-4 w-4" /> Create Community
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Create a New Community</h3>
              <p className="text-xs text-muted-foreground">Gather peers around a shared topic, club, or hobby.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Community Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anime Club, Chess Society"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What is this community about?"
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring outline-none resize-none"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-input h-9 px-4 text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-primary h-9 px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
