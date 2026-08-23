"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MessageCircle, School, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/utils";

export type Candidate = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  gender?: string | null;
  points?: number;
  compatibilityScore?: number;
  institution?: { name: string; slug?: string; state?: string | null } | null;
};

interface DatingCardStackProps {
  candidate: Candidate;
  onSwipe: (direction: "like" | "pass") => void;
}

export function DatingCardStack({ candidate, onSwipe }: DatingCardStackProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const avatarUrl = getAvatarUrl(candidate.avatarUrl, candidate.username);
  const avatarFallback = candidate.displayName[0]?.toUpperCase() || "S";
  const matchScore = candidate.compatibilityScore || 85;

  return (
    <div className="relative w-full max-w-sm aspect-[3/4] mx-auto select-none">
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 90) onSwipe("like");
          else if (info.offset.x < -90) onSwipe("pass");
        }}
        className="w-full h-full rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-6 shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing relative overflow-hidden backdrop-blur-xl"
      >
        {/* Top Badges: Compatibility Score & Verified Badge */}
        <div className="flex items-center justify-between relative z-10">
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-black text-rose-500 shadow-xs">
            <Sparkles className="size-3" /> {matchScore}% Vibe Match
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-500">
            <ShieldCheck className="size-3" /> Verified Student
          </span>
        </div>

        {/* Profile Info & Avatar */}
        <div className="flex flex-col items-center text-center space-y-3 relative z-10 my-auto">
          <div className="relative">
            <Avatar className="size-24 border-4 border-background shadow-xl">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            {candidate.points && candidate.points >= 200 && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 text-[9px] font-black text-black px-2 py-0.5 shadow-sm whitespace-nowrap">
                🔥 {candidate.points} LP
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black tracking-tight text-foreground flex items-center justify-center gap-1.5">
              <span>{candidate.displayName}</span>
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">@{candidate.username}</p>
          </div>

          {/* Institution Badge */}
          {candidate.institution?.name && (
            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full max-w-[260px] border border-primary/20 shadow-xs">
              <School className="size-3.5 shrink-0" />
              <span className="truncate">{candidate.institution.name.split(",")[0]}</span>
            </div>
          )}

          {/* Bio Callout */}
          <div className="w-full rounded-2xl border border-border/50 bg-muted/20 p-3.5 text-xs font-medium text-foreground/90 leading-relaxed italic line-clamp-3">
            "{candidate.bio || "Looking to connect with fellow campus minds!"}"
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 relative z-10 pt-2">
          <button
            type="button"
            onClick={() => onSwipe("pass")}
            className="size-14 rounded-full bg-card border-2 border-border hover:border-destructive text-muted-foreground hover:text-destructive flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Pass"
          >
            <X className="size-6" />
          </button>

          <Link
            href={`/@${candidate.username}`}
            className="size-11 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:scale-105"
            title="View Profile"
          >
            <MessageCircle className="size-4.5" />
          </Link>

          <button
            type="button"
            onClick={() => onSwipe("like")}
            className="size-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Like candidate"
          >
            <Heart className="size-6 fill-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
