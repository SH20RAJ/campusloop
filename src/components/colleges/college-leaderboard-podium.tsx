"use client";

import { useState, useMemo } from "react";
import {
  Crown,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCloutTier } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface StudentItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  points?: number | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  headline?: string | null;
}

interface CollegeLeaderboardPodiumProps {
  students: StudentItem[];
  collegeName: string;
}

export function CollegeLeaderboardPodium({
  students,
  collegeName,
}: CollegeLeaderboardPodiumProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState<number | "ALL">("ALL");

  // Sort students descending by points
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [students]);

  // Extract top 3 for the podium
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // Distinct branches
  const branches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.branch) set.add(s.branch.trim());
    });
    return Array.from(set);
  }, [students]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return sortedStudents.filter((student) => {
      const matchesQuery =
        !searchQuery.trim() ||
        student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.branch && student.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (student.headline && student.headline.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBranch =
        selectedBranch === "ALL" ||
        (student.branch && student.branch.toLowerCase() === selectedBranch.toLowerCase());

      const matchesYear =
        selectedYear === "ALL" || student.year === selectedYear;

      return matchesQuery && matchesBranch && matchesYear;
    });
  }, [sortedStudents, searchQuery, selectedBranch, selectedYear]);

  return (
    <div className="space-y-6 select-none animate-in fade-in">
      {/* ─── 3D Hall of Fame Clout Podium (Top 3 Students) ─── */}
      {students.length >= 3 && (
        <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/80 to-muted/30 p-6 shadow-sm space-y-6 overflow-hidden relative">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Crown className="size-4 text-amber-500" /> Campus Clout Champions
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Top student creators and community leaders on {collegeName.split(",")[0]}.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Season 1 Live
            </span>
          </div>

          {/* Podium Layout */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 max-w-md mx-auto">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <Link href={`/@${top2.username}`} className="group flex flex-col items-center cursor-pointer">
                <div className="relative mb-2">
                  <Avatar className="size-14 sm:size-16 border-2 border-slate-300 shadow-md group-hover:scale-105 transition-transform">
                    <AvatarImage src={top2.avatarUrl || ""} />
                    <AvatarFallback className="font-bold text-xs">{top2.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -top-2 -right-1 size-6 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black text-xs shadow-md">
                    2
                  </span>
                </div>
                <div className="text-center w-full min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{top2.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">@{top2.username}</p>
                </div>
                <div className="w-full mt-2 rounded-t-2xl bg-gradient-to-t from-slate-500/20 to-slate-400/30 border-t border-x border-slate-400/40 p-2 text-center h-20 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xs font-black text-foreground">{top2.points || 0}</span>
                  <span className="text-[9px] font-bold text-muted-foreground">LP</span>
                </div>
              </Link>
            )}

            {/* Rank 1 (Gold / Crown) */}
            {top1 && (
              <Link href={`/@${top1.username}`} className="group flex flex-col items-center cursor-pointer -mt-4">
                <div className="relative mb-2">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                    <Crown className="size-6 fill-amber-500" />
                  </div>
                  <Avatar className="size-18 sm:size-20 border-4 border-amber-400 shadow-xl group-hover:scale-105 transition-transform">
                    <AvatarImage src={top1.avatarUrl || ""} />
                    <AvatarFallback className="font-black text-sm bg-amber-500/10 text-amber-600">{top1.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 right-0 size-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shadow-lg">
                    1
                  </span>
                </div>
                <div className="text-center w-full min-w-0">
                  <p className="text-xs font-extrabold text-foreground truncate flex items-center justify-center gap-1">
                    <span>{top1.displayName}</span>
                    <span className="text-blue-500 text-[11px]" title="Verified">✓</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">@{top1.username}</p>
                </div>
                <div className="w-full mt-2 rounded-t-2xl bg-gradient-to-t from-amber-500/25 to-amber-400/40 border-t border-x border-amber-400/60 p-2.5 text-center h-28 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">{top1.points || 0}</span>
                  <span className="text-[10px] font-extrabold text-amber-700/80 dark:text-amber-300">CAMPUS ICON</span>
                </div>
              </Link>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <Link href={`/@${top3.username}`} className="group flex flex-col items-center cursor-pointer">
                <div className="relative mb-2">
                  <Avatar className="size-14 sm:size-16 border-2 border-amber-700 shadow-md group-hover:scale-105 transition-transform">
                    <AvatarImage src={top3.avatarUrl || ""} />
                    <AvatarFallback className="font-bold text-xs">{top3.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -top-2 -right-1 size-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-md">
                    3
                  </span>
                </div>
                <div className="text-center w-full min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{top3.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">@{top3.username}</p>
                </div>
                <div className="w-full mt-2 rounded-t-2xl bg-gradient-to-t from-amber-700/20 to-amber-600/30 border-t border-x border-amber-700/40 p-2 text-center h-16 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xs font-black text-foreground">{top3.points || 0}</span>
                  <span className="text-[9px] font-bold text-muted-foreground">LP</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ─── Search & Department Filtering Controls ─── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${students.length} verified students in ${collegeName.split(",")[0]}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-border/80 bg-card text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Branch & Year Filter Pills */}
        <div className="space-y-2">
          {branches.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedBranch("ALL")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  selectedBranch === "ALL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                )}
              >
                All Departments ({students.length})
              </button>
              {branches.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBranch(b)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    selectedBranch === b
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold uppercase text-muted-foreground pl-1">Batch:</span>
            {([ "ALL", 1, 2, 3, 4 ] as const).map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer",
                  selectedYear === yr
                    ? "bg-foreground text-background shadow-2xs"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                )}
              >
                {yr === "ALL" ? "All Years" : `Year ${yr}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Student Leaderboard Table / Cards ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Showing {filteredStudents.length} Students
          </span>
          <span className="text-[11px] font-bold text-muted-foreground">
            Ranked by Loop Points (LP)
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {filteredStudents.map((student, index) => {
            const tier = getCloutTier(student.points || 0);
            return (
              <Link key={student.id} href={`/@${student.username}`}>
                <div className="group rounded-2xl border border-border/80 bg-card p-3.5 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-muted-foreground/60 w-5 text-center shrink-0">
                      #{index + 1}
                    </span>

                    <Avatar className="size-10 border border-border group-hover:scale-105 transition-transform shrink-0">
                      <AvatarImage src={student.avatarUrl || ""} />
                      <AvatarFallback className="font-bold text-xs">{student.displayName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-extrabold text-foreground truncate flex items-center gap-1">
                        <span>{student.displayName}</span>
                        {(student.points || 0) >= 150 && (
                          <span className="text-blue-500 text-[10px]" title="Verified Student">✓</span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        @{student.username} {student.branch ? `• ${student.branch}` : ""} {student.year ? `(Yr ${student.year})` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-primary">
                      {student.points || 0} LP
                    </span>
                    <p className="text-[9px] font-bold text-muted-foreground">{tier.tierName.split(" ")[0]}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-2xl bg-card text-muted-foreground text-xs space-y-2">
              <Users className="size-6 mx-auto text-muted-foreground/50" />
              <p className="font-bold">No students match &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBranch("ALL");
                }}
                className="text-primary hover:underline font-bold text-xs"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
