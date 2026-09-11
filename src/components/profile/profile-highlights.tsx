"use client";

import { Bookmark, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { StoryArchiveModal } from "./story-archive-modal";

interface HighlightItem {
  id: string;
  title: string;
  coverUrl: string | null;
  storiesCount?: number;
  stories?: any[];
}

const fetcher = async (url: string): Promise<HighlightItem[]> => {
  const res = await fetch(url);
  return res.json() as Promise<HighlightItem[]>;
};

interface ProfileHighlightsProps {
  userId: string;
  username: string;
  isOwnProfile: boolean;
}

export function ProfileHighlights({ userId, username, isOwnProfile }: ProfileHighlightsProps) {
  const router = useRouter();
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const { data: highlights, mutate: mutateHighlights } = useSWR<HighlightItem[]>(
    `/api/highlights?userId=${userId}`,
    fetcher
  );

  function handleOpenHighlight(h: HighlightItem) {
    if (h.stories && h.stories.length > 0) {
      router.push(`/app/story/${h.stories[0].id}`);
    } else {
      toast.info(`Highlight "${h.title}" has no active stories.`);
    }
  }

  // Only show real user highlights; never inject fake purple emoji circles
  const hasHighlights = highlights && highlights.length > 0;

  if (!hasHighlights && !isOwnProfile) {
    return null;
  }

  return (
    <div className="space-y-2 select-none px-4 py-1">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {/* + New Highlight (Owner Only) */}
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowArchiveModal(true)}
              className="size-14 sm:size-15 rounded-full border border-dashed border-border/80 hover:border-foreground/80 bg-muted/20 hover:bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer group shadow-2xs active:scale-95"
              title="Create new Highlight from stories"
            >
              <Plus className="size-4.5 transition-transform group-hover:scale-110" />
            </button>
            <span className="font-mono text-[10px] font-bold text-muted-foreground group-hover:text-foreground truncate max-w-[64px]">
              New
            </span>
          </div>
        )}

        {/* Existing Real Highlights */}
        {hasHighlights &&
          highlights.map((h) => {
            const count = h.storiesCount || (h.stories ? h.stories.length : 0);

            return (
              <div key={h.id} className="flex flex-col items-center gap-1 shrink-0 group">
                <button
                  type="button"
                  onClick={() => handleOpenHighlight(h)}
                  className="relative size-14 sm:size-15 rounded-full p-0.5 border border-border/70 hover:border-[#1D9BF0] transition-all group-hover:scale-105 active:scale-95 cursor-pointer bg-card"
                >
                  <div className="size-full rounded-full bg-muted/40 overflow-hidden flex items-center justify-center">
                    {h.coverUrl ? (
                      <img src={h.coverUrl} alt={h.title} className="size-full object-cover" />
                    ) : (
                      <Bookmark className="size-4 text-muted-foreground" />
                    )}
                  </div>

                  {count > 0 && (
                    <span className="absolute -bottom-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-foreground text-background font-mono text-[9px] font-bold flex items-center justify-center border border-background">
                      {count}
                    </span>
                  )}
                </button>
                <span className="font-mono text-[10px] font-medium text-muted-foreground group-hover:text-foreground truncate max-w-[68px] text-center">
                  {h.title}
                </span>
              </div>
            );
          })}
      </div>

      {/* Story Archive & New Highlight Modal */}
      {showArchiveModal && (
        <StoryArchiveModal
          isOpen={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
          onHighlightCreated={() => {
            mutateHighlights();
            setShowArchiveModal(false);
          }}
        />
      )}
    </div>
  );
}
