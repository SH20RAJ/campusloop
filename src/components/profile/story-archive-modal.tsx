"use client";

import { cn } from "@/lib/utils";
import {
Bookmark,
Check,
Heart,
Loader2,
Plus,
X
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface ArchivedStory {
  id: string;
  mediaUrl: string | null;
  text: string | null;
  backgroundColor: string | null;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  likesCount: number;
  isHighlighted: boolean;
}

const fetcher = async (url: string): Promise<ArchivedStory[]> => {
  const res = await fetch(url);
  return res.json() as Promise<ArchivedStory[]>;
};

interface StoryArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHighlightCreated: () => void;
}

export function StoryArchiveModal({
  isOpen,
  onClose,
  onHighlightCreated,
}: StoryArchiveModalProps) {
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false);

  const { data: archiveStories, isLoading } = useSWR<ArchivedStory[]>(
    isOpen ? "/api/stories/archive" : null,
    fetcher
  );

  if (!isOpen) return null;

  function toggleSelect(id: string) {
    setSelectedStoryIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleCreateHighlight(e: React.FormEvent) {
    e.preventDefault();
    if (!highlightTitle.trim() || selectedStoryIds.length === 0 || isCreating) return;

    setIsCreating(true);
    try {
      const selectedStories = archiveStories?.filter((s) =>
        selectedStoryIds.includes(s.id)
      );
      const coverUrl = selectedStories?.find((s) => s.mediaUrl)?.mediaUrl || null;

      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: highlightTitle.trim().slice(0, 30),
          coverUrl,
          storyIds: selectedStoryIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to create highlight");

      toast.success(`Highlight "${highlightTitle}" created! ⭐`);
      onHighlightCreated();
    } catch {
      toast.error("Failed to create highlight");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground rounded-3xl border border-border/50 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Bookmark className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-foreground">
                Story Archive
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isHighlightMode
                  ? `Select stories to add to your new highlight (${selectedStoryIds.length} selected)`
                  : "All your past 24h stories are privately archived here"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Highlight Creation Bar */}
        {isHighlightMode ? (
          <form
            onSubmit={handleCreateHighlight}
            className="p-3 bg-muted/30 border-b border-border/40 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Highlight title (e.g. Campus, Vibes)..."
              value={highlightTitle}
              onChange={(e) => setHighlightTitle(e.target.value)}
              maxLength={30}
              autoFocus
              className="flex-1 h-9 rounded-full bg-background border border-border/60 px-3.5 text-xs font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!highlightTitle.trim() || selectedStoryIds.length === 0 || isCreating}
              className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 hover:bg-primary/90 disabled:opacity-40 cursor-pointer shrink-0"
            >
              {isCreating ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              <span>Done</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHighlightMode(false)}
              className="h-9 px-3 rounded-full hover:bg-muted text-xs font-bold text-muted-foreground"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="p-3 bg-muted/20 border-b border-border/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {archiveStories?.length || 0} Stories Archived
            </span>
            <button
              type="button"
              onClick={() => setIsHighlightMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Create Highlight</span>
            </button>
          </div>
        )}

        {/* Stories Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span>Loading your archive...</span>
            </div>
          ) : archiveStories && archiveStories.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {archiveStories.map((story) => {
                const isSelected = selectedStoryIds.includes(story.id);

                return (
                  <div
                    key={story.id}
                    onClick={() => {
                      if (isHighlightMode) {
                        toggleSelect(story.id);
                      } else {
                        // Open in story viewer
                        window.open(`/app/story/${story.id}`, "_blank");
                      }
                    }}
                    className={cn(
                      "relative aspect-[9/16] rounded-2xl overflow-hidden border transition-all cursor-pointer group shadow-2xs",
                      isSelected
                        ? "border-primary ring-2 ring-primary ring-offset-1"
                        : "border-border/40 hover:border-border"
                    )}
                  >
                    {/* Story Media or Background Gradient */}
                    {story.mediaUrl ? (
                      <img
                        src={story.mediaUrl}
                        alt="Story"
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className={cn(
                          "size-full p-2 flex items-center justify-center text-center text-[11px] font-bold text-white leading-tight",
                          story.backgroundColor || "bg-gradient-to-tr from-violet-600 to-indigo-600"
                        )}
                      >
                        <p className="line-clamp-4">{story.text || "Campus Vibe"}</p>
                      </div>
                    )}

                    {/* Dark gradient for date readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Right: Selection Checkbox (Highlight Mode) or Like Count */}
                    <div className="absolute top-2 right-2 z-10">
                      {isHighlightMode ? (
                        <div
                          className={cn(
                            "size-5 rounded-full border flex items-center justify-center transition-all",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-black/40 border-white/60 text-transparent"
                          )}
                        >
                          <Check className="size-3" />
                        </div>
                      ) : (
                        story.likesCount > 0 && (
                          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full text-[10px] text-white font-bold">
                            <Heart className="size-3 text-rose-500 fill-rose-500" />
                            <span>{story.likesCount}</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Bottom: Date */}
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white/90 truncate">
                      {new Date(story.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center space-y-2 text-muted-foreground text-xs">
              <p className="font-bold text-foreground">No archived stories yet.</p>
              <p>Post a story vibe on CampusLoop and it will be safely archived here for you!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
