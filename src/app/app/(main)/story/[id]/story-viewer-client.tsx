"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Heart, Send, Share2, ChevronLeft, ChevronRight, School, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StoryViewerClientProps {
  story: {
    id: string;
    mediaUrl: string | null;
    text: string | null;
    backgroundColor: string | null;
    createdAt: string;
    expiresAt: string;
    author: {
      id: string;
      displayName: string;
      username: string;
      avatarUrl: string | null;
      institution?: { name: string } | null;
    };
  };
  currentUserId: string;
}

export function StoryViewerClient({ story, currentUserId }: StoryViewerClientProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(12);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-progress bar timer
  useEffect(() => {
    setProgress(0);
    const interval = 50;
    const duration = 7000; // 7 seconds
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [story.id]);

  function handleLike() {
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      toast.success(`Sent ❤️ to @${story.author.username}`);
    }
  }

  function handleShare() {
    const url = `https://campusloop.space/app/story/${story.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Story link copied to clipboard! 🚀");
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || isReplying) return;

    setIsReplying(true);
    try {
      // Send DM message to story author via chat endpoint
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: story.author.id,
          content: `Replied to your story: "${replyText.trim()}"`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      toast.success(`Reply sent to @${story.author.username}!`);
      setReplyText("");
      router.push(`/app/chat?userId=${story.author.id}`);
    } catch {
      toast.error("Could not send reply. Try messaging directly.");
    } finally {
      setIsReplying(false);
    }
  }

  const bgClass = story.backgroundColor || "bg-gradient-to-tr from-violet-600 to-indigo-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 md:bg-opacity-80 backdrop-blur-md select-none p-0 md:p-4">
      <div className="relative w-full max-w-md aspect-[9/16] h-full md:h-[90vh] md:max-h-[850px] bg-neutral-950 flex flex-col justify-between p-4 md:rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Fullscreen Story Canvas */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-6 text-white transition-all duration-300",
            bgClass
          )}
        >
          {/* Top Header: Progress Bar + User Metadata */}
          <div className="w-full space-y-4 z-20">
            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Author Header */}
            <div className="flex items-center justify-between w-full">
              <Link href={`/@${story.author.username}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <Avatar className="h-10 w-10 border-2 border-white/30 shadow-md">
                  <AvatarImage src={story.author.avatarUrl || ""} />
                  <AvatarFallback className="text-xs font-bold bg-white text-primary">
                    {story.author.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-extrabold flex items-center gap-1">
                    <span>{story.author.displayName}</span>
                    {story.author.institution && (
                      <span className="text-[10px] font-normal text-white/80">
                        • {story.author.institution.name.split(",")[0]}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-white/70">
                    @{story.author.username} • {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </Link>

              {/* Close Button */}
              <button
                onClick={() => router.push("/app")}
                className="h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white cursor-pointer outline-none border border-white/20 transition-all active:scale-90"
                aria-label="Close story"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Center: Story Text Content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4 relative z-20">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-relaxed max-w-[290px] break-words whitespace-pre-wrap select-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              {story.text || "Campus Vibe ✨"}
            </h2>
          </div>

          {/* Bottom Controls: Like, Reply & Share */}
          <div className="w-full space-y-3 z-20">
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to @${story.author.username}...`}
                className="flex-1 h-10 rounded-full border border-white/30 bg-black/40 px-4 text-xs text-white placeholder:text-white/60 outline-none focus:border-white/60 focus:bg-black/60 backdrop-blur-md transition-all"
              />

              {replyText.trim() ? (
                <button
                  type="submit"
                  disabled={isReplying}
                  className="h-10 px-4 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1 hover:bg-white/90 cursor-pointer shadow-md active:scale-95 transition-all"
                >
                  <Send className="size-3.5" /> Send
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={cn(
                      "h-10 w-10 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer active:scale-90",
                      liked ? "bg-rose-500 border-rose-400 text-white" : "bg-black/40 text-white hover:bg-black/60"
                    )}
                    aria-label="Like story"
                  >
                    <Heart className={cn("size-5", liked && "fill-white")} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="h-10 w-10 rounded-full border border-white/30 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer active:scale-90"
                    aria-label="Share story"
                  >
                    <Share2 className="size-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
