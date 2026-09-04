"use client";

import { Calendar, CheckCircle2, Gift, MapPin, MessageCircle, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LostAndFoundItem } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

interface LostFoundCardProps {
  item: LostAndFoundItem & {
    author: {
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

export function LostFoundCard({ item, currentUserId }: LostFoundCardProps) {
  const [resolved, setResolved] = useState(item.isResolved);
  const isLost = item.type === "LOST";
  const isOwner = currentUserId === item.authorId;

  const avatar = getAvatarUrl(item.author.avatarUrl, item.author.username);

  function handleContact() {
    sounds.tap();
    haptics.light();
    if (item.contactInfo) {
      navigator.clipboard.writeText(item.contactInfo);
      toast.success(`Contact copied: ${item.contactInfo} 📋`);
    } else {
      toast.info(`Message @${item.author.username} on CampusLoop`);
    }
  }

  function handleToggleResolve() {
    sounds.ting();
    haptics.success();
    setResolved(!resolved);
    toast.success(resolved ? "Marked as active" : "Marked as resolved & returned! 🎉");
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    sounds.tap();
    haptics.light();

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";
    const shareUrl = `${baseUrl}/app/lost-and-found?id=${item.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: `[${item.type}] ${item.title} on CampusLoop`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Lost & Found link copied to clipboard! 📋");
    }
  }

  return (
    <div className="p-4 border-b border-border/20 hover:bg-muted/8 transition-colors select-none">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/@${item.author.username}`} className="shrink-0">
            <Avatar className="size-9 rounded-full border border-border/50">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-xs font-bold">
                {item.author.displayName[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <Link
                href={`/@${item.author.username}`}
                className="text-xs font-bold text-foreground hover:underline truncate"
              >
                {item.author.displayName}
              </Link>
              {(item.author.points || 0) >= 150 && (
                <ShieldCheck className="size-3.5 text-brand shrink-0" />
              )}
              <span className="text-[11px] text-muted-foreground truncate">@{item.author.username}</span>
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

        {/* Status Pill & Share Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs",
              resolved
                ? "bg-muted text-muted-foreground border-border/60"
                : isLost
                  ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
            )}
          >
            {resolved ? "Resolved" : isLost ? "Lost Item" : "Found Item"}
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

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-foreground leading-snug">{item.title}</h3>
        {item.description && (
          <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal">{item.description}</p>
        )}
      </div>

      {/* Meta Pills (Location, Date, Reward) */}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground/80 px-2.5 py-1 rounded-xl bg-muted/40 border border-border/40">
          <MapPin className="size-3 text-rose-500 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        {item.itemDate && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground px-2.5 py-1 rounded-xl bg-muted/30 border border-border/30">
            <Calendar className="size-3 text-primary shrink-0" />
            <span>{item.itemDate}</span>
          </div>
        )}

        {item.reward && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Gift className="size-3 shrink-0" />
            <span>Reward: {item.reward}</span>
          </div>
        )}
      </div>

      {/* Optional Photo */}
      {item.imageUrl && (
        <div className="mt-3 rounded-2xl overflow-hidden border border-border/40 max-h-60 bg-muted/20">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-border/15 mt-3">
        <button
          type="button"
          onClick={handleContact}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer active:scale-95"
        >
          <MessageCircle className="size-3.5" />
          <span>{isLost ? "I Found This!" : "Claim Item / Contact"}</span>
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={handleToggleResolve}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <CheckCircle2 className="size-3.5" />
            <span>{resolved ? "Reopen" : "Mark as Claimed"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
