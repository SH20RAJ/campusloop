"use client";

import { Check, FolderPlus, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
}

interface UserPlaylistSummary {
  id: string;
  slug: string;
  title: string;
  itemsCount: number;
}

export function AddToPlaylistModal({
  isOpen,
  onClose,
  resourceId,
  resourceTitle,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<UserPlaylistSummary[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Quick inline creation state
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/academics/playlists/me?resourceId=${encodeURIComponent(resourceId)}`)
      .then((res) => res.json())
      .then((data: any) => {
        if (!isMounted) return;
        if (data.playlists) {
          setPlaylists(data.playlists);
        }
        if (Array.isArray(data.containingPlaylistIds)) {
          setSelectedPlaylistIds(new Set(data.containingPlaylistIds));
        }
      })
      .catch((err) => {
        console.error("Failed to load user playlists:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, resourceId]);

  if (!isOpen) return null;

  async function handleToggle(playlist: UserPlaylistSummary) {
    if (isUpdating) return;
    sounds.tap();
    haptics.light();
    setIsUpdating(playlist.id);

    const isCurrentlyIn = selectedPlaylistIds.has(playlist.id);

    try {
      if (isCurrentlyIn) {
        // Remove from playlist
        const res = await fetch(
          `/api/academics/playlists/${playlist.id}/items?resourceId=${encodeURIComponent(resourceId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("Failed to remove");

        setSelectedPlaylistIds((prev) => {
          const next = new Set(prev);
          next.delete(playlist.id);
          return next;
        });
        toast.info(`Removed from "${playlist.title}"`);
      } else {
        // Add to playlist
        const res = await fetch(`/api/academics/playlists/${playlist.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId }),
        });
        if (!res.ok) throw new Error("Failed to add");

        setSelectedPlaylistIds((prev) => {
          const next = new Set(prev);
          next.add(playlist.id);
          return next;
        });
        sounds.pop();
        haptics.success();
        toast.success(`Added to "${playlist.title}" 📚`);
      }
    } catch {
      toast.error("Could not update playlist");
    } finally {
      setIsUpdating(null);
    }
  }

  async function handleCreateNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || isCreating) return;

    sounds.tap();
    haptics.medium();
    setIsCreating(true);

    try {
      const res = await fetch("/api/academics/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          initialResourceIds: [resourceId],
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to create a study playlist");
        } else {
          toast.error("Failed to create playlist");
        }
        return;
      }

      const data = (await res.json()) as any;
      if (data.playlist) {
        sounds.pop();
        haptics.success();
        toast.success(`Created "${data.playlist.title}" with this material! 🚀`);
        setPlaylists((prev) => [data.playlist, ...prev]);
        setSelectedPlaylistIds((prev) => new Set([...prev, data.playlist.id]));
        setNewTitle("");
        setIsCreatingNew(false);
      }
    } catch {
      toast.error("Network error while creating playlist");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <FolderPlus className="size-4" />
              <span>Save to Study Playlist</span>
            </div>
            <h2 className="text-base font-black text-foreground mt-0.5 line-clamp-1">
              {resourceTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-indigo-400" />
            <span className="text-xs font-medium">Loading your study stacks...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {playlists.length > 0 ? (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {playlists.map((pl) => {
                  const isChecked = selectedPlaylistIds.has(pl.id);
                  const isThisUpdating = isUpdating === pl.id;

                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => handleToggle(pl)}
                      disabled={isThisUpdating}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer",
                        isChecked
                          ? "bg-indigo-500/10 border-indigo-500/40 text-foreground"
                          : "border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold truncate text-foreground">{pl.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {pl.itemsCount} {pl.itemsCount === 1 ? "item" : "items"}
                        </p>
                      </div>

                      <div
                        className={cn(
                          "size-5 rounded-md flex items-center justify-center border transition-all shrink-0",
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "border-border/80"
                        )}
                      >
                        {isThisUpdating ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : isChecked ? (
                          <Check className="size-3 stroke-[3]" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              !isCreatingNew && (
                <div className="py-4 text-center space-y-1">
                  <p className="text-xs font-bold text-foreground">No study playlists yet</p>
                  <p className="text-[11px] text-muted-foreground">
                    Create your first playlist for this semester or subject!
                  </p>
                </div>
              )
            )}

            {/* Create New Playlist Inline Form */}
            {isCreatingNew ? (
              <form onSubmit={handleCreateNew} className="p-3 rounded-2xl bg-muted/30 border border-border space-y-2.5">
                <p className="text-xs font-bold text-foreground">Create New Study Stack</p>
                <input
                  type="text"
                  placeholder="e.g. Sem 4 CSAI Endsem Survival Stack"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:outline-hidden focus:border-indigo-500 font-medium"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTitle.trim() || isCreating}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isCreating ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                    <span>Create &amp; Add</span>
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-dashed border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/5 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Create New Playlist</span>
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-border/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
