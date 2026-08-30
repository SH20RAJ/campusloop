"use client";

import { Image as ImageIcon, Loader2, MessageCircle, Shield, Smile, User, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { CommentItem, type CommentWithAuthor } from "@/components/post/comment-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import {
  detectMentionTrigger,
  MentionSuggestions,
  type TriggerContext,
} from "@/components/ui/mention-autocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { rankAndThreadComments } from "@/lib/comments-algorithm";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface PostCommentsProps {
  postId: string;
  postAuthorId?: string | null;
  postAuthorHandle?: string | null;
}

export function PostComments({ postId, postAuthorId, postAuthorHandle }: PostCommentsProps) {
  const { profile } = useProfile();
  const {
    data: comments,
    isLoading,
    mutate,
  } = useSWR<CommentWithAuthor[]>(`/api/posts/${postId}/comments`, fetcher);

  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [sortMode, setSortMode] = useState<"TOP" | "LATEST">("TOP");
  const [mentionTrigger, setMentionTrigger] = useState<TriggerContext | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyIsAnon, setReplyIsAnon] = useState(false);

  function handleCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
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
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = before.length + replacement.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      toast.loading("Uploading photo...", { id: "cmt-upload" });
      const res = await uploadImageToImgBB(file);
      setCommentImage(res.displayUrl || res.url);
      toast.success("Photo attached! 📸", { id: "cmt-upload" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed", { id: "cmt-upload" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    let body = commentText.trim();
    if (commentImage) {
      body = body ? `${body}\n\n![Image](${commentImage})` : `![Image](${commentImage})`;
    }

    if (!body || isSubmitting) return;

    sounds.send();
    haptics.medium();

    const optimisticComment: CommentWithAuthor = {
      id: `temp_${Date.now()}`,
      postId,
      authorId: profile?.id || null,
      author: isAnonymous ? null : profile || null,
      pseudonym: isAnonymous ? profile?.anonymousUsername || "Anonymous Student" : null,
      parentId: null,
      body,
      isAnonymous,
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const previousComments = comments || [];
    mutate([optimisticComment, ...previousComments], false);
    setCommentText("");
    setCommentImage(null);

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isAnonymous }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      toast.success("Reply posted! 💬");
      mutate();
    } catch (err) {
      mutate(previousComments, false);
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePostReply(parentId: string) {
    if (!replyBody.trim() || isSubmitting) return;

    sounds.send();
    haptics.medium();

    const optimisticReply: CommentWithAuthor = {
      id: `temp_reply_${Date.now()}`,
      postId,
      authorId: profile?.id || null,
      author: replyIsAnon ? null : profile || null,
      pseudonym: replyIsAnon ? profile?.anonymousUsername || "Anonymous Student" : null,
      parentId,

      body: replyBody.trim(),
      isAnonymous: replyIsAnon,
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const previousComments = comments || [];
    mutate([...previousComments, optimisticReply], false);
    const bodyToSend = replyBody.trim();
    const anonToSend = replyIsAnon;

    setReplyBody("");
    setReplyingToId(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: bodyToSend, isAnonymous: anonToSend, parentId }),
      });

      if (!res.ok) throw new Error("Failed to post reply");
      toast.success("Reply added!");
      mutate();
    } catch (err) {
      mutate(previousComments, false);
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Instagram & Twitter/X Comments Ranking Algorithm
  const { topLevelComments, repliesMap } = useMemo(() => {
    return rankAndThreadComments(comments || [], {
      postAuthorId,
      viewerInstitutionId: profile?.institutionId,
      sortMode,
    });
  }, [comments, postAuthorId, profile?.institutionId, sortMode]);

  return (
    <div className="px-4 space-y-4 pt-3 select-none">
      {/* Hidden File Input */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ─── Twitter-Style Inline Reply Composer ─── */}
      <div className="border-b border-border/30 pb-4">
        {postAuthorHandle && (
          <p className="text-xs text-muted-foreground pb-2 px-1 font-medium">
            Replying to <span className="text-primary font-bold">@{postAuthorHandle}</span>
          </p>
        )}

        <form onSubmit={handlePostComment} className="flex gap-3">
          <Avatar className="size-10 rounded-full border border-border/40 shrink-0 mt-0.5">
            <AvatarImage src={isAnonymous ? "" : profile?.avatarUrl || ""} />
            <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
              {isAnonymous ? "🙈" : profile?.displayName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="relative flex-1 min-w-0 space-y-2">
            <MentionSuggestions
              trigger={mentionTrigger}
              onSelect={handleSelectSuggestion}
              onClose={() => setMentionTrigger(null)}
              className="bottom-full mb-2 left-0"
            />

            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={handleCommentChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handlePostComment(e);
                }
              }}
              placeholder={
                isAnonymous
                  ? profile?.anonymousUsername
                    ? `Post anonymously as @${profile.anonymousUsername}...`
                    : "Post your anonymous reply..."
                  : `Post your reply as @${profile?.username || "student"}...`
              }
              rows={2}
              className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none resize-none font-normal leading-relaxed pt-1"
            />

            {/* Comment Image Preview */}
            {commentImage && (
              <div className="relative inline-block rounded-2xl overflow-hidden shadow-xs max-w-[140px] max-h-[140px] border border-border/40">
                <img src={commentImage} alt="Attachment" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCommentImage(null)}
                  className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between pt-1 border-t border-border/20">
              <div className="flex items-center gap-1.5 text-primary">
                {/* Image Attach */}
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="size-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Attach Photo"
                >
                  {isUploadingImage ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <ImageIcon className="size-4.5" />
                  )}
                </button>

                {/* GIF Attach */}
                <button
                  type="button"
                  onClick={() => setShowGifPicker(true)}
                  className="size-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Attach GIF"
                >
                  <span className="text-[11px] font-black border border-primary/50 rounded px-1 leading-none">
                    GIF
                  </span>
                </button>

                {/* Sticker Attach */}
                <button
                  type="button"
                  onClick={() => setShowStickerPicker(true)}
                  className="size-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Attach Sticker"
                >
                  <Smile className="size-4.5" />
                </button>

                {/* Anonymous Toggle Pill */}
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    "ml-1 flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer",
                    isAnonymous
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isAnonymous ? (
                    <>
                      <Shield className="size-3" />
                      <span>Anon</span>
                    </>
                  ) : (
                    <>
                      <User className="size-3" />
                      <span>Public</span>
                    </>
                  )}
                </button>
              </div>

              {/* Submit Reply Button */}
              <button
                type="submit"
                disabled={isSubmitting || (!commentText.trim() && !commentImage) || isUploadingImage}
                className="px-4 py-1.5 text-xs font-black rounded-full bg-foreground text-background disabled:opacity-30 cursor-pointer shadow-xs hover:opacity-90 transition-all flex items-center gap-1.5 active:scale-95"
              >
                {isSubmitting && <Loader2 className="size-3 animate-spin" />}
                <span>Reply</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ─── Comments Section Header & Sort Switcher ─── */}
      <div className="flex items-center justify-between px-1 pt-1 pb-1">
        <h3 className="text-[15px] font-black text-foreground tracking-tight">
          Replies ({comments?.length || 0})
        </h3>

        {/* Algorithm Sort Pill (Top vs Latest) */}
        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-full border border-border/40 text-xs">
          <button
            type="button"
            onClick={() => setSortMode("TOP")}
            className={cn(
              "px-3 py-0.5 rounded-full font-bold transition-all cursor-pointer",
              sortMode === "TOP"
                ? "bg-foreground text-background font-black shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Relevant
          </button>
          <button
            type="button"
            onClick={() => setSortMode("LATEST")}
            className={cn(
              "px-3 py-0.5 rounded-full font-bold transition-all cursor-pointer",
              sortMode === "LATEST"
                ? "bg-foreground text-background font-black shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Latest
          </button>
        </div>
      </div>

      {/* GIF Picker Modal */}
      <GifPickerModal
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={(url) => {
          setCommentImage(url);
          toast.success("GIF selected!");
        }}
      />

      {/* Sticker Picker Modal */}
      <StickerPickerModal
        isOpen={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelectSticker={(sticker) => {
          setCommentImage(sticker.url);
          toast.success(`Attached "${sticker.name}" sticker!`);
        }}
      />

      {/* ─── Threaded Twitter Comments Stream ─── */}
      <div className="divide-y divide-border/25">
        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => {
            const replies = repliesMap.get(comment.id) || [];
            const isAuthor = Boolean(postAuthorId && comment.authorId === postAuthorId);

            return (
              <div key={comment.id} className="pt-2 pb-1">
                <CommentItem
                  comment={comment}
                  isPostAuthor={isAuthor}
                  hasReplies={replies.length > 0}
                  onReply={(id) => setReplyingToId(id)}
                  replyingToId={replyingToId}
                  replyBody={replyBody}
                  setReplyBody={setReplyBody}
                  setReplyingToId={setReplyingToId}
                  replyIsAnon={replyIsAnon}
                  setReplyIsAnon={setReplyIsAnon}
                  isSubmitting={isSubmitting}
                  submitReply={handlePostReply}
                />

                {/* Nested Replies Stream */}
                {replies.map((reply) => {
                  const isReplyAuthor = Boolean(postAuthorId && reply.authorId === postAuthorId);
                  return (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      depth={1}
                      isPostAuthor={isReplyAuthor}
                      onReply={(id) => setReplyingToId(id)}
                      replyingToId={replyingToId}
                      replyBody={replyBody}
                      setReplyBody={setReplyBody}
                      setReplyingToId={setReplyingToId}
                      replyIsAnon={replyIsAnon}
                      setReplyIsAnon={setReplyIsAnon}
                      isSubmitting={isSubmitting}
                      submitReply={handlePostReply}
                    />
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-xs text-muted-foreground space-y-1.5">
            <MessageCircle className="size-8 mx-auto text-muted-foreground/30" />
            <p className="font-bold text-foreground">No replies yet</p>
            <p className="text-[11px]">Be the first classmate to reply to this thread!</p>
          </div>
        )}
      </div>
    </div>
  );
}
