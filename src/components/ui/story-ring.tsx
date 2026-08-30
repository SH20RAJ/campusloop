"use client";

import { StoryAvatarItem } from "@/components/stories/story-avatar-item";
import { useProfile } from "@/hooks/use-profile";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar,AvatarFallback,AvatarImage } from "./avatar";

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
  isFriend?: boolean;
}

interface StoryRingProps {
  users: UserWithStories[];
  mutateStories?: () => void;
}

export function StoryRing({ users }: StoryRingProps) {
  const { profile } = useProfile();
  const router = useRouter();

  const myStoryGroup = users.find((u) => u.id === profile?.id);
  const otherUsers = users.filter((u) => u.id !== profile?.id);

  function isStorySeen(storyId: string) {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`cl_seen_story_${storyId}`) === "1";
    } catch {
      return false;
    }
  }

  function handleOpenStory(storyId: string) {
    sounds.pop();
    haptics.light();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`cl_seen_story_${storyId}`, "1");
      } catch {
        // ignore
      }
    }
    router.push(`/app/story/${storyId}`);
  }

  function handleCreateStory() {
    sounds.tap();
    haptics.light();
    router.push("/app/stories/new");
  }

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
                handleOpenStory(myStoryGroup.stories[0].id);
              } else {
                handleCreateStory();
              }
            }}
            className={cn(
              "flex items-center justify-center p-0.5 rounded-full transition-transform active:scale-95 cursor-pointer",
              myStoryGroup && myStoryGroup.stories.length > 0
                ? "bg-linear-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-sm"
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
              handleCreateStory();
            }}
            className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-xs hover:scale-110 active:scale-90 transition-transform cursor-pointer"
            aria-label="Add new story"
          >
            <Plus className="h-3 w-3 stroke-3" />
          </button>
        </div>

        <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[64px]">
          {myStoryGroup?.stories?.length ? "Your vibe" : "Add vibe"}
        </span>
      </div>

      {/* Other Students Story Avatars Row */}
      {otherUsers.map((userGroup) => {
        const firstStory = userGroup.stories[0];
        if (!firstStory) return null;

        const allSeen = userGroup.stories.every((s) => isStorySeen(s.id));

        return (
          <StoryAvatarItem
            key={userGroup.id}
            displayName={userGroup.displayName}
            avatarUrl={userGroup.avatarUrl}
            isFriend={userGroup.isFriend}
            hasUnseen={!allSeen}
            onClick={() => handleOpenStory(firstStory.id)}
          />
        );
      })}
    </div>
  );
}
