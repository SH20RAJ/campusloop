"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MessageCircle, School, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/utils";

export type Candidate = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  institution?: { name: string } | null;
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

  return (
    <div className="relative w-full max-w-sm aspect-[3/4] mx-auto select-none">
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100) onSwipe("like");
          else if (info.offset.x < -100) onSwipe("pass");
        }}
        className="w-full h-full rounded-3xl border border-border/80 bg-gradient-to-b from-card to-background p-6 shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing relative overflow-hidden"
      >
        {/* Card Header Profile Info */}
        <div className="flex items-center gap-3 relative z-10">
          <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5 truncate">
              {candidate.displayName}
              <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
            </h3>
            <p className="text-xs text-muted-foreground truncate">@{candidate.username}</p>
          </div>
        </div>

        {/* Institution Badge & Bio */}
        <div className="space-y-3 relative z-10 my-auto">
          {candidate.institution?.name && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-full w-fit border border-primary/20">
              <School className="h-3.5 w-3.5" />
              <span className="truncate">{candidate.institution.name}</span>
            </div>
          )}

          <p className="text-sm leading-relaxed text-foreground/90 font-medium italic bg-muted/20 p-4 rounded-2xl border border-border/40">
            "{candidate.bio || "Looking to connect with fellow campus minds!"}"
          </p>
        </div>

        {/* Swipe Control Buttons */}
        <div className="flex items-center justify-center gap-6 relative z-10 pt-2">
          <button
            onClick={() => onSwipe("pass")}
            className="h-14 w-14 rounded-full bg-card border-2 border-muted hover:border-destructive text-muted-foreground hover:text-destructive flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Pass"
          >
            <X className="h-6 w-6" />
          </button>

          <Link
            href={`/@${candidate.username}`}
            className="h-10 w-10 rounded-full bg-muted/40 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="View Profile"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>

          <button
            onClick={() => onSwipe("like")}
            className="h-14 w-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 transition-all cursor-pointer hover:scale-110 active:scale-95"
            aria-label="Like candidate"
          >
            <Heart className="h-6 w-6 fill-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
