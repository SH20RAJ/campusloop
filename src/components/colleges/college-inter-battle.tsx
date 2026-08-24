"use client";

import { useState } from "react";
import {
  Trophy,
  Swords,
  Flame,
  Share2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CompetitorCollege {
  id: string;
  name: string;
  slug: string;
  district?: string | null;
  state?: string | null;
  points: number;
  studentsCount: number;
}

interface CollegeInterBattleProps {
  currentCollege: {
    id: string;
    slug: string;
    name: string;
    state?: string | null;
    points: number;
  };
  relatedColleges: CompetitorCollege[];
}

export function CollegeInterBattle({
  currentCollege,
  relatedColleges,
}: CollegeInterBattleProps) {
  const [copied, setCopied] = useState(false);

  // Combine and sort all colleges in state by points
  const allColleges = [
    {
      id: currentCollege.id,
      name: currentCollege.name,
      slug: currentCollege.slug,
      points: currentCollege.points,
      isCurrent: true,
      studentsCount: 18,
    },
    ...relatedColleges.map((c) => ({
      ...c,
      isCurrent: false,
    })),
  ].sort((a, b) => b.points - a.points);

  const currentRank = allColleges.findIndex((c) => c.id === currentCollege.id) + 1;
  const topCollege = allColleges[0];
  const pointsToLeader = topCollege.points - currentCollege.points;

  function handleRallyBatch() {
    const shareText = `⚔️ CAMPUS WARS: ${currentCollege.name.split(",")[0]} is currently #${currentRank} in ${currentCollege.state || "the State"} on CampusLoop with ${currentCollege.points.toLocaleString()} LP!\n\nJoin and boost our campus rank: https://campusloop.space/college/${currentCollege.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Rally message copied! Share in your college WhatsApp group 🔥");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="space-y-6 select-none animate-in fade-in">
      {/* ─── Grand Battle Banner ─── */}
      <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-amber-500/10 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 w-fit">
              <Swords className="size-3.5" /> Regional College Battle
            </span>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              {currentCollege.state || "State"} Inter-College Leaderboard
            </h2>
            <p className="text-xs text-muted-foreground">
              Colleges compete weekly based on verified student engagement, discussion threads, and invite velocity.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRallyBatch}
            className="px-4 py-2.5 rounded-2xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-500/20 shrink-0"
          >
            {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
            <span>{copied ? "Rally Link Copied!" : "Rally Your Batch"}</span>
          </button>
        </div>

        {/* Momentum Status Bar */}
        {currentRank === 1 ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-3">
            <Trophy className="size-6 text-amber-500 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                👑 Currently #1 in {currentCollege.state || "State"}!
              </p>
              <p className="text-[11px] text-muted-foreground">
                Your campus leads the state in student discourse. Keep posting to maintain the crown!
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">
                🔥 {pointsToLeader.toLocaleString()} LP needed to capture #1 Rank
              </p>
              <p className="text-[11px] text-muted-foreground">
                Every verified student invite gives +20 LP to {currentCollege.name.split(",")[0]}.
              </p>
            </div>
            <span className="text-xs font-black text-primary px-3 py-1 rounded-xl bg-primary/10 border border-primary/20">
              Rank #{currentRank}
            </span>
          </div>
        )}
      </div>

      {/* ─── State Colleges Leaderboard Table ─── */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Flame className="size-3.5 text-orange-500" /> Live State Rankings
        </h3>

        <div className="space-y-2">
          {allColleges.map((college, idx) => (
            <Link
              key={college.id}
              href={`/college/${college.slug || college.id}`}
              className="block"
            >
              <div
                className={cn(
                  "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer",
                  college.isCurrent
                    ? "border-primary/60 bg-primary/5 shadow-xs"
                    : "border-border/60 bg-muted/20 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "size-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs",
                      idx === 0
                        ? "bg-amber-400 text-amber-950 font-black"
                        : idx === 1
                        ? "bg-slate-300 text-slate-900"
                        : idx === 2
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    #{idx + 1}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-extrabold text-foreground truncate flex items-center gap-1.5">
                      <span>{college.name}</span>
                      {college.isCurrent && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {college.studentsCount || 0} active students
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-foreground">
                    {college.points.toLocaleString()} <span className="text-[10px] font-bold text-muted-foreground">LP</span>
                  </span>
                  <p className="text-[9px] font-bold text-emerald-500">+150 this week</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
