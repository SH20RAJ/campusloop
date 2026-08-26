"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useProfile } from "@/hooks/use-profile";
import { StoryAvatarItem } from "@/components/stories/story-avatar-item";
import { StoryViewerModal } from "@/components/stories/story-viewer-modal";
import { cn } from "@/lib/utils";


interface Story {
  id: string;
  mediaUrl?: string | null;
  text: string | null;
  backgroundColor: string | null;
  createdAt: string;
  expiresAt: string;
}

interface UserWithStories {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  stories: Story[];
}

interface StoryRingProps {
  users: UserWithStories[];
  mutateStories: () => void;
}

export function StoryRing({ users }: StoryRingProps) {
  const { profile } = useProfile();
  const router = useRouter();

  // Playback state
  const [activeUserIdx, setActiveUserIdx] = useState<number | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleNextStory = useCallback(() => {
    if (activeUserIdx === null || !users[activeUserIdx]) return;
    const currentUser = users[activeUserIdx];
    if (activeStoryIdx < currentUser.stories.length - 1) {
      setActiveStoryIdx((prev) => prev + 1);
      setProgress(0);
    } else if (activeUserIdx < users.length - 1) {
      setActiveUserIdx((prev) => (prev !== null ? prev + 1 : null));
      setActiveStoryIdx(0);
      setProgress(0);
    } else {
      setActiveUserIdx(null);
    }
  }, [activeUserIdx, activeStoryIdx, users]);

  const handlePrevStory = useCallback(() => {
    if (activeUserIdx === null || activeUserIdx === 0) {
      if (activeStoryIdx > 0) {
        setActiveStoryIdx((prev) => prev - 1);
        setProgress(0);
      }
      return;
    }
    if (activeStoryIdx > 0) {
      setActiveStoryIdx((prev) => prev - 1);
      setProgress(0);
    } else {
      const prevUserIdx = activeUserIdx - 1;
      setActiveUserIdx(prevUserIdx);
      setActiveStoryIdx(users[prevUserIdx]?.stories.length ? users[prevUserIdx].stories.length - 1 : 0);
      setProgress(0);
    }
  }, [activeUserIdx, activeStoryIdx, users]);

  useEffect(() => {
    if (activeUserIdx === null) return;
    progressTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [activeUserIdx, activeStoryIdx, handleNextStory]);

  const myStoryGroup = users.find((u) => u.id === profile?.id);
  const otherUsers = users.filter((u) => u.id !== profile?.id);
  const allUsersForViewer = myStoryGroup ? [myStoryGroup, ...otherUsers] : otherUsers;

  return (
    <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2.5 px-4 border-b border-border/40 select-none">
      {/* Current User Story Item (Add Vibe / View Active Story) */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
        <div className="relative group">
          {/* Avatar button */}
          <button
            type="button"
            onClick={() => {
              if (myStoryGroup && myStoryGroup.stories.length > 0) {
                // Open own story
                setActiveUserIdx(0);
                setActiveStoryIdx(0);
                setProgress(0);
              } else {
                router.push("/app/stories/new");
              }
            }}
            className={cn(
              "flex items-center justify-center p-0.5 rounded-full transition-transform active:scale-95 cursor-pointer",
              myStoryGroup && myStoryGroup.stories.length > 0
                ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm"
                : "bg-muted hover:scale-105"
            )}
            aria-label={myStoryGroup?.stories?.length ? "View your story" : "Add new vibe"}
          >
            <Avatar className="h-14 w-14 border-2 border-background">
              <AvatarImage src={profile?.avatarUrl || ""} />
              <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">
                {(profile?.displayName?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Plus action icon to add story */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push("/app/stories/new");
            }}
            className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-xs hover:scale-110 active:scale-90 transition-transform cursor-pointer"
            aria-label="Add new story"
          >
            <Plus className="h-3 w-3 stroke-[3]" />
          </button>
        </div>

        <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[64px]">
          {myStoryGroup?.stories?.length ? "Your vibe" : "Add vibe"}
        </span>
      </div>

      {/* Other Students Story Avatars Row */}
      {otherUsers.map((userGroup, idx) => {
        const viewerIdx = myStoryGroup ? idx + 1 : idx;
        return (
          <StoryAvatarItem
            key={userGroup.id}
            displayName={userGroup.displayName}
            avatarUrl={userGroup.avatarUrl}
            onClick={() => {
              setActiveUserIdx(viewerIdx);
              setActiveStoryIdx(0);
              setProgress(0);
            }}
          />
        );
      })}

      {/* Fullscreen Story Viewer Modal */}
      {activeUserIdx !== null && allUsersForViewer[activeUserIdx] && (
        <StoryViewerModal
          user={allUsersForViewer[activeUserIdx]}
          activeStoryIdx={activeStoryIdx}
          progress={progress}
          onClose={() => setActiveUserIdx(null)}
          onPrev={handlePrevStory}
          onNext={handleNextStory}
        />
      )}
    </div>
  );
}

