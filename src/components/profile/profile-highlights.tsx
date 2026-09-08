"use client";

import { Bookmark, Building2, Code2, FileText, Landmark, Plus } from "lucide-react";
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

  // Default curated highlights matching Image 2 when student has no custom highlights yet
  const displayHighlights =
    highlights && highlights.length > 0
      ? highlights
      : [
          {
            id: "hl_campus_1",
            title: "Campus 🏛️",
            coverUrl: null,
            storiesCount: 3,
            stories: [],
            icon: Landmark,
          },
          {
            id: "hl_notes_2",
            title: "Campus 🏛️",
            coverUrl: null,
            storiesCount: 5,
            stories: [],
            icon: FileText,
          },
          {
            id: "hl_dev_3",
            title: "Dev & Code 💻",
            coverUrl: null,
            storiesCount: 7,
            stories: [],
            icon: Code2,
          },
        ];

  return (
    <div className="space-y-2 select-none px-4 py-2">
      {/* Highlights Circles Row (Instagram Style) */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
        {/* + New Highlight (Owner Only) */}
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowArchiveModal(true)}
              className="size-16 sm:size-18 rounded-full border-2 border-dashed border-border/80 hover:border-purple-500 bg-muted/40 hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-purple-400 transition-all cursor-pointer group shadow-2xs active:scale-95"
              title="Create new Highlight from stories"
            >
              <Plus className="size-6 transition-transform group-hover:scale-110" />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground truncate max-w-[72px]">
              New
            </span>
          </div>
        )}

        {/* Existing / Curated Highlights */}
        {displayHighlights.map((h: any, idx: number) => {
          const count = h.storiesCount || (h.stories ? h.stories.length : [3, 5, 7][idx % 3]);
          const Icon = h.icon || (idx % 3 === 0 ? Landmark : idx % 3 === 1 ? FileText : Code2);

          return (
            <div key={h.id} className="flex flex-col items-center gap-1.5 shrink-0 group">
              <button
                type="button"
                onClick={() => {
                  if (h.stories && h.stories.length > 0) {
                    handleOpenHighlight(h);
                  } else if (isOwnProfile) {
                    setShowArchiveModal(true);
                  } else {
                    toast.info(`"${h.title}" stories active.`);
                  }
                }}
                className="relative size-16 sm:size-18 rounded-full p-0.5 bg-linear-to-tr from-pink-500 via-purple-500 to-indigo-500 transition-transform group-hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <div className="size-full rounded-full bg-[#0d0d16] border-2 border-background overflow-hidden flex items-center justify-center text-purple-300">
                  {h.coverUrl ? (
                    <img src={h.coverUrl} alt={h.title} className="size-full object-cover" />
                  ) : (
                    <Icon className="size-6 text-purple-300" />
                  )}
                </div>

                {/* Count Badge at bottom right matching Image 2 */}
                {count > 0 && (
                  <span className="absolute -bottom-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-background shadow-xs">
                    {count}
                  </span>
                )}
              </button>
              <span className="text-[11px] font-bold text-foreground/90 truncate max-w-[76px] text-center">
                {h.title}
              </span>
            </div>
          );
        })}

        {/* Story Archive Shortcut for Owner */}
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowArchiveModal(true)}
              className="size-16 sm:size-18 rounded-full border border-amber-500/40 bg-[#13111a] hover:bg-muted/60 flex items-center justify-center text-amber-400 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Open Story Archive"
            >
              <Bookmark className="size-5 text-amber-400" />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[72px]">Archive</span>
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
