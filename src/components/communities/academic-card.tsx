"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { AcademicResource } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import {
ArrowUp,
BookOpen,
CheckCircle,
Download,
ExternalLink,
Eye,
GraduationCap,
Share2,
ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface AcademicCardProps {
  item: AcademicResource & {
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

export function AcademicCard({ item, isHighlighted }: AcademicCardProps) {
  const [upvotes, setUpvotes] = useState(item.upvotesCount);
  const [downloads, setDownloads] = useState(item.downloadsCount);
  const [views, setViews] = useState(item.viewsCount || 1);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const avatar = getAvatarUrl(item.uploader.avatarUrl, item.uploader.username);

  async function handleUpvote() {
    sounds.pop();
    haptics.medium();

    if (hasUpvoted) {
      setUpvotes((prev) => Math.max(0, prev - 1));
      setHasUpvoted(false);
    } else {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
      toast.success("Upvoted! Verified notes help your campus batch 📚");

      try {
        await fetch(`/api/academics/${item.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "UPVOTE" }),
        });
      } catch {}
    }
  }

  async function handleDownload() {
    sounds.tap();
    haptics.light();
    setDownloads((prev) => prev + 1);

    const targetUrl = item.driveUrl || item.fileUrl;
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
    const shareUrl = `${baseUrl}/app/academics?id=${item.id}`;

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

  return (
    <article
      id={`academic-${item.id}`}
      className={cn(
        "p-4 border-b border-border/25 hover:bg-muted/[0.04] transition-all select-none",
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
                <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
              )}
              <span className="text-[11px] text-muted-foreground truncate">
                @{item.uploader.username}
              </span>
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

        {/* Resource Type Pill & Share Action */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-2xs">
            {item.resourceType.replace("_", " ")}
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="size-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Share or Copy Link"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Subject Code & Title ─── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <BookOpen className="size-3.5 shrink-0" />
          <span className="truncate">
            {item.subjectCode} • {item.subjectName}
          </span>
        </div>

        <h3 className="text-sm font-bold text-foreground leading-snug">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal">
            {item.description}
          </p>
        )}
      </div>

      {/* ─── Meta Badges (Branch, Semester, Verification) ─── */}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-xl bg-muted/40 border border-border/40">
          <GraduationCap className="size-3 text-primary shrink-0" />
          <span>{item.branch}</span>
        </div>

        <div className="text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-xl bg-muted/30 border border-border/30">
          <span>Semester {item.semester}</span>
        </div>

        {item.isVerified && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 px-2 py-0.5 rounded-md bg-emerald-500/10">
            <CheckCircle className="size-3" />
            <span>Verified Resource</span>
          </div>
        )}
      </div>

      {/* ─── Live Analytics & Action Footer ─── */}
      <div className="flex items-center justify-between pt-3.5 border-t border-border/15 mt-3 text-xs">
        {/* Left: Engagement & Views Analytics */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <button
            type="button"
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
              hasUpvoted
                ? "bg-indigo-500/15 text-indigo-400 font-black"
                : "hover:text-foreground hover:bg-muted"
            )}
          >
            <ArrowUp className={cn("size-3.5", hasUpvoted && "stroke-[3]")} />
            <span className="tabular-nums">{upvotes}</span>
          </button>

          <span className="flex items-center gap-1 text-[11px] font-medium" title="Total Views">
            <Eye className="size-3.5 opacity-70" />
            <span className="tabular-nums">{views}</span>
          </span>

          <span className="flex items-center gap-1 text-[11px] font-medium" title="Downloads & Clicks">
            <Download className="size-3.5 opacity-70" />
            <span className="tabular-nums">{downloads}</span>
          </span>
        </div>

        {/* Right: Open / Download Action */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Download className="size-3.5" />
          <span>Get Notes</span>
          <ExternalLink className="size-2.5 opacity-80" />
        </button>
      </div>
    </article>
  );
}
