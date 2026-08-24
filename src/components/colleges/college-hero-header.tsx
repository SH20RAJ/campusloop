"use client";

import { useState } from "react";
import {
  School,
  Globe,
  Calendar,
  ArrowLeft,
  Users,
  Trophy,
  Award,
  Share2,
  MessageSquarePlus,
  Flame,
  CheckCircle2,
  MapPin,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CollegeHeroHeaderProps {
  college: {
    id: string;
    slug: string;
    name: string;
    state?: string | null;
    district?: string | null;
    website?: string | null;
    yearOfEstablishment?: number | null;
    aisheCode?: string | null;
    locationType?: string | null;
  };
  studentCount: number;
  postsCount: number;
  collectivePoints: number;
  stateRank?: number;
  isEnrolledHere: boolean;
  onAskSeniorClick?: () => void;
}

export function CollegeHeroHeader({
  college,
  studentCount,
  postsCount,
  collectivePoints,
  stateRank = 1,
  isEnrolledHere,
  onAskSeniorClick,
}: CollegeHeroHeaderProps) {
  const [copied, setCopied] = useState(false);

  function handleShareCollege() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : `https://campusloop.space/college/${college.slug}`;
    const shareText = `🎓 Check out the official student hub of ${college.name} on CampusLoop:\n• State Rank: #${stateRank} in ${college.state || "India"}\n• Verified Students: ${studentCount}+\n• Loop Score: ${collectivePoints.toLocaleString()} LP 🔥\n\nExplore live confessions, leaderboards & campus reviews: ${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("College link & Campus Card copied! Share with batchmates 🚀");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const shortName = college.name.split(",")[0];

  return (
    <header className="space-y-4 select-none">
      {/* ─── Top Bar Navigation ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/colleges"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-card border border-border/70 px-3 py-1.5 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="size-3.5" /> All 1,350+ Campus Hubs
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareCollege}
            className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer bg-card border border-border/70 px-3 py-1.5 rounded-xl shadow-2xs"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
            <span>{copied ? "Copied!" : "Share Campus"}</span>
          </button>
        </div>
      </div>

      {/* ─── Airbnb-Style Visual Grand Hero Card ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        {/* Animated Visual Gradient Banner */}
        <div className="relative h-44 sm:h-56 w-full bg-gradient-to-br from-orange-500/20 via-primary/25 to-amber-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-25" />
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 size-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 size-64 rounded-full bg-amber-500/20 blur-3xl" />

          {/* Badges Overlay on Top-Right of Banner */}
          <div className="absolute top-3 right-3 flex flex-wrap items-center gap-2">
            {isEnrolledHere && (
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-primary text-primary-foreground backdrop-blur-md flex items-center gap-1 shadow-md">
                🎓 Your Campus
              </span>
            )}
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-md">
              <Trophy className="size-3.5 text-amber-400" /> #{stateRank} in {college.state || "State"}
            </span>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-md">
              <CheckCircle2 className="size-3.5" /> Verified Hub
            </span>
          </div>

          {/* Live Campus Pulse Floating Ticker at Banner Bottom */}
          <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-6">
            <div className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 px-3.5 py-1.5 text-white/90 text-[11px] font-semibold flex items-center justify-between gap-2 overflow-hidden shadow-lg">
              <div className="flex items-center gap-2 truncate">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="truncate">🔥 Live Pulse: {studentCount * 3 + 8} batchmates active this week • Placements & Fest chatter trending</span>
              </div>
              <span className="text-[10px] text-white/60 shrink-0 hidden sm:inline-block">Updated Live</span>
            </div>
          </div>
        </div>

        {/* ─── Hero Content Body ─── */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Main Info Row with Overlapping Emblem */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              {/* College Emblem Card */}
              <div className="size-20 sm:size-24 rounded-3xl bg-gradient-to-br from-primary to-orange-600 p-0.5 shadow-2xl shrink-0 border-4 border-card">
                <div className="size-full rounded-[22px] bg-card flex items-center justify-center text-primary font-black">
                  <School className="size-10 sm:size-12 text-primary" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {shortName}
                  </h1>
                </div>
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  <span>{college.district ? `${college.district}, ` : ""}{college.state || "India"}</span>
                  <span className="text-border">•</span>
                  <span>AISHE: {college.aisheCode}</span>
                </p>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                type="button"
                onClick={onAskSeniorClick}
                className="flex-1 sm:flex-none h-10 px-4 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-primary-foreground text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquarePlus className="size-4" />
                <span>Ask a Senior</span>
              </button>

              {college.website && (
                <a
                  href={college.website.startsWith("http") ? college.website : `https://${college.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="size-10 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/60 text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Visit Official College Website"
                >
                  <Globe className="size-4 text-muted-foreground" />
                </a>
              )}
            </div>
          </div>

          {/* ─── Metric Badges Row (LinkedIn / Glassdoor Style) ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Collective Score */}
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-amber-500/10 via-primary/5 to-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Award className="size-3.5" /> Collective Score
              </span>
              <p className="text-lg sm:text-xl font-black text-foreground">
                {collectivePoints.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">LP</span>
              </p>
            </div>

            {/* Verified Students */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Users className="size-3.5 text-emerald-500" /> Verified Students
              </span>
              <p className="text-lg sm:text-xl font-black text-foreground">
                {studentCount} <span className="text-xs font-semibold text-muted-foreground">Enrolled</span>
              </p>
            </div>

            {/* Campus Threads */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Flame className="size-3.5 text-rose-500" /> Active Threads
              </span>
              <p className="text-lg sm:text-xl font-black text-foreground">
                {postsCount} <span className="text-xs font-semibold text-muted-foreground">Discussions</span>
              </p>
            </div>

            {/* Foundation Year */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-blue-500" /> Legacy
              </span>
              <p className="text-lg sm:text-xl font-black text-foreground">
                {college.yearOfEstablishment ? `Est. ${college.yearOfEstablishment}` : "Accredited Hub"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
