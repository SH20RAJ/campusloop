"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { MessageSquare, Lock, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { CommentItem, CommentWithAuthor } from "@/components/post/comment-item";
import { toast } from "sonner";
import { uploadImageToImgBB } from "@/lib/upload";

export function PostComments({ postId, currentUser }: { postId: string; currentUser?: unknown }) {
  const { data: comments, isLoading, mutate } = useSWR<CommentWithAuthor[]>(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isAnonymous }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setCommentText("");
      setCommentImage(null);
      toast.success("Comment added!");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePostReply(parentId: string) {
    if (!replyBody.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody, isAnonymous: replyIsAnon, parentId }),
      });

      if (!res.ok) throw new Error("Failed to post reply");

      setReplyBody("");
      setReplyingToId(null);
      toast.success("Reply added!");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  const topLevelComments = (comments || []).filter((c) => !c.parentId);
  const getReplies = (parentId: string) => (comments || []).filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-3">
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Discussion Header */}
      <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2 px-1">
        <MessageSquare className="size-4 text-primary" />
        Discussion
        {!isLoading && (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 border border-border/40 rounded-full px-2 py-0.5 normal-case tracking-normal">
            {(comments || []).length}
          </span>
        )}
      </h3>

      {/* Top Comment Input Box */}
      <form onSubmit={handlePostComment} className="space-y-2 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Join the discussion... (Be respectful to fellow students)"
          rows={2}
          className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary resize-none font-medium"
        />

        {/* Comment image preview */}
        {commentImage && (
          <div className="relative inline-block rounded-xl overflow-hidden border border-border shadow-xs max-w-[120px] max-h-[120px]">
            <img src={commentImage} alt="Comment attachment" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setCommentImage(null)}
              className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-destructive transition-colors cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isAnonymous ? "bg-pink-500/10 text-pink-500 border-pink-500/20" : "bg-muted/30 text-muted-foreground border-border/40"
              }`}
            >
              <Lock className="size-3" />
              {isAnonymous ? "Anon" : "Public"}
            </button>

            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold px-2.5 py-1 rounded-lg border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
            >
              {isUploadingImage ? <Loader2 className="size-3 animate-spin text-primary" /> : <ImageIcon className="size-3 text-rose-500" />}
              <span>Photo</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!commentText.trim() && !commentImage) || isUploadingImage}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-1">
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

              {getReplies(comment.id).map((reply) => (
                <CommentItem
                  key={reply.id}
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
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-xs text-muted-foreground/60">
            No comments yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}
