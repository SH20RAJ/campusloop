"use client";

import { ArrowDown, ArrowUp, ExternalLink, Eye, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
  AnimateBookOpen,
  AnimateDownload,
  AnimatedIcon,
  AnimateGraduationCap,
  AnimateMessageSquare,
  AnimateShare,
  AnimateShieldCheck,
} from "@/components/ui/animated-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

interface AcademicCardProps {
  item: {
    id: string;
    title: string;
    description?: string | null;
    subjectCode: string;
    subjectName: string;
    branch: string;
    semester: number;
    resourceType: string;
    moduleOrChapter?: string | null;
    fileUrl?: string | null;
    driveUrl?: string | null;
    tags?: any;
    upvotesCount: number;
    downvotesCount?: number;
    downloadsCount: number;
    viewsCount: number;
    isVerified: boolean;
    commentsCount?: number;
    createdAt: string | Date;
    uploader: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      points?: number | null;
    };
    institution?: { id: string; name: string; slug: string } | null;
  };
  currentUserId?: string;
  isHighlighted?: boolean;
}

export function AcademicCard({ item, currentUserId, isHighlighted }: AcademicCardProps) {
  const [upvotes, setUpvotes] = useState(item.upvotesCount || 0);
  const [downvotes, setDownvotes] = useState(item.downvotesCount || 0);
  const [downloads, setDownloads] = useState(item.downloadsCount || 0);
  const [views, setViews] = useState(item.viewsCount || 1);
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(null);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHelpful, setIsHelpful] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch comments when comments section is opened
  const { data: commentsData, mutate: mutateComments } = useSWR<{ comments: any[] }>(
    showComments ? `/api/academics/${item.id}/comments` : null,
    fetcher
  );
  const commentsList = commentsData?.comments || [];

  const avatar = getAvatarUrl(item.uploader.avatarUrl, item.uploader.username);
  const totalVotes = upvotes + downvotes;
  const reliability = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 100;

  async function handleVote(type: "UP" | "DOWN") {
    if (!currentUserId) {
      toast.info("Sign in with college email to upvote and earn 50 LP!", {
        action: {
          label: "Sign In",
          onClick: () => {
            window.location.href = `/handler/sign-in?returnTo=/app/academics/${item.id}`;
          },
        },
      });
      return;
    }

    sounds.pop();
    haptics.medium();

    if (type === "UP") {
      if (userVote === "UP") {
        setUpvotes((c) => Math.max(0, c - 1));
        setUserVote(null);
        fetch(`/api/academics/${item.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UNDO_UPVOTE" }),
        }).catch(() => {});
      } else {
        if (userVote === "DOWN") setDownvotes((c) => Math.max(0, c - 1));
        setUpvotes((c) => c + 1);
        setUserVote("UP");
        toast.success("Upvoted! Notes marked as reliable & helpful 📚");
        fetch(`/api/academics/${item.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPVOTE" }),
        }).catch(() => {});
      }
    } else {
      if (userVote === "DOWN") {
        setDownvotes((c) => Math.max(0, c - 1));
        setUserVote(null);
        fetch(`/api/academics/${item.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UNDO_DOWNVOTE" }),
        }).catch(() => {});
      } else {
        if (userVote === "UP") setUpvotes((c) => Math.max(0, c - 1));
        setDownvotes((c) => c + 1);
        setUserVote("DOWN");
        toast.info("Flagged notes reliability");
        fetch(`/api/academics/${item.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "DOWNVOTE" }),
        }).catch(() => {});
      }
    }
  }

  async function handleDownload() {
    sounds.tap();
    haptics.light();
    setDownloads((prev) => prev + 1);

    const targetUrl = item.fileUrl || item.driveUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    } else {
      toast.info("Notes are compiling for preview...");
    }

    try {
      await fetch(`/api/academics/${item.id}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DOWNLOAD" }),
      });
    } catch {}
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    sounds.tap();
    haptics.light();

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";
    const shareUrl = `${baseUrl}/app/academics/${item.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: `Check out ${item.subjectCode}: ${item.subjectName} notes on CampusLoop!`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Resource link copied to clipboard! 📋");
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUserId) {
      toast.info("Sign in with college email to post comments & doubts!", {
        action: {
          label: "Sign In",
          onClick: () => {
            window.location.href = `/handler/sign-in?returnTo=/app/academics/${item.id}`;
          },
        },
      });
      return;
    }

    setIsSubmittingComment(true);
    sounds.send();
    haptics.medium();

    try {
      const res = await fetch(`/api/academics/${item.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentText.trim(), isHelpful }),
      });
      const data = (await res.json()) as { comment?: any; error?: string };
      if (res.ok && data.comment) {
        toast.success("Review & comment posted! 💬");
        setCommentText("");
        mutateComments();
      } else {
        toast.error(data.error || "Failed to post comment");
      }
    } catch {
      toast.error("Network error posting comment");
    } finally {
      setIsSubmittingComment(false);
    }
  }

  return (
    <article
      id={`academic-${item.id}`}
      className={cn(
        "px-4 py-3.5 border-b border-border/25 hover:bg-muted/10 transition-colors select-none",
        isHighlighted && "bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Left Column: Author Avatar */}
        <Link href={`/@${item.uploader.username}`} className="shrink-0 mt-0.5">
          <Avatar className="size-10 rounded-full border border-border/40 hover:opacity-90 transition-opacity">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
              {item.uploader.displayName[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Right Column: Tweet Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header Row: Author Name, Handle, Time, and Type Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <Link
                href={`/@${item.uploader.username}`}
                className="text-sm font-bold text-foreground hover:underline truncate"
              >
                {item.uploader.displayName}
              </Link>
              {(item.uploader.points || 0) >= 150 && (
                <AnimatedIcon
                  icon={AnimateShieldCheck}
                  animation="pop"
                  size={13}
                  className="text-brand shrink-0"
                />
              )}
              <span className="text-xs text-muted-foreground truncate">
                @{item.uploader.username}
              </span>
              <span className="text-[11px] text-muted-foreground/60">·</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatTimeAgo(item.createdAt)}
              </span>
            </div>

            {/* Type & Share */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {item.resourceType.replace("_", " ")}
              </span>

              <button
                type="button"
                onClick={handleShare}
                className="size-7 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                title="Share or Copy Link"
              >
                <AnimatedIcon icon={AnimateShare} animation="pop" size={13} />
              </button>
            </div>
          </div>

          {/* Subject Badge & Title */}
          <div className="space-y-1">
            <Link
              href={`/app/academics/${item.id}`}
              onClick={() => sounds.tap()}
              className="block group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                <span className="font-mono font-bold text-primary">{item.subjectCode}</span>
                <span>·</span>
                <span className="truncate">{item.subjectName}</span>
                {item.moduleOrChapter && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-amber-500">{item.moduleOrChapter}</span>
                  </>
                )}
              </div>

              <h3 className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                {item.title}
              </h3>
            </Link>

            {item.description && (
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* Subtle Context Row */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5 flex-wrap">
            <span>Sem {item.semester}</span>
            <span>·</span>
            <span>{item.branch}</span>
            {item.institution && (
              <>
                <span>·</span>
                <span className="truncate">{item.institution.name.split(",")[0]}</span>
              </>
            )}
            <span className="ml-auto text-[10px] font-bold text-emerald-500">
              🎯 {reliability}% Verified
            </span>
          </div>

          {/* Twitter Action Bar */}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            {/* Comments Toggle */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-sky-400 transition-colors cursor-pointer group"
            >
              <span className="p-1.5 rounded-full group-hover:bg-sky-500/10 transition-colors">
                <AnimatedIcon icon={AnimateMessageSquare} animation="pop" size={14} />
              </span>
              <span className="text-[11px] font-semibold tabular-nums">
                {commentsList.length || item.commentsCount || 0}
              </span>
            </button>

            {/* Upvote / Downvote */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleVote("UP")}
                className={cn(
                  "flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group",
                  userVote === "UP" && "text-primary font-bold"
                )}
                title="Upvote"
              >
                <span className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                  <ArrowUp className={cn("size-3.5", userVote === "UP" && "stroke-3")} />
                </span>
                <span className="text-[11px] font-semibold tabular-nums">{upvotes}</span>
              </button>

              <button
                type="button"
                onClick={() => handleVote("DOWN")}
                className={cn(
                  "p-1.5 rounded-full hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer",
                  userVote === "DOWN" && "text-rose-400"
                )}
                title="Downvote errata"
              >
                <ArrowDown className="size-3.5" />
              </button>
            </div>

            {/* Views */}
            <span className="flex items-center gap-1 text-[11px] opacity-70">
              <Eye className="size-3.5" />
              <span className="tabular-nums">{views}</span>
            </span>

            {/* Downloads */}
            <span className="flex items-center gap-1 text-[11px] opacity-70">
              <AnimatedIcon icon={AnimateDownload} animation="nudge-up" size={13} />
              <span className="tabular-nums">{downloads}</span>
            </span>

            {/* Get Notes Action Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <span>Get</span>
              <ExternalLink className="size-2.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Expandable Peer Reviews & Reliability Comments (Twitter Thread Style) ─── */}
      {showComments && (
        <div className="mt-2.5 ml-0 sm:ml-11 border-l-2 border-border/25 pl-3 sm:pl-4 space-y-3">
          {/* Comment Composer */}
          <form
            onSubmit={handleSubmitComment}
            className="flex flex-col gap-2 py-2 border-b border-border/20"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Is this material accurate?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsHelpful(true)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                    isHelpful
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  ✅ Accurate
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpful(false)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                    !isHelpful
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  ⚠️ Errata
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Post your reply or verification..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-muted/30 px-3 py-1.5 rounded-full text-xs text-foreground placeholder:text-muted-foreground/60 border border-border/30 outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black disabled:opacity-40 hover:opacity-90 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                Reply
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar divide-y divide-border/15">
            {commentsList.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic py-2 text-center">
                No peer comments yet. Be the first to verify!
              </p>
            ) : (
              commentsList.map((c) => (
                <div key={c.id} className="pt-2 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span>{c.author?.displayName || "Student"}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        @{c.author?.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">·</span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black px-1.5 py-0.2 rounded-full",
                        c.isHelpful
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      )}
                    >
                      {c.isHelpful ? "Helpful ✅" : "Notice ⚠️"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 font-normal leading-relaxed">{c.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
}
