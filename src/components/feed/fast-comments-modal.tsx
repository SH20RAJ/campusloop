"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  ChevronDown,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Reply,
  Shield,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { AnimateImage } from "@/components/ui/animated-icon";
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
  const [sortMode, setSortMode] = useState<"best" | "latest" | "oldest">("best");
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

  // ─── Visual Viewport tracking for mobile virtual keyboard insets (Fixes Image 3 bug) ───
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;

    function handleViewportChange() {
      if (!vv) return;
      const currentHeight = vv.height;
      setViewportHeight(currentHeight);

      // Calculates how much the mobile software keyboard is pushing up
      const offset = Math.max(0, window.innerHeight - currentHeight - (vv.offsetTop || 0));
      setKeyboardOffset(offset);

      if (offset > 0 && scrollContainerRef.current) {
        setTimeout(scrollToBottom, 80);
      }
    }

    vv.addEventListener("resize", handleViewportChange);
    vv.addEventListener("scroll", handleViewportChange);
    handleViewportChange();

    return () => {
      vv.removeEventListener("resize", handleViewportChange);
      vv.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  async function handleUploadCommentFiles(files: File[]) {
    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length === 0) return;

    setIsUploadingImage(true);
    try {
      toast.loading("Uploading attached image...", { id: "comment-img" });
      const uploaded = await uploadImageToImgBB(validImageFiles[0]);
      const imgMarkdown = `\n![Image](${uploaded.displayUrl || uploaded.url})`;
      setCommentText((prev) => `${prev.trim()}${imgMarkdown}`);
      toast.success("Image attached 📸", { id: "comment-img" });
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
          toast.success("Sticker / GIF attached! 📸");
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

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 180);
    } else {
      setCommentText("");
      setReplyingTo(null);
    }
  }, [isOpen]);

  const handleToggleLike = (commentId: string) => {
    sounds.tap();
    haptics.light();
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  function handleStartReply(c: FastComment, handle: string, displayName: string) {
    sounds.tap();
    haptics.light();
    setReplyingTo({ id: c.id, handle, displayName });
    setCommentText((prev) => {
      const prefix = `@${handle} `;
      if (prev.startsWith(prefix)) return prev;
      return `${prefix}${prev}`;
    });
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

  const handleInsertEmoji = (emoji: string) => {
    sounds.tap();
    haptics.light();
    setCommentText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const authorHandle = post.isAnonymous
    ? post.pseudonym || "anonymous"
    : post.author?.username || "student";

  // Dynamic sorting (matching Image 2)
  const sortedComments = useMemo(() => {
    const list = [...(comments || [])];
    if (sortMode === "latest") {
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sortMode === "oldest") {
      return list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    // "best" (default): sort by likes/points
    return list.sort(
      (a, b) =>
        (b.author?.points || 0) +
        (likedComments[b.id] ? 1 : 0) -
        ((a.author?.points || 0) + (likedComments[a.id] ? 1 : 0))
    );
  }, [comments, sortMode, likedComments]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center select-none overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal / Bottom Drawer Container with Keyboard Inset & 100dvh flex column */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 38 }}
            style={{
              maxHeight: viewportHeight ? `${Math.min(viewportHeight * 0.94, 760)}px` : "92dvh",
              height: viewportHeight ? `${Math.min(viewportHeight * 0.94, 760)}px` : "88dvh",
              paddingBottom: keyboardOffset > 0 ? `${keyboardOffset}px` : undefined,
            }}
            className="relative z-10 w-full sm:max-w-lg bg-[#0d0d16]/98 text-foreground rounded-t-[32px] sm:rounded-3xl border-t border-purple-500/25 sm:border sm:border-purple-500/30 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─── Mobile Drag Indicator ─── */}
            <div className="w-full flex items-center justify-center pt-3 pb-1 sm:hidden shrink-0">
              <div className="w-12 h-1 rounded-full bg-white/20" />
            </div>

            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4.5 text-purple-400" />
                <h3 className="text-base font-black text-foreground tracking-tight">Comments</h3>
                <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                  {comments?.length ?? post.commentsCount ?? 0}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* ─── Original Post Context Card (matching Image 2) ─── */}
            <div className="mx-4 mt-2.5 mb-1.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3 shrink-0">
              <Avatar className="size-9 rounded-full border border-purple-500/30 shrink-0 mt-0.5">
                <AvatarImage src={post.isAnonymous ? "" : post.author?.avatarUrl || ""} />
                <AvatarFallback className="text-[11px] font-black bg-muted text-foreground">
                  {post.isAnonymous ? "🙈" : post.author?.displayName?.[0] || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-foreground truncate">@{authorHandle}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed line-clamp-3 font-normal">
                  {post.body}
                </p>
              </div>
            </div>

            {/* ─── Sort & Filter Bar (matching Image 2) ─── */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b border-white/[0.06] text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <span>🔥</span>
                <span>Top comments</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <span>Sort by</span>
                <button
                  type="button"
                  onClick={() =>
                    setSortMode((prev) =>
                      prev === "best" ? "latest" : prev === "latest" ? "oldest" : "best"
                    )
                  }
                  className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-semibold text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{sortMode === "best" ? "Best" : sortMode === "latest" ? "Latest" : "Oldest"}</span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* ─── Scrollable Comments List (flex-1 min-h-0 so composer stays visible above keyboard) ─── */}
            <div
              ref={scrollContainerRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-3 space-y-4 divide-y divide-white/[0.06] scroll-smooth"
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
              ) : sortedComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-2">
                  <div className="size-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-muted-foreground">
                    <MessageCircle className="size-6 stroke-1" />
                  </div>
                  <p className="text-xs font-bold text-foreground">No comments yet</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Start the conversation! Drop a reaction or reply to share your thoughts with campus.
                  </p>
                </div>
              ) : (
                sortedComments.map((c) => {
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
                  const isCurrentUser = profile?.id && c.authorId === profile.id;
                  const isOP = post.authorId && c.authorId === post.authorId;

                  return (
                    <div key={c.id} className="flex items-start gap-3 pt-3.5 first:pt-0 group">
                      {isAnon ? (
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground mt-0.5">
                          <Shield className="size-4" />
                        </div>
                      ) : (
                        <Link href={`/@${cHandle}`} onClick={onClose} className="shrink-0 mt-0.5">
                          <Avatar className="size-8 rounded-full border border-white/10 hover:opacity-90 transition-opacity">
                            <AvatarImage src={cAvatar} />
                            <AvatarFallback className="text-[10px] font-bold">
                              {cDisplayName[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-foreground truncate">
                              {cDisplayName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold bg-purple-950/70 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-md">
                                You
                              </span>
                            )}
                            {isOP && !isCurrentUser && (
                              <span className="text-[10px] font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-md">
                                OP
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {formatTimeAgo(c.createdAt)}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="size-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </button>
                        </div>

                        <div className="text-[13px] text-foreground/95 leading-relaxed break-words font-normal">
                          <RichText content={c.body} />
                        </div>

                        {/* Comment Actions: Heart + Reply */}
                        <div className="flex items-center gap-4 pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(c.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Heart
                              className={cn(
                                "size-3.5 transition-transform active:scale-125",
                                isLiked ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "tabular-nums text-xs",
                                isLiked && "text-rose-500 font-bold"
                              )}
                            >
                              {(c.author?.points || 0) + (isLiked ? 1 : 0) || (isLiked ? 1 : "")}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartReply(c, cHandle, cDisplayName)}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ─── Quick Emoji Reaction Bar (matching Image 2) ─── */}
            <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-between gap-1 overflow-x-auto shrink-0 bg-white/[0.02]">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                  className="size-9 sm:size-10 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-base sm:text-lg hover:scale-115 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleInsertEmoji("✨")}
                className="size-9 sm:size-10 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-white hover:scale-115 active:scale-95 transition-all cursor-pointer shadow-xs"
                aria-label="Add reaction"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* ─── Bottom Composer Bar (matching Image 2) ─── */}
            <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0d0d16] shrink-0 space-y-2">
              {/* Replying Context Banner */}
              {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Reply className="size-3 text-purple-400 shrink-0" />
                    <span>
                      Replying to <strong className="text-foreground">@{replyingTo.handle}</strong>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      if (commentText.startsWith(`@${replyingTo.handle} `)) {
                        setCommentText(commentText.replace(`@${replyingTo.handle} `, ""));
                      }
                    }}
                    className="size-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                {/* Current User Avatar */}
                <Avatar className="size-9 rounded-full border border-white/15 shrink-0">
                  <AvatarImage src={isAnonymous ? "" : profile?.avatarUrl || ""} />
                  <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                    {isAnonymous ? "🙈" : profile?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Input Capsule with embedded Photo and GIF actions */}
                <div className="relative flex-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 focus-within:border-purple-500/50 transition-colors">
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
                          : `Add a comment as @${profile?.username || "you"}...`
                    }
                    value={commentText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
                    maxLength={500}
                  />

                  {/* Photo Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer disabled:opacity-40"
                    title="Attach photo"
                    aria-label="Attach photo"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="size-4 animate-spin text-purple-400" />
                    ) : (
                      <AnimateImage size={15} />
                    )}
                  </button>

                  {/* GIF Badge Button (matching Image 2) */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      toast.info("Tip: You can paste any GIF link or image from your clipboard!");
                    }}
                    className="px-1.5 py-0.5 rounded-md border border-white/20 text-[10px] font-black text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Insert GIF"
                  >
                    GIF
                  </button>

                  {/* Anonymous Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => setIsAnonymous((prev) => !prev)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                      isAnonymous
                        ? "bg-purple-950/80 text-purple-300 border border-purple-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title={isAnonymous ? "Commenting Anonymously" : "Commenting as yourself"}
                  >
                    {isAnonymous ? (
                      <>
                        <Shield className="size-3" />
                        <span>Anon</span>
                      </>
                    ) : (
                      <>
                        <User className="size-3" />
                        <span className="hidden sm:inline">Public</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Send Button: Elevated Circular Purple Gradient Button (matching Image 2) */}
                <button
                  type="button"
                  disabled={!commentText.trim() || isSubmitting}
                  onClick={handleSendComment}
                  className="size-10 rounded-full bg-gradient-to-tr from-purple-600 via-primary to-indigo-500 text-white flex items-center justify-center hover:opacity-95 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                  aria-label="Send comment"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUp className="size-4.5 stroke-[2.5]" />
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
