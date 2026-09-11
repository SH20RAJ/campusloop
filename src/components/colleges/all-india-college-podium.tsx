"use client";

import { Crown, Medal, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import type { CollegeItem } from "./college-hub-row";

export interface LeaderboardCollegeItem extends CollegeItem {
  points: number;
  studentCount: number;
  postCount: number;
  rank: number;
}

interface AllIndiaCollegePodiumProps {
  leaderboard: LeaderboardCollegeItem[];
  loading?: boolean;
  compact?: boolean;
  className?: string;
}

export function AllIndiaCollegePodium({
  leaderboard,
  loading = false,
  compact = false,
  className = "",
}: AllIndiaCollegePodiumProps) {
  if (loading) {
    return (
      <div className={`mx-4 my-3 overflow-hidden rounded-3xl border border-amber-500/20 bg-linear-to-b from-amber-500/10 via-card to-card p-5 shadow-xs ${className}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-40 rounded-full bg-amber-500/20 animate-pulse" />
            <div className="h-3 w-56 rounded-full bg-muted/40 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-6 max-w-lg mx-auto">
          <div className="h-32 sm:h-36 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-44 sm:h-52 rounded-2xl bg-muted/60 animate-pulse" />
          <div className="h-28 sm:h-32 rounded-2xl bg-muted/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (leaderboard.length < 3) {
    return null;
  }

  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  return (
    <div className={`mx-4 my-3 overflow-hidden rounded-3xl border border-amber-500/25 bg-linear-to-b from-amber-500/10 via-card/90 to-card p-4 sm:p-5 shadow-xs transition-all ${className}`}>
      {/* Header banner */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500">
            <Crown className="size-4 shrink-0 text-amber-500" />
            <span>All-India Campus Podium</span>
          </div>
          <p className="text-[11px] sm:text-[12px] text-muted-foreground truncate">
            Top campuses ranked by active discourse, student invites & verified clout.
          </p>
        </div>
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
          <Zap className="size-3" /> Season 1 Live
        </span>
      </div>

      {/* 3-Pillar Podium */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-5 sm:pt-6 max-w-lg mx-auto">
        {/* Rank 2 - Silver */}
        {second && (
          <Link
            href={`/app/college/${second.slug || second.id}`}
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="relative mb-2">
              <div className="size-13 sm:size-16 rounded-full border-2 border-slate-300 shadow-md overflow-hidden bg-muted/20 flex items-center justify-center p-1 group-hover:border-primary transition-colors">
                {second.logoUrl ? (
                  <img
                    src={second.logoUrl}
                    alt={second.name}
                    referrerPolicy="no-referrer"
                    className="size-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-black text-slate-500">
                    {second.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black text-[10px] shadow-xs">
                2
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-foreground text-center truncate w-full group-hover:text-primary transition-colors">
              {second.name.split(",")[0]}
            </p>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300">
              {second.points.toLocaleString("en-IN")} LP
            </span>
            <div className={`w-full mt-2 rounded-t-xl bg-linear-to-t from-slate-500/20 to-slate-400/30 border-t border-x border-slate-300/40 flex flex-col items-center justify-center text-[10px] font-bold text-muted-foreground ${compact ? "h-14 sm:h-16" : "h-18 sm:h-20"}`}>
              <Medal className="size-3.5 sm:size-4 text-slate-400 mb-0.5" />
              <span>Silver</span>
            </div>
          </Link>
        )}

        {/* Rank 1 - Gold */}
        {first && (
          <Link
            href={`/app/college/${first.slug || first.id}`}
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5"
          >
            <Crown className="size-5 sm:size-6 text-amber-500 animate-bounce mb-1" />
            <div className="relative mb-2">
              <div className="size-16 sm:size-20 rounded-full border-3 border-amber-400 shadow-xl overflow-hidden bg-muted/20 flex items-center justify-center p-1.5 ring-4 ring-amber-400/20 group-hover:ring-amber-400/40 transition-all">
                {first.logoUrl ? (
                  <img
                    src={first.logoUrl}
                    alt={first.name}
                    referrerPolicy="no-referrer"
                    className="size-full object-contain"
                  />
                ) : (
                  <span className="text-sm font-black text-amber-500">
                    {first.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -top-1 -right-1 size-5 sm:size-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-[11px] sm:text-xs shadow-md">
                1
              </span>
            </div>
            <p className="text-xs sm:text-[13px] font-black text-foreground text-center truncate w-full group-hover:text-primary transition-colors">
              {first.name.split(",")[0]}
            </p>
            <span className="text-[11px] sm:text-xs font-black text-amber-500">
              {first.points.toLocaleString("en-IN")} LP
            </span>
            <div className={`w-full mt-2 rounded-t-xl bg-linear-to-t from-amber-500/25 to-amber-400/40 border-t border-x border-amber-400/50 flex flex-col items-center justify-center text-[11px] sm:text-xs font-black text-amber-600 dark:text-amber-300 ${compact ? "h-20 sm:h-24" : "h-24 sm:h-28"}`}>
              <Trophy className="size-4 sm:size-5 text-amber-500 mb-1" />
              <span>Champion</span>
            </div>
          </Link>
        )}

        {/* Rank 3 - Bronze */}
        {third && (
          <Link
            href={`/app/college/${third.slug || third.id}`}
            className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="relative mb-2">
              <div className="size-13 sm:size-16 rounded-full border-2 border-amber-700/60 shadow-md overflow-hidden bg-muted/20 flex items-center justify-center p-1 group-hover:border-primary transition-colors">
                {third.logoUrl ? (
                  <img
                    src={third.logoUrl}
                    alt={third.name}
                    referrerPolicy="no-referrer"
                    className="size-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-black text-amber-700">
                    {third.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                3
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-foreground text-center truncate w-full group-hover:text-primary transition-colors">
              {third.name.split(",")[0]}
            </p>
            <span className="text-[10px] sm:text-[11px] font-black text-amber-700 dark:text-amber-400">
              {third.points.toLocaleString("en-IN")} LP
            </span>
            <div className={`w-full mt-2 rounded-t-xl bg-linear-to-t from-amber-800/20 to-amber-700/30 border-t border-x border-amber-700/40 flex flex-col items-center justify-center text-[10px] font-bold text-muted-foreground ${compact ? "h-12 sm:h-14" : "h-14 sm:h-16"}`}>
              <Medal className="size-3.5 sm:size-4 text-amber-700 mb-0.5" />
              <span>Bronze</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
