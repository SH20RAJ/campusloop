"use client";

import { ChevronLeft, ChevronRight, Heart, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-5 text-white border border-white/15 bg-black">
        {/* Story Background: Either Photo or Gradient */}
        {currentStory.mediaUrl ? (
          <>
            <img
              src={currentStory.mediaUrl}
              alt="Story Background"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/10 to-black/85 z-0 pointer-events-none" />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0 z-0 bg-linear-to-tr from-violet-600 to-indigo-600",
              currentStory.backgroundColor?.split(" ")[0]
            )}
          />
        )}

        {/* Top Progress Bars */}
        <div className="relative z-10 flex gap-1 pt-1">
          {user.stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: idx < activeStoryIdx ? "100%" : idx === activeStoryIdx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Info */}
        <div className="relative z-10 flex items-center justify-between mt-2">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-white/40 shadow-xs">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="text-xs font-bold text-foreground">
                {user.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold leading-none text-white drop-shadow-md">{user.displayName}</p>
              <p className="text-[10px] text-white/80 drop-shadow-xs">@{user.username}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Center Story Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center p-3">
          {currentStory.text && (
            <p
              className={cn(
                "text-lg sm:text-xl font-extrabold tracking-tight leading-relaxed max-w-[260px] break-words whitespace-pre-wrap drop-shadow-2xl",
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
              className="flex-1 h-9 rounded-full bg-black/50 border border-white/25 px-4 text-xs placeholder:text-white/70 focus:outline-none focus:border-white/60 backdrop-blur-md"
            />
            <button
              type="submit"
              className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-xs"
            >
              <Send className="size-3.5" />
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
            <Heart className={cn("size-4", liked && "fill-current")} />
          </button>
        </div>
      </div>
    </div>
  );
}
