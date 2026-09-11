"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ChevronDown,
  Flame,
  Heart,
  History,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Reply,
  Shield,
  VenetianMask,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  detectMentionTrigger,
  MentionSuggestions,
  type TriggerContext,
} from "@/components/ui/mention-autocomplete";
import { RichText } from "@/components/ui/rich-text";
import type { FeedPost } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

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

export function FastCommentsModal({ post, isOpen, onClose, onCommentCountChange }: FastCommentsModalProps) {
  const { profile } = useProfile();

  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [sortMode, setSortMode] = useState<"best" | "latest">("best");
  const [mentionTrigger, setMentionTrigger] = useState<TriggerContext | null>(null);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    handle: string;
    displayName: string;
  } | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize liked comments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("campusloop_liked_comments");
      if (stored) {
        setLikedComments(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  function handleComposerFocus() {
    setTimeout(scrollToBottom, 250);
  }

  async function handleUploadCommentFiles(files: File[]) {
    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length === 0) return;

    setIsUploadingImage(true);
    try {
      toast.loading("Uploading attached image...", { id: "comment-img" });
      const uploaded = await uploadImageToImgBB(validImageFiles[0]);
      const imgMarkdown = `\n![Image](${uploaded.displayUrl || uploaded.url})`;
      setCommentText((prev) => `${prev.trim()}${imgMarkdown}`);
      toast.success("Image attached", { id: "comment-img" });
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image", { id: "comment-img" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const files = Array.from(clipboardData.files || []);
    const directImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (directImageFiles.length > 0) {
      e.preventDefault();
      handleUploadCommentFiles(directImageFiles);
      return;
    }

    const items = Array.from(clipboardData.items || []);
    const itemImageFiles = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);

    if (itemImageFiles.length > 0) {
      e.preventDefault();
      handleUploadCommentFiles(itemImageFiles);
      return;
    }

    const html = clipboardData.getData("text/html");
    if (html) {
      const match = html.match(/<img[^>]+src="([^">]+)"/i);
      if (match && match[1] && /^https?:\/\//i.test(match[1])) {
        const imgSrc = match[1];
        if (
          /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(imgSrc) ||
          imgSrc.includes("giphy.com") ||
          imgSrc.includes("tenor.com")
        ) {
          e.preventDefault();
          const imgMarkdown = `\n![Image](${imgSrc})`;
          setCommentText((prev) => `${prev.trim()}${imgMarkdown}`);
          toast.success("Media attached");
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }
    }
  }

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
  } = useSWR<FastComment[]>(isOpen ? `/api/posts/${post.id}/comments` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 4000,
  });

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!isOpen) {
      setCommentText("");
      setReplyingTo(null);
      return;
    }
    const finePointer = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
    if (finePointer) {
      setTimeout(() => inputRef.current?.focus(), 180);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleToggleLike = (commentId: string) => {
    sounds.tap();
    haptics.light();
    setLikedComments((prev) => {
      const next = { ...prev, [commentId]: !prev[commentId] };
      try {
        localStorage.setItem("campusloop_liked_comments", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  function handleStartReply(c: FastComment, handle: string, displayName: string) {
    sounds.tap();
    haptics.light();
    setReplyingTo({ id: c.id, handle, displayName });
    inputRef.current?.focus();
  }

  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!text || isSubmitting) return;

    const currentReplyingTo = replyingTo;
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: FastComment = {
      id: tempId,
      postId: post.id,
      parentId: currentReplyingTo?.id || null,
      authorId: isAnonymous ? null : profile?.id || null,
      pseudonym: isAnonymous ? "anon_student" : null,
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

    sounds.send();
    haptics.success();
    mutate(updatedList, false);
    setCommentText("");
    setReplyingTo(null);
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
          parentId: currentReplyingTo?.id || undefined,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to post comment");
      }

      await mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post comment");
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

  const authorHandle = post.isAnonymous
    ? post.pseudonym || "anonymous"
    : post.author?.username || "student";

  // Clean, markdown-free caption snippet for the minimal context bar
  const cleanSnippet = useMemo(() => {
    if (!post.body) return null;
    const clean = post.body
      .replace(/!\[.*?\]\(.*?\)/gi, "")
      .replace(/https?:\/\/[^\s]+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return clean.length > 0 ? clean : null;
  }, [post.body]);

  // Group comments into root comments and nested replies
  const { rootComments, repliesMap, totalCount } = useMemo(() => {
    const list = comments || [];
    const roots: FastComment[] = [];
    const replies = new Map<string, FastComment[]>();

    for (const c of list) {
      if (c.parentId) {
        const existing = replies.get(c.parentId) || [];
        existing.push(c);
        replies.set(c.parentId, existing);
      } else {
        roots.push(c);
      }
    }

    if (sortMode === "latest") {
      roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // "best": liked comments first, then latest
      roots.sort((a, b) => {
        const likedA = likedComments[a.id] ? 1 : 0;
        const likedB = likedComments[b.id] ? 1 : 0;
        if (likedB !== likedA) return likedB - likedA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return { rootComments: roots, repliesMap: replies, totalCount: list.length };
  }, [comments, sortMode, likedComments]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center select-none overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Minimalist Mobile-First Bottom Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="relative z-10 flex h-[84dvh] sm:h-[680px] max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[28px] sm:rounded-2xl border-t border-white/10 sm:border bg-zinc-950/98 backdrop-blur-2xl text-zinc-100 shadow-2xl sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─── Mobile Drag Indicator ─── */}
            <div className="w-full flex items-center justify-center pt-2.5 pb-1 sm:hidden shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* ─── Minimal Header ─── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07] shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Comments</h3>
                <span className="text-[11px] font-semibold text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full">
                  {totalCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Toggle Button */}
                <button
                  type="button"
                  onClick={() => setSortMode((prev) => (prev === "best" ? "latest" : "best"))}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-zinc-300 transition-colors cursor-pointer"
                  title="Toggle comment sorting"
                >
                  {sortMode === "best" ? (
                    <>
                      <Flame className="size-3 text-amber-400" />
                      <span>Top</span>
                    </>
                  ) : (
                    <>
                      <History className="size-3 text-blue-400" />
                      <span>Newest</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="size-8 rounded-full bg-white/[0.06] hover:bg-white/12 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close comments"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* ─── Ultra-Compact Context Line (Clean & Mobile First) ─── */}
            {cleanSnippet && (
              <div className="px-4 py-1.5 border-b border-white/[0.05] bg-white/[0.02] flex items-center gap-2 text-xs text-zinc-400 shrink-0">
                <span className="font-semibold text-zinc-300 shrink-0">@{authorHandle}:</span>
                <span className="truncate">{cleanSnippet}</span>
              </div>
            )}

            {/* ─── Scrollable Comments Thread List ─── */}
            <div
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-4 scroll-smooth"
            >
              {isLoading ? (
                <div className="space-y-4 pt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse pt-2">
                      <div className="size-8 rounded-full bg-zinc-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 bg-zinc-800 rounded-md" />
                        <div className="h-3.5 w-3/4 bg-zinc-800/70 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : rootComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-2">
                  <div className="size-11 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-500">
                    <MessageCircle className="size-5 stroke-1" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-300">No comments yet</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    Be the first to share your thoughts with campus!
                  </p>
                </div>
              ) : (
                rootComments.map((rootComment) => {
                  const childReplies = repliesMap.get(rootComment.id) || [];
                  return (
                    <div key={rootComment.id} className="space-y-2.5">
                      <CommentRowItem
                        comment={rootComment}
                        onReply={handleStartReply}
                        onToggleLike={handleToggleLike}
                        isLiked={Boolean(likedComments[rootComment.id])}
                        currentUserId={profile?.id}
                        postAuthorId={post.authorId}
                        onClose={onClose}
                      />

                      {/* Nested Replies with Subtle Connector Line */}
                      {childReplies.length > 0 && (
                        <div className="mt-2 pl-4 ml-3 border-l-2 border-white/10 space-y-2.5">
                          {childReplies.map((reply) => (
                            <CommentRowItem
                              key={reply.id}
                              comment={reply}
                              isReply
                              onReply={handleStartReply}
                              onToggleLike={handleToggleLike}
                              isLiked={Boolean(likedComments[reply.id])}
                              currentUserId={profile?.id}
                              postAuthorId={post.authorId}
                              onClose={onClose}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ─── Bottom Composer Bar (Mobile First & Pinned Above Keyboard) ─── */}
            <div className="p-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] bg-zinc-950 shrink-0 space-y-2">
              {/* Replying Context Banner */}
              {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
                  <span className="text-zinc-400 text-[11px] font-medium flex items-center gap-1.5">
                    <Reply className="size-3 text-purple-400 shrink-0" />
                    <span>
                      Replying to <strong className="text-zinc-200">@{replyingTo.handle}</strong>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="size-5 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Current User Avatar */}
                <Avatar className="size-8 rounded-full border border-white/15 shrink-0">
                  <AvatarImage src={isAnonymous ? "" : profile?.avatarUrl || ""} />
                  <AvatarFallback className="text-[10px] font-bold bg-zinc-800 text-zinc-300">
                    {isAnonymous ? <VenetianMask className="size-4 text-purple-400" /> : profile?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Input Capsule */}
                <div className="relative flex-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] focus-within:border-purple-500/40 focus-within:bg-white/[0.08] px-3.5 py-1.5 transition-colors">
                  <MentionSuggestions
                    trigger={mentionTrigger}
                    onSelect={handleSelectSuggestion}
                    onClose={() => setMentionTrigger(null)}
                    className="bottom-full mb-2 left-0"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) handleUploadCommentFiles(files);
                    }}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      replyingTo
                        ? `Reply to @${replyingTo.handle}...`
                        : isAnonymous
                          ? "Comment anonymously..."
                          : "Add a comment..."
                    }
                    value={commentText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={handleComposerFocus}
                    enterKeyHint="send"
                    className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
                    maxLength={500}
                  />

                  {/* Photo Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer disabled:opacity-40"
                    title="Attach photo"
                    aria-label="Attach photo"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="size-4 animate-spin text-purple-400" />
                    ) : (
                      <ImageIcon className="size-4" />
                    )}
                  </button>

                  {/* Anonymous Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => {
                      haptics.light();
                      const next = !isAnonymous;
                      setIsAnonymous(next);
                      toast.info(next ? "Commenting anonymously" : "Commenting publicly");
                    }}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                      isAnonymous
                        ? "bg-purple-950/80 text-purple-300 border border-purple-500/40"
                        : "text-zinc-400 hover:text-white"
                    )}
                    title={isAnonymous ? "Anonymous comment" : "Public comment"}
                  >
                    <VenetianMask className="size-3.5" />
                    <span>{isAnonymous ? "Anon" : "Public"}</span>
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  disabled={!commentText.trim() || isSubmitting}
                  onClick={handleSendComment}
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md",
                    commentText.trim() && !isSubmitting
                      ? "bg-gradient-to-tr from-purple-600 to-indigo-500 text-white hover:opacity-95 active:scale-90 shadow-purple-500/25"
                      : "bg-white/10 text-zinc-500 cursor-not-allowed"
                  )}
                  aria-label="Send comment"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUp className="size-4 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// Single Comment Row Component
// ─────────────────────────────────────────────────────────────

function CommentRowItem({
  comment,
  isReply = false,
  onReply,
  onToggleLike,
  isLiked,
  currentUserId,
  postAuthorId,
  onClose,
}: {
  comment: FastComment;
  isReply?: boolean;
  onReply: (c: FastComment, handle: string, displayName: string) => void;
  onToggleLike: (id: string) => void;
  isLiked: boolean;
  currentUserId?: string | null;
  postAuthorId?: string | null;
  onClose: () => void;
}) {
  const isAnon = comment.isAnonymous;
  const cDisplayName = isAnon ? "Anonymous Student" : comment.author?.displayName || "Student";
  const cHandle = isAnon ? comment.pseudonym || "anonymous" : comment.author?.username || "student";
  const cAvatar = isAnon ? "" : getAvatarUrl(comment.author?.avatarUrl, comment.author?.username ?? "student");
  const isCurrentUser = currentUserId && comment.authorId === currentUserId;
  const isOP = postAuthorId && comment.authorId === postAuthorId;

  return (
    <div className={cn("flex items-start gap-2.5 group", isReply ? "text-xs" : "")}>
      {isAnon ? (
        <div
          className={cn(
            "rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300 mt-0.5",
            isReply ? "size-7" : "size-8"
          )}
        >
          <VenetianMask className={isReply ? "size-3.5" : "size-4"} />
        </div>
      ) : (
        <Link href={`/@${cHandle}`} onClick={onClose} className="shrink-0 mt-0.5">
          <Avatar
            className={cn(
              "rounded-full border border-white/10 hover:opacity-90 transition-opacity",
              isReply ? "size-7" : "size-8"
            )}
          >
            <AvatarImage src={cAvatar} />
            <AvatarFallback className="text-[10px] font-bold bg-zinc-800 text-zinc-300">
              {cDisplayName[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isAnon ? (
              <span className="text-xs font-semibold text-zinc-200 truncate">{cDisplayName}</span>
            ) : (
              <Link
                href={`/@${cHandle}`}
                onClick={onClose}
                className="text-xs font-semibold text-zinc-200 truncate hover:underline hover:text-white transition-colors"
              >
                {cDisplayName}
              </Link>
            )}

            {isCurrentUser && (
              <span className="text-[9px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-md">
                You
              </span>
            )}
            {isOP && !isCurrentUser && (
              <span className="text-[9px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-md">
                Author
              </span>
            )}

            <span className="text-[11px] text-zinc-500">{formatTimeAgo(comment.createdAt)}</span>
          </div>
        </div>

        {/* Comment text with embeds disabled so user profiles / post embeds don't inflate inside comments */}
        <div className="text-[13px] text-zinc-200 leading-relaxed break-words font-normal select-text">
          <RichText content={comment.body} disableEmbeds={true} />
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-4 pt-0.5">
          <button
            type="button"
            onClick={() => onToggleLike(comment.id)}
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Heart
              className={cn(
                "size-3.5 transition-transform active:scale-125",
                isLiked ? "fill-rose-500 text-rose-500" : "text-zinc-500"
              )}
            />
            {isLiked && <span className="tabular-nums text-[11px] text-rose-500 font-bold">1</span>}
          </button>

          {!isReply && (
            <button
              type="button"
              onClick={() => onReply(comment, cHandle, cDisplayName)}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
