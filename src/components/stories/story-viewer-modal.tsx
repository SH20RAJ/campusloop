"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatedIcon, AnimateHeart, AnimateSend, AnimateX } from "@/components/ui/animated-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface StoryViewerModalProps {
  user: UserWithStories;
  activeStoryIdx: number;
  progress: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StoryViewerModal({
  user,
  activeStoryIdx,
  progress,
  onClose,
  onPrev,
  onNext,
}: StoryViewerModalProps) {
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(false);

  const currentStory = user.stories[activeStoryIdx];
  if (!currentStory) return null;

  function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    toast.success(`Reply sent to @${user.username}! 💬`);
    setReplyText("");
  }

  function handleLike() {
    setLiked(!liked);
    if (!liked) {
      toast.success("Sent ❤️ reaction!");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 select-none">
      <div className="relative w-full max-w-sm h-full sm:h-[680px] bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        {/* Top Header & Progress Bars */}
        <div className="relative z-10 space-y-2">
          {/* Progress Indicators */}
          <div className="flex gap-1 items-center">
            {user.stories.map((s, idx) => (
              <div key={s.id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: idx < activeStoryIdx ? "100%" : idx === activeStoryIdx ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Meta Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 border border-white/40">
                <AvatarImage src={user.avatarUrl || ""} />
                <AvatarFallback className="text-[10px] bg-muted font-bold text-foreground">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-bold text-white leading-tight">{user.displayName}</p>
                <p className="text-[10px] text-white/70 leading-tight">@{user.username}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <AnimatedIcon icon={AnimateX} animation="pop" size={18} />
            </button>
          </div>
        </div>

        {/* Story Canvas Content */}
        <div
          className="absolute inset-0 flex items-center justify-center p-6 text-center"
          style={{
            backgroundColor: currentStory.backgroundColor || "#1e1b4b",
          }}
        >
          {currentStory.mediaUrl && (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="absolute inset-0 size-full object-cover"
            />
          )}

          {currentStory.text && (
            <p
              className={cn(
                "relative z-10 text-white font-extrabold text-lg sm:text-xl drop-shadow-md max-w-xs break-words",
                currentStory.mediaUrl
                  ? "bg-black/40 px-3.5 py-2 rounded-2xl backdrop-blur-xs border border-white/10"
                  : ""
              )}
            >
              {currentStory.text}
            </p>
          )}
        </div>

        {/* Navigation Touch Controls */}
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/30 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronLeft className="size-6" />
        </button>

        <button
          type="button"
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-black/30 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronRight className="size-6" />
        </button>

        {/* Bottom Reply Bar & Reactions */}
        <div className="relative z-10 flex items-center gap-2 pt-2">
          <form onSubmit={handleSendReply} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Reply to ${user.displayName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 h-9 rounded-full bg-black/50 border border-white/25 px-4 text-xs placeholder:text-white/70 focus:outline-none focus:border-white/60 backdrop-blur-md text-white"
            />
            <button
              type="submit"
              className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-xs"
            >
              <AnimatedIcon icon={AnimateSend} animation="pop" size={14} />
            </button>
          </form>

          <button
            type="button"
            onClick={handleLike}
            className={cn(
              "size-9 rounded-full border border-white/20 flex items-center justify-center cursor-pointer transition-all shrink-0 backdrop-blur-md",
              liked
                ? "bg-rose-500 border-rose-500 text-white scale-110"
                : "bg-black/40 text-white hover:bg-black/60"
            )}
          >
            <AnimatedIcon
              icon={AnimateHeart}
              animation="beat"
              size={16}
              playKey={liked}
              iconClassName={cn(liked ? "fill-white text-white" : "text-white")}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
