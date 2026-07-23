"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useProfile } from "@/hooks/use-profile";
import { StoryAvatarItem } from "@/components/stories/story-avatar-item";
import { StoryViewerModal } from "@/components/stories/story-viewer-modal";

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

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-4 border-b border-border/40 select-none">
      {/* Create Story Add Button */}
      <button
        onClick={() => router.push("/app/stories/new")}
        className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
      >
        <div className="relative p-0.5 rounded-full bg-muted group-hover:scale-105 transition-transform">
          <Avatar className="h-14 w-14 border-2 border-background">
            <AvatarImage src={profile?.avatarUrl || ""} />
            <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">
              {profile?.displayName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-xs">
            <Plus className="h-3.5 w-3.5" />
          </div>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
          Add Vibe
        </span>
      </button>

      {/* Story Users Row */}
      {users.map((userGroup, idx) => (
        <StoryAvatarItem
          key={userGroup.id}
          displayName={userGroup.displayName}
          avatarUrl={userGroup.avatarUrl}
          onClick={() => {
            setActiveUserIdx(idx);
            setActiveStoryIdx(0);
            setProgress(0);
          }}
        />
      ))}

      {/* Fullscreen Story Viewer Modal */}
      {activeUserIdx !== null && users[activeUserIdx] && (
        <StoryViewerModal
          user={users[activeUserIdx]}
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
