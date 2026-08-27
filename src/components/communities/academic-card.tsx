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
GraduationCap,
ShieldCheck,
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
}

export function AcademicCard({ item }: AcademicCardProps) {
  const [upvotes, setUpvotes] = useState(item.upvotesCount);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const avatar = getAvatarUrl(item.uploader.avatarUrl, item.uploader.username);

  function handleUpvote() {
    sounds.pop();
    haptics.medium();
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
      toast.success("Upvoted! Verified notes help your campus batch 📚");
    }
  }

  function handleDownload() {
    sounds.tap();
    haptics.light();
    const targetUrl = item.driveUrl || item.fileUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    } else {
      toast.info("Notes are compiling for preview...");
    }
  }

  return (
    <div className="p-4 border-b border-border/20 hover:bg-muted/[0.08] transition-colors select-none">
      {/* Header */}
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

        {/* Resource Type Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 shadow-2xs">
            {item.resourceType.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Title & Subject Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <BookOpen className="size-3.5" />
          <span>{item.subjectCode} • {item.subjectName}</span>
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

      {/* Meta Pills (Branch, Semester, Verified) */}
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
            <span>Verified Notes</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-border/15 mt-3">
        <button
          type="button"
          onClick={handleUpvote}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
            hasUpvoted
              ? "bg-indigo-500/15 text-indigo-500"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <ArrowUp className={cn("size-3.5", hasUpvoted && "stroke-[3]")} />
          <span className="tabular-nums font-black">{upvotes} Upvotes</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-indigo-500 text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Download className="size-3.5" />
          <span>Open Notes / Drive</span>
          <ExternalLink className="size-2.5 opacity-80" />
        </button>
      </div>
    </div>
  );
}
