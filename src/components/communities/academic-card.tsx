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
        "p-4 border-b border-border/25 hover:bg-muted/5 transition-all select-none",
        isHighlighted && "bg-indigo-500/5 ring-2 ring-indigo-500/30 rounded-2xl"
      )}
    >
      {/* ─── Uploader Header ─── */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/@${item.uploader.username}`} className="shrink-0">
            <Avatar className="size-9 rounded-full border border-border/50">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-xs font-bold">
                {item.uploader.displayName[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <Link
                href={`/@${item.uploader.username}`}
                className="text-xs font-bold text-foreground hover:underline truncate"
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
              <span className="text-[11px] text-muted-foreground truncate">@{item.uploader.username}</span>
              <span className="text-[10px] text-muted-foreground/60">·</span>
              <span className="text-[11px] text-muted-foreground/80 shrink-0">
                {formatTimeAgo(item.createdAt)}
              </span>
            </div>
            {item.institution && (
              <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                {item.institution.name.split(",")[0]}
              </p>
            )}
          </div>
        </div>

        {/* Resource Type & Module Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-2xs">
            {item.resourceType.replace("_", " ")}
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="size-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Share or Copy Link"
          >
            <AnimatedIcon icon={AnimateShare} animation="pop" size={13} />
          </button>
        </div>
      </div>

      {/* ─── Subject Code & Module Header ─── */}
      <div className="space-y-1.5">
        <Link
          href={`/app/academics/${item.id}`}
          onClick={() => sounds.tap()}
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex-wrap"
        >
          <AnimatedIcon icon={AnimateBookOpen} animation="pop" size={14} className="shrink-0" />
          <span className="truncate">
            {item.subjectCode} • {item.subjectName}
          </span>
          {item.moduleOrChapter && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {item.moduleOrChapter}
            </span>
          )}
        </Link>

        <Link
          href={`/app/academics/${item.id}`}
          onClick={() => sounds.tap()}
          className="block group"
        >
          <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors leading-snug">
            {item.title}
          </h3>
        </Link>

        {item.description && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal">{item.description}</p>
        )}
      </div>

      {/* ─── Meta Badges (Branch, Semester, Reliability) ─── */}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-xl bg-muted/40 border border-border/40">
          <AnimatedIcon
            icon={AnimateGraduationCap}
            animation="pop"
            size={13}
            className="text-primary shrink-0"
          />
          <span>{item.branch}</span>
        </div>

        <div className="text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-xl bg-muted/30 border border-border/30">
          <span>Semester {item.semester}</span>
        </div>

        <div
          className={cn(
            "text-[10px] font-black px-2.5 py-1 rounded-xl border flex items-center gap-1",
            reliability >= 80
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
              : reliability >= 50
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                : "bg-rose-500/10 text-rose-500 border-rose-500/30"
          )}
          title={`${reliability}% verified positive student rating`}
        >
          <span>🎯 {reliability}% Reliable</span>
        </div>

        {item.fileUrl && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/25">
            Cloudflare R2 Direct File
          </span>
        )}
      </div>

      {/* ─── Live Analytics & Action Footer ─── */}
      <div className="flex items-center justify-between pt-3.5 border-t border-border/15 mt-3 text-xs flex-wrap gap-2">
        {/* Left: Upvote / Downvote & Comments Toggle */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center bg-muted/30 rounded-full border border-border/40 p-0.5">
            <button
              type="button"
              onClick={() => handleVote("UP")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                userVote === "UP"
                  ? "bg-indigo-500/20 text-indigo-400 font-black shadow-2xs"
                  : "hover:text-foreground hover:bg-muted"
              )}
              title="Upvote (Accurate & helpful)"
            >
              <ArrowUp className={cn("size-3.5", userVote === "UP" && "stroke-3")} />
              <span className="tabular-nums">{upvotes}</span>
            </button>

            <div className="h-3.5 w-px bg-border/40" />

            <button
              type="button"
              onClick={() => handleVote("DOWN")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                userVote === "DOWN"
                  ? "bg-rose-500/20 text-rose-400 font-black shadow-2xs"
                  : "hover:text-foreground hover:bg-muted"
              )}
              title="Downvote (Inaccurate or obsolete)"
            >
              <ArrowDown className={cn("size-3.5", userVote === "DOWN" && "stroke-3")} />
              {downvotes > 0 && <span className="tabular-nums">{downvotes}</span>}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <AnimatedIcon icon={AnimateMessageSquare} animation="pop" size={13} />
            <span className="text-[11px] font-semibold">
              {commentsList.length || item.commentsCount || 0}
            </span>
          </button>

          <span className="flex items-center gap-1 text-[11px] font-medium opacity-70" title="Total Views">
            <Eye className="size-3" />
            <span className="tabular-nums">{views}</span>
          </span>
        </div>

        {/* Right: Open / Download Action */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <AnimatedIcon icon={AnimateDownload} animation="nudge-up" size={13} />
          <span>Get Notes</span>
          <ExternalLink className="size-2.5 opacity-80" />
        </button>
      </div>

      {/* ─── Expandable Peer Reviews & Reliability Comments ─── */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-border/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-foreground">
              Peer Reliability Reviews &amp; Notes
            </span>
            <span className="text-[10px] text-muted-foreground">Community verified</span>
          </div>

          {/* Comment Composer */}
          <form
            onSubmit={handleSubmitComment}
            className="flex flex-col gap-2 bg-muted/20 p-2.5 rounded-2xl border border-border/30"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Is this syllabus-aligned?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsHelpful(true)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                    isHelpful
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "text-muted-foreground"
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
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "text-muted-foreground"
                  )}
                >
                  ⚠️ Errata / Outdated
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add formula correction, exam tip, or reliability feedback..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                <Send className="size-3" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
            {commentsList.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic py-1 text-center">
                No peer comments yet. Be the first to verify!
              </p>
            ) : (
              commentsList.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-muted/15 border border-border/20 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span>{c.author?.displayName || "Student"}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        @{c.author?.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
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
                      <span className="text-[10px] text-muted-foreground/70">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
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
