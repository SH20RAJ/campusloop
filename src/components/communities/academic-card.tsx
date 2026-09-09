"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Presentation,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
  AnimateDownload,
  AnimatedIcon,
  AnimateMessageSquare,
  AnimateShare,
  AnimateShieldCheck,
} from "@/components/ui/animated-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { checkAndRecordDownload } from "@/lib/academic-download-limiter";
import {
  trackAcademicDownload,
  trackAcademicLimitReached,
  trackAcademicShare,
  trackAcademicVote,
} from "@/lib/analytics/ga4";
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
    recommendationReason?: string;
    personalizedScore?: number;
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
  variant?: "row" | "grid";
}

const RESOURCE_ACCENTS: Record<
  string,
  {
    label: string;
    gradient: string;
    pillBg: string;
    pillText: string;
    borderGlow: string;
    Icon: any;
  }
> = {
  PYQ: {
    label: "PYQ Exam Paper",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    pillBg: "bg-amber-500/15 border-amber-500/30",
    pillText: "text-amber-400",
    borderGlow: "group-hover:border-amber-500/40 group-hover:shadow-amber-500/10",
    Icon: GraduationCap,
  },
  NOTES: {
    label: "Lecture Notes",
    gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
    pillBg: "bg-indigo-500/15 border-indigo-500/30",
    pillText: "text-indigo-400",
    borderGlow: "group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/10",
    Icon: FileText,
  },
  CHEAT_SHEET: {
    label: "Cheat Sheet",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    pillBg: "bg-emerald-500/15 border-emerald-500/30",
    pillText: "text-emerald-400",
    borderGlow: "group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/10",
    Icon: Zap,
  },
  BOOK: {
    label: "Textbook",
    gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
    pillBg: "bg-purple-500/15 border-purple-500/30",
    pillText: "text-purple-400",
    borderGlow: "group-hover:border-purple-500/40 group-hover:shadow-purple-500/10",
    Icon: BookMarked,
  },
  MODULE: {
    label: "Unit Module",
    gradient: "from-sky-500/20 via-cyan-500/10 to-transparent",
    pillBg: "bg-sky-500/15 border-sky-500/30",
    pillText: "text-sky-400",
    borderGlow: "group-hover:border-sky-500/40 group-hover:shadow-sky-500/10",
    Icon: BookOpen,
  },
  LAB_MANUAL: {
    label: "Lab Manual",
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    pillBg: "bg-rose-500/15 border-rose-500/30",
    pillText: "text-rose-400",
    borderGlow: "group-hover:border-rose-500/40 group-hover:shadow-rose-500/10",
    Icon: FlaskConical,
  },
  PPT: {
    label: "Slides",
    gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    pillBg: "bg-yellow-500/15 border-yellow-500/30",
    pillText: "text-yellow-400",
    borderGlow: "group-hover:border-yellow-500/40 group-hover:shadow-yellow-500/10",
    Icon: Presentation,
  },
};

