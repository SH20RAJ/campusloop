"use client";

import { Bookmark,Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { StoryArchiveModal } from "./story-archive-modal";

interface HighlightItem {
  id: string;
  title: string;
  coverUrl: string | null;
  storiesCount: number;
  stories: any[];
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

export function ProfileHighlights({ userId, isOwnProfile }: ProfileHighlightsProps) {
  const router = useRouter();
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const { data: highlights, mutate: mutateHighlights } = useSWR<HighlightItem[]>(
    `/api/highlights?userId=${userId}`,
    fetcher
  );

  function handleOpenHighlight(h: HighlightItem) {
    if (h.stories && h.stories.length > 0) {
      // Route to first story in the highlight
      router.push(`/app/story/${h.stories[0].id}`);
    } else {
      toast.info(`Highlight "${h.title}" has no active stories.`);
    }
  }

  return (
    <div className="space-y-2 select-none">
      {/* Highlights Circles Row (Instagram Style) */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none py-1 px-1">
        {/* + New Highlight (Owner Only) */}
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowArchiveModal(true)}
              className="size-16 sm:size-18 rounded-full border-2 border-dashed border-border/80 hover:border-primary bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-all cursor-pointer group shadow-2xs"
              title="Create new Highlight from stories"
            >
              <Plus className="size-6 transition-transform group-hover:scale-110" />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground truncate max-w-[72px]">
              New
            </span>
          </div>
        )}

        {/* Existing Highlights */}
        {highlights?.map((h) => (
          <div key={h.id} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <button
              type="button"
              onClick={() => handleOpenHighlight(h)}
              className="size-16 sm:size-18 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-primary to-rose-500 transition-transform group-hover:scale-105 cursor-pointer shadow-xs"
            >
              <div className="size-full rounded-full bg-card border-2 border-card overflow-hidden flex items-center justify-center">
                {h.coverUrl ? (
                  <img
                    src={h.coverUrl}
                    alt={h.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-tr from-primary/20 to-violet-500/20 flex items-center justify-center text-primary">
                    <Bookmark className="size-6" />
                  </div>
                )}
              </div>
            </button>
            <span className="text-[11px] font-bold text-foreground truncate max-w-[72px] text-center">
              {h.title}
            </span>
          </div>
        ))}

        {/* Story Archive Shortcut for Owner */}
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowArchiveModal(true)}
              className="size-16 sm:size-18 rounded-full border border-border/60 bg-card hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
              title="Open Story Archive"
            >
              <Bookmark className="size-5 text-amber-500" />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[72px]">
              Archive
            </span>
          </div>
        )}
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
