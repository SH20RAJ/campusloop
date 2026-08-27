"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import {
detectMentionTrigger,
MentionSuggestions,
TriggerContext,
} from "@/components/ui/mention-autocomplete";
import { RichText } from "@/components/ui/rich-text";
import { FeedPost } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import { AnimatePresence,motion } from "framer-motion";
import {
ArrowUp,
Heart,
Loader2,
MessageCircle,
Shield,
User,
X
} from "lucide-react";
import Link from "next/link";
import { useEffect,useRef,useState } from "react";

import { toast } from "sonner";
import useSWR from "swr";


export interface FastComment {
  id: string;
  postId: string;
  authorId?: string | null;
  pseudonym?: string | null;
  parentId?: string | null;
  body: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string | Date;
  author?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    points?: number | null;
  } | null;
}

interface FastCommentsModalProps {
  post: FeedPost;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch comments");
    return res.json() as Promise<T>;
  });

const QUICK_REACTIONS = ["❤️", "🔥", "😂", "👏", "😮", "💯"];

export function FastCommentsModal({
  post,
  isOpen,
  onClose,
  onCommentCountChange,
}: FastCommentsModalProps) {
  const { profile } = useProfile();

  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [mentionTrigger, setMentionTrigger] = useState<TriggerContext | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCommentText(val);
    const cursor = e.target.selectionStart ?? val.length;
    setMentionTrigger(detectMentionTrigger(val, cursor));
  }

  function handleSelectSuggestion(replacement: string, trigger: TriggerContext) {
    const before = commentText.slice(0, trigger.startIndex);
    const after = commentText.slice(trigger.endIndex);
    const newText = `${before}${replacement}${after}`;
    setCommentText(newText);
    setMentionTrigger(null);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = before.length + replacement.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }


  const {
    data: comments,
    mutate,
    isLoading,
  } = useSWR<FastComment[]>(
    isOpen ? `/api/posts/${post.id}/comments` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 4000 }
  );

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 180);
    } else {
      setCommentText("");
    }
  }, [isOpen]);

  // Scroll to bottom when comments change
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleToggleLike = (commentId: string) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!text || isSubmitting) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: FastComment = {
      id: tempId,
      postId: post.id,
      authorId: isAnonymous ? null : profile?.id || null,
      pseudonym: isAnonymous ? "you_anon" : null,
      body: text,
      isAnonymous,
      status: "PUBLISHED",
      createdAt: new Date().toISOString(),
      author: isAnonymous
        ? null
        : {
            id: profile?.id || "",
            username: profile?.username || "you",
            displayName: profile?.displayName || "You",
            avatarUrl: profile?.avatarUrl || null,
            points: profile?.points || profile?.loopPoints || 0,
          },
    };

    const currentList = comments || [];
    const updatedList = [...currentList, optimisticComment];

    // Optimistically update list
    sounds.send();
    haptics.success();
    mutate(updatedList, false);
    setCommentText("");
    setIsSubmitting(true);
    onCommentCountChange?.(updatedList.length);
    setTimeout(scrollToBottom, 60);

    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          isAnonymous,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to post comment");
      }

      // Revalidate to sync canonical data
      await mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post comment");
      // Rollback
      mutate(currentList, false);
      onCommentCountChange?.(currentList.length);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const commentsList = comments || [];
  const authorName = post.isAnonymous
    ? "Anonymous Student"
    : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous
    ? post.pseudonym || "anonymous"
    : post.author?.username || "student";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center select-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal / Bottom Drawer Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 38 }}
            className="relative z-10 w-full sm:max-w-lg h-[82vh] sm:h-[680px] max-h-[90vh] bg-card text-card-foreground rounded-t-3xl sm:rounded-3xl border border-border/50 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="w-full flex items-center justify-center pt-2.5 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border/30 shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4.5 text-primary" />
                <h3 className="text-sm font-black text-foreground tracking-tight">
                  Comments
                </h3>
                <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {commentsList.length}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Original Post Context Pill */}
            <div className="px-4 sm:px-5 py-2.5 bg-muted/20 border-b border-border/20 flex items-center gap-2.5 shrink-0">
              <span className="text-[11px] font-bold text-foreground truncate max-w-[130px]">
                @{authorHandle}:
              </span>
              <p className="text-xs text-muted-foreground truncate flex-1">
                {post.body}
              </p>
            </div>

            {/* Scrollable Comments List */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-4 divide-y divide-border/20 scroll-smooth"
            >
              {isLoading ? (
                <div className="space-y-4 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse pt-2">
                      <div className="size-8 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 bg-muted rounded-md" />
                        <div className="h-3.5 w-3/4 bg-muted/70 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : commentsList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-2">
                  <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <MessageCircle className="size-6 stroke-[1.5]" />
                  </div>
                  <p className="text-xs font-bold text-foreground">No comments yet</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Start the conversation! Drop a reaction or share your thoughts with campus.
                  </p>
                </div>
              ) : (
                commentsList.map((c) => {
                  const isAnon = c.isAnonymous;
                  const cDisplayName = isAnon
                    ? "Anonymous Student"
                    : c.author?.displayName || "Student";
                  const cHandle = isAnon
                    ? c.pseudonym || "anonymous"
                    : c.author?.username || "student";
                  const cAvatar = isAnon
                    ? ""
                    : getAvatarUrl(c.author?.avatarUrl, c.author?.username ?? "student");
                  const isLiked = Boolean(likedComments[c.id]);

                  return (
                    <div
                      key={c.id}
                      className="flex items-start justify-between gap-3 pt-3 first:pt-0 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {isAnon ? (
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                            <Shield className="size-4" />
                          </div>
                        ) : (
                          <Link
                            href={`/@${cHandle}`}
                            onClick={onClose}
                            className="shrink-0"
                          >
                            <Avatar className="size-8 rounded-full border border-border/40 hover:opacity-90 transition-opacity">
                              <AvatarImage src={cAvatar} />
                              <AvatarFallback className="text-[10px] font-bold">
                                {cDisplayName[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        )}

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-foreground truncate">
                              {cDisplayName}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              @{cHandle}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              • {formatTimeAgo(c.createdAt)}
                            </span>
                            {isAnon && (
                              <span className="text-[9px] font-bold bg-muted/60 text-muted-foreground px-1.5 py-0.2 rounded-md">
                                Anon
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-foreground/90 leading-relaxed break-words font-normal">
                            <RichText content={c.body} />
                          </div>
                        </div>
                      </div>

                      {/* Comment Like Button (Instagram Style) */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(c.id)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 pt-1 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer shrink-0 group-hover:opacity-100",
                          isLiked && "text-rose-500"
                        )}
                        aria-label="Like comment"
                      >
                        <Heart
                          className={cn(
                            "size-3.5 transition-transform active:scale-125",
                            isLiked && "fill-rose-500 stroke-rose-500"
                          )}
                        />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Emoji Reaction Bar (Instagram Style) */}
            <div className="px-4 py-1.5 border-t border-border/20 flex items-center justify-between gap-1 overflow-x-auto shrink-0 bg-muted/10">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="text-base sm:text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Fixed Bottom Input Bar (Instagram Style) */}
            <div className="p-3 sm:p-4 border-t border-border/30 bg-card shrink-0 space-y-2">
              <div className="flex items-center gap-2.5">
                {/* Current User Avatar */}
                <Avatar className="size-8.5 rounded-full border border-border/40 shrink-0">
                  <AvatarImage src={isAnonymous ? "" : profile?.avatarUrl || ""} />
                  <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                    {isAnonymous ? "🙈" : profile?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Input with embedded actions */}
                <div className="relative flex-1 flex items-center gap-2 rounded-full border border-border/50 bg-background px-3.5 py-1.5 focus-within:border-foreground/40 transition-colors">
                  <MentionSuggestions
                    trigger={mentionTrigger}
                    onSelect={handleSelectSuggestion}
                    onClose={() => setMentionTrigger(null)}
                    className="bottom-full mb-2 left-0"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      isAnonymous
                        ? "Comment anonymously..."
                        : `Add a comment as @${profile?.username || "you"}...`
                    }
                    value={commentText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                    maxLength={500}
                  />


                  {/* Anonymous Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => setIsAnonymous((prev) => !prev)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                      isAnonymous
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                        : "text-muted-foreground hover:text-foreground bg-muted/50"
                    )}
                    title={isAnonymous ? "Anonymous mode active" : "Switch to anonymous comment"}
                  >
                    {isAnonymous ? (
                      <>
                        <Shield className="size-2.5" />
                        <span>Anon</span>
                      </>
                    ) : (
                      <>
                        <User className="size-2.5" />
                        <span>Public</span>
                      </>
                    )}
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    disabled={!commentText.trim() || isSubmitting}
                    onClick={handleSendComment}
                    className="size-7 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
                    aria-label="Send comment"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ArrowUp className="size-3.5 stroke-[3]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
