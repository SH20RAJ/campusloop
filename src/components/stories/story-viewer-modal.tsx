"use client";

import { X, ChevronLeft, ChevronRight, Send, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

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

  const currentStory = user.stories[activeStoryIdx];
  if (!currentStory) return null;

  function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    toast.success(`Reply sent to @${user.username}! 💬`);
    setReplyText("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-5 text-white select-none">
        {/* Background Gradient */}
        <div
          className={cn(
            "absolute inset-0 z-0 bg-gradient-to-tr from-violet-600 to-indigo-600",
            currentStory.backgroundColor?.split(" ")[0]
          )}
        />

        {/* Top Progress Bars */}
        <div className="relative z-10 flex gap-1 pt-1">
          {user.stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width:
                    idx < activeStoryIdx
                      ? "100%"
                      : idx === activeStoryIdx
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Info */}
        <div className="relative z-10 flex items-center justify-between mt-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border border-white/30">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="text-xs font-bold text-foreground">
                {user.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold leading-none">{user.displayName}</p>
              <p className="text-[10px] text-white/70">@{user.username}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center text-white hover:bg-black/50 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Center Story Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center p-4">
          <p className="text-xl font-extrabold tracking-tight leading-relaxed max-w-[240px] break-words whitespace-pre-wrap drop-shadow-md">
            {currentStory.text}
          </p>
        </div>

        {/* Navigation Touch Controls */}
        <button
          onClick={onPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/20 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={onNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/20 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Bottom Reply Bar */}
        <form onSubmit={handleSendReply} className="relative z-10 flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder={`Reply to ${user.displayName}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 h-9 rounded-full bg-black/40 border border-white/20 px-4 text-xs placeholder:text-white/60 focus:outline-none focus:border-white/60 backdrop-blur-xs"
          />
          <button
            type="submit"
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
