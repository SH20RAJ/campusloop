"use client";

import { CommentItem,CommentWithAuthor } from "@/components/post/comment-item";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import {
detectMentionTrigger,
MentionSuggestions,
TriggerContext,
} from "@/components/ui/mention-autocomplete";
import { Skeleton } from "@/components/ui/skeleton";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/upload";
import {
Image as ImageIcon,
Loader2,
Lock,
MessageSquare,
Send,
Smile,
X,
Zap,
} from "lucide-react";

import { useRef,useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";


export function PostComments({ postId }: { postId: string }) {
  const { profile } = useProfile();
  const { data: comments, isLoading, mutate } = useSWR<CommentWithAuthor[]>(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [mentionTrigger, setMentionTrigger] = useState<TriggerContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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


  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyIsAnon, setReplyIsAnon] = useState(false);

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

    // Build optimistic comment object
    const optimisticComment: CommentWithAuthor = {
      id: `temp_${Date.now()}`,
      postId,
      authorId: profile?.id || null,
      author: isAnonymous ? null : (profile || null),
      pseudonym: isAnonymous ? "Anonymous Student" : null,
      parentId: null,
      body,
      isAnonymous,
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const previousComments = comments || [];
    // Instant optimistic injection
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
      toast.success("Comment added! 💬");
      mutate();
    } catch (err) {
      // Rollback on failure
      mutate(previousComments, false);
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePostReply(parentId: string) {
    if (!replyBody.trim() || isSubmitting) return;

    const optimisticReply: CommentWithAuthor = {
      id: `temp_reply_${Date.now()}`,
      postId,
      authorId: profile?.id || null,
      author: replyIsAnon ? null : (profile || null),
      pseudonym: replyIsAnon ? "Anonymous Student" : null,
      parentId,
      body: replyBody.trim(),
      isAnonymous: replyIsAnon,
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const previousComments = comments || [];
    mutate([...previousComments, optimisticReply], false);
    setReplyBody("");
    setReplyingToId(null);

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: optimisticReply.body, isAnonymous: replyIsAnon, parentId }),
      });

      if (!res.ok) throw new Error("Failed to post reply");
      toast.success("Reply added! 💬");
      mutate();
    } catch (err) {
      mutate(previousComments, false);
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  const topLevelComments = (comments || []).filter((c) => !c.parentId);
  const getReplies = (parentId: string) => (comments || []).filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-4 select-none">
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Discussion Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          Campus Discussion
          {!isLoading && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 rounded-full px-2.5 py-0.5 normal-case tracking-normal">
              {(comments || []).length} Comments
            </span>
          )}
        </h3>

        <span className="text-[10px] font-semibold text-muted-foreground hidden sm:inline-block">
          Press Enter to Post • Markdown Supported
        </span>
      </div>

      {/* ─── Facebook-Style Rich Comment Box ─── */}
      <form
        onSubmit={handlePostComment}
        className="bg-card p-4 rounded-3xl shadow-2xs space-y-3 transition-colors"
      >
        <div className="flex items-start gap-3">
          <Avatar className="size-8 shrink-0 mt-0.5">
            <AvatarImage src={isAnonymous ? "" : profile?.avatarUrl || ""} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
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
                  ? "Write an anonymous reply..."
                  : `Reply as @${profile?.username || "student"}...`
              }
              rows={2}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none resize-none font-medium leading-relaxed"
            />


            {/* Comment image preview */}
            {commentImage && (
              <div className="relative inline-block rounded-2xl overflow-hidden shadow-xs max-w-[140px] max-h-[140px]">
                <img src={commentImage} alt="Comment attachment" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCommentImage(null)}
                  className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Anonymous Toggle */}
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnonymous
                  ? "bg-pink-500/10 text-pink-500 shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="size-3" />
              <span>{isAnonymous ? "Anon Mode" : "Public"}</span>
            </button>

            {/* Photo Attachment */}
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isUploadingImage ? (
                <Loader2 className="size-3.5 animate-spin text-primary" />
              ) : (
                <ImageIcon className="size-3.5 text-rose-500" />
              )}
              <span>Photo</span>
            </button>

            {/* GIF Attachment */}
            <button
              type="button"
              onClick={() => setShowGifPicker(true)}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="text-[10px] font-black leading-none">GIF</span>
            </button>

            {/* Sticker Attachment */}
            <button
              type="button"
              onClick={() => setShowStickerPicker(true)}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Smile className="size-3.5" />
              <span className="text-[10px] font-black leading-none hidden sm:inline">Sticker</span>
            </button>
          </div>

          {/* Send Comment Button */}
          <button
            type="submit"
            disabled={isSubmitting || (!commentText.trim() && !commentImage) || isUploadingImage}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground disabled:opacity-40 cursor-pointer shadow-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Send className="size-3" />
            )}
            <span>Comment</span>
          </button>
        </div>
      </form>

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

      {/* ─── Facebook-Style Comments Stream ─── */}
      <div className="space-y-3 pt-2">
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-2 bg-card rounded-3xl p-3.5 shadow-2xs">
              <CommentItem
                comment={comment}
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
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="pt-1">
                  <CommentItem
                    comment={reply}
                    depth={1}
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
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-12 rounded-3xl border border-dashed border-border bg-card text-xs text-muted-foreground space-y-2">
            <Zap className="size-5 mx-auto text-muted-foreground/40" />
            <p className="font-bold text-foreground">No replies on this post yet.</p>
            <p className="text-[11px]">Be the first classmate to drop your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