export function AcademicCard({ item, currentUserId, isHighlighted, variant = "row" }: AcademicCardProps) {
  const [upvotes, setUpvotes] = useState(item.upvotesCount || 0);
  const [downvotes, setDownvotes] = useState(item.downvotesCount || 0);
  const [downloads, setDownloads] = useState(item.downloadsCount || 0);
  const [views] = useState(item.viewsCount || 1);
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
    trackAcademicVote(item.id, type, item.subjectCode);

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
        toast.success("Upvoted! Notes marked as reliable & helpful");
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
    const downloadCheck = checkAndRecordDownload(Boolean(currentUserId));
    if (!downloadCheck.allowed) {
      sounds.pop();
      haptics.error();
      trackAcademicLimitReached();
      toast.info("You've used all 5 free guest downloads! Sign in to get unlimited notes & PYQ access", {
        action: {
          label: "Sign In",
          onClick: () => {
            window.location.href = `/handler/sign-in?returnTo=/app/academics/${item.id}`;
          },
        },
      });
      return;
    }

    sounds.tap();
    haptics.light();
    setDownloads((prev) => prev + 1);
    trackAcademicDownload(item, !currentUserId, downloadCheck.count);

    const rawUrl = (item.fileUrl || item.driveUrl || "").trim();
    const driveFolderMatch = rawUrl.match(
      /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\/|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/i
    );
    const isDriveFolder = Boolean(driveFolderMatch);
    const cleanDriveFolderUrl = driveFolderMatch
      ? `https://drive.google.com/drive/folders/${driveFolderMatch[1]}`
      : rawUrl;

    const targetUrl = isDriveFolder ? cleanDriveFolderUrl : item.fileUrl || item.driveUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      if (isDriveFolder) {
        toast.success("Opening Google Drive study collection! Zero login required");
        return;
      }
      if (!currentUserId) {
        if (downloadCheck.remaining > 0) {
          toast.success(`Downloaded! (${downloadCheck.remaining} free guest downloads remaining)`);
        } else {
          toast.info("Downloaded! That was your 5th free download. Sign in for unlimited access!");
        }
      }
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
    trackAcademicShare(item.id, item.subjectCode, "clipboard");

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
      toast.success("Resource link copied to clipboard!");
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
        toast.success("Review & comment posted!");
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

  if (variant === "grid") {
    const accent = RESOURCE_ACCENTS[item.resourceType] || {
      label: item.resourceType.replace("_", " "),
      gradient: "from-primary/20 via-primary/5 to-transparent",
      pillBg: "bg-primary/15 border-primary/30",
      pillText: "text-primary",
      borderGlow: "group-hover:border-primary/40 group-hover:shadow-primary/5",
      Icon: FileText,
    };
    const TypeIcon = accent.Icon;

    return (
      <article
        id={`academic-${item.id}`}
        className={cn(
          "rounded-3xl border border-border/40 bg-card/75 hover:bg-card flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 select-none group relative overflow-hidden backdrop-blur-md",
          accent.borderGlow,
          isHighlighted && "border-primary/50 ring-2 ring-primary/20 bg-primary/5"
        )}
      >
        {/* Top Visual Document Banner */}
        <div
          className={cn(
            "relative px-4 pt-3.5 pb-3 border-b border-border/20 bg-linear-to-r flex items-center justify-between gap-2",
            accent.gradient
          )}
        >
          {/* Subject Code Badge */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-xl bg-background/90 border border-border/40 text-foreground shadow-xs group-hover:border-primary/50 transition-colors shrink-0">
              {item.subjectCode}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground truncate hidden sm:inline">
              {item.subjectName}
            </span>
          </div>

          {/* Type Pill & Share Action */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs",
                accent.pillBg,
                accent.pillText
              )}
            >
              <TypeIcon className="size-3" />
              <span>{accent.label}</span>
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="size-6.5 rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              title="Share link"
            >
              <AnimatedIcon icon={AnimateShare} animation="pop" size={12} />
            </button>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Author / Uploader Info */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link href={`/@${item.uploader.username}?tab=academics`} className="shrink-0">
                  <Avatar className="size-7 rounded-full border border-border/50 hover:opacity-90 transition-opacity">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="text-[9px] font-bold">
                      {item.uploader.displayName[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 leading-tight">
                  <Link
                    href={`/@${item.uploader.username}?tab=academics`}
                    className="text-xs font-bold text-foreground hover:underline truncate block"
                  >
                    {item.uploader.displayName}
                  </Link>
                  <span className="text-[10px] text-muted-foreground truncate block">
                    @{item.uploader.username}
                  </span>
                </div>
              </div>

              {/* Verified Badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="size-3 shrink-0" />
                <span>{reliability}% Verified</span>
              </span>
            </div>

            {/* Title */}
            <Link
              href={`/app/academics/${item.id}`}
              onClick={() => sounds.tap()}
              className="block group/title pt-0.5"
            >
              <h3 className="text-sm sm:text-[15px] font-extrabold text-foreground group-hover/title:text-primary transition-colors leading-snug line-clamp-2">
                {item.title}
              </h3>
            </Link>

            {/* Description Snippet */}
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* Metadata Badges (Sem, Branch, Module) */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground flex-wrap pt-1">
            <span className="px-2 py-0.5 rounded-lg bg-muted/60 font-semibold border border-border/30">
              Sem {item.semester}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-muted/60 font-semibold border border-border/30 truncate max-w-[140px]">
              {item.branch}
            </span>
            {item.moduleOrChapter && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20 truncate max-w-[130px]">
                {item.moduleOrChapter}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions Row */}
        <div className="px-4 sm:px-5 py-3 border-t border-border/20 bg-muted/15 flex items-center justify-between text-xs text-muted-foreground">
          {/* Voting */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleVote("UP")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/50 hover:text-primary transition-colors cursor-pointer group/vote",
                userVote === "UP" && "text-primary font-bold bg-primary/10"
              )}
              title="Upvote"
            >
              <ArrowUp className={cn("size-3.5", userVote === "UP" && "stroke-3")} />
              <span className="text-[11px] font-semibold tabular-nums">{upvotes}</span>
            </button>
            <button
              type="button"
              onClick={() => handleVote("DOWN")}
              className={cn(
                "p-1 rounded-lg hover:bg-muted/50 hover:text-rose-400 transition-colors cursor-pointer",
                userVote === "DOWN" && "text-rose-400 bg-rose-500/10"
              )}
              title="Downvote errata"
            >
              <ArrowDown className="size-3" />
            </button>
          </div>

          {/* Views & Downloads */}
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1 opacity-75" title="Views">
              <Eye className="size-3" />
              <span>{views}</span>
            </span>
            <span className="flex items-center gap-1 opacity-75" title="Downloads">
              <AnimatedIcon icon={AnimateDownload} animation="nudge-up" size={11} />
              <span>{downloads}</span>
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleDownload}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95",
              (item.fileUrl || item.driveUrl || "").match(
                /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\/|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/i
              )
                ? "bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black shadow-amber-500/20"
                : "bg-linear-to-r from-primary to-indigo-600 hover:opacity-95 text-primary-foreground shadow-primary/20"
            )}
          >
            {(item.fileUrl || item.driveUrl || "").match(
              /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\/|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/i
            ) ? (
              <FolderOpen className="size-3.5 shrink-0" />
            ) : (
              <ExternalLink className="size-3 shrink-0" />
            )}
            <span>
              {(item.fileUrl || item.driveUrl || "").match(
                /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\/|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/i
              )
                ? "Open Folder"
                : "Preview PDF"}
            </span>
          </button>
        </div>
      </article>
    );
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
        <Link href={`/@${item.uploader.username}?tab=academics`} className="shrink-0 mt-0.5">
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
                href={`/@${item.uploader.username}?tab=academics`}
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
              <span className="text-xs text-muted-foreground truncate">@{item.uploader.username}</span>
              <span className="text-[11px] text-muted-foreground/60">·</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatTimeAgo(item.createdAt)}</span>
            </div>

            {/* Type & Share */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              {item.recommendationReason && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/25 shrink-0">
                  {item.recommendationReason}
                </span>
              )}
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
            <span className="ml-auto text-[10px] font-bold text-emerald-500 inline-flex items-center gap-1">
              <Target className="size-2.5 shrink-0" />
              <span>{reliability}% Verified</span>
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
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
                (item.fileUrl || item.driveUrl || "").match(
                  /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\/|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/i
                )
                  ? "bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {(item.fileUrl || item.driveUrl || "").match(
                /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\/|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/i
              ) ? (
                <FolderOpen className="size-3 shrink-0" />
              ) : null}
              <span>
                {(item.fileUrl || item.driveUrl || "").match(
                  /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?)?folders\/|embeddedfolderview\?id=)([a-zA-Z0-9_-]+)/i
                )
                  ? "Open Folder"
                  : "Get"}
              </span>
              <ExternalLink className="size-2.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Expandable Peer Reviews & Reliability Comments (Twitter Thread Style) ─── */}
      {showComments && (
        <div className="mt-2.5 ml-0 sm:ml-11 border-l-2 border-border/25 pl-3 sm:pl-4 space-y-3">
          {/* Comment Composer */}
          <form onSubmit={handleSubmitComment} className="flex flex-col gap-2 py-2 border-b border-border/20">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Is this material accurate?</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsHelpful(true)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1",
                    isHelpful
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  <CheckCircle2 className="size-2.5 shrink-0" />
                  <span>Accurate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpful(false)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1",
                    !isHelpful
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  <AlertTriangle className="size-2.5 shrink-0" />
                  <span>Errata</span>
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
                      {c.author?.username ? (
                        <Link href={`/@${c.author.username}?tab=academics`} className="hover:underline">
                          {c.author?.displayName || "Student"}
                        </Link>
                      ) : (
                        <span>{c.author?.displayName || "Student"}</span>
                      )}
                      {c.author?.username && (
                        <Link
                          href={`/@${c.author.username}?tab=academics`}
                          className="text-[10px] text-muted-foreground font-normal hover:underline"
                        >
                          @{c.author.username}
                        </Link>
                      )}
                      <span className="text-[10px] text-muted-foreground/60">·</span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black px-1.5 py-0.2 rounded-full inline-flex items-center gap-1",
                        c.isHelpful ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                      )}
                    >
                      {c.isHelpful ? (
                        <>
                          <CheckCircle2 className="size-2.5 shrink-0" />
                          <span>Helpful</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="size-2.5 shrink-0" />
                          <span>Notice</span>
                        </>
                      )}
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
