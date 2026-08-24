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
    logoUrl?: string | null;
    bannerUrl?: string | null;
    nirfRank?: number | null;
    description?: string | null;
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
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://campusloop.space/college/${college.slug}`;
    const shareText = `🎓 Official Student Hub for ${college.name} on CampusLoop:\n• State Rank: #${stateRank} in ${
      college.state || "State"
    }\n• Verified Students: ${studentCount}+\n• Loop Score: ${collectivePoints.toLocaleString()} LP 🔥\n\nExplore confessions, leaderboards & discussions: ${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("College link & stats copied! Share with batchmates 🚀");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <header className="space-y-4 select-none">
      {/* ─── Top Bar Navigation & Actions ─── */}
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
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5 text-primary" />}
            <span>{copied ? "Copied!" : "Share Campus"}</span>
          </button>
        </div>
      </div>

      {/* ─── Grand Panoramic College Banner & Header Card ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        {/* Banner Area */}
        <div className="relative h-44 sm:h-52 w-full bg-muted/40 overflow-hidden">
          {college.bannerUrl ? (
            <img
              src={college.bannerUrl}
              alt={`${college.name} Campus Banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-500/20 via-primary/25 to-amber-500/20" />
          )}

          {/* Clean Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-black/30 to-black/40" />

          {/* Badges on Top-Right of Banner */}
          <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5">
            {isEnrolledHere && (
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-primary text-primary-foreground backdrop-blur-md flex items-center gap-1 shadow-md">
                🎓 Your Campus
              </span>
            )}
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-md">
              <Trophy className="size-3 text-amber-400" /> #{stateRank} in {college.state || "State"}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-md">
              <CheckCircle2 className="size-3" /> Verified Hub
            </span>
          </div>

          {/* Live Pulse Ticker (Subtle Pill in Top Left) */}
          <div className="absolute top-3 left-3 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white/90 backdrop-blur-md border border-white/10 text-[11px] font-semibold">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{studentCount * 3 + 12} batchmates active this week</span>
          </div>
        </div>

        {/* ─── Hero Content Body ─── */}
        <div className="px-5 pb-6 pt-3 space-y-4">
          {/* Identity Row with Avatar & Action CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
            <div className="flex items-end gap-3.5 min-w-0">
              {/* College Official Crest / Logo */}
              <div className="size-20 sm:size-24 rounded-2xl bg-card border-2 border-border shadow-2xl p-1.5 shrink-0 flex items-center justify-center overflow-hidden z-10">
                {college.logoUrl ? (
                  <img
                    src={college.logoUrl}
                    alt={college.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <School className="size-10" />
                  </div>
                )}
              </div>

              <div className="space-y-1 min-w-0 pb-0.5">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                  {college.name}
                </h1>
                <p className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-foreground/80">
                    <MapPin className="size-3 text-primary shrink-0" />
                    {college.district ? `${college.district}, ` : ""}
                    {college.state || "India"}
                  </span>
                  {college.aisheCode && (
                    <>
                      <span className="text-border">•</span>
                      <span>AISHE: {college.aisheCode}</span>
                    </>
                  )}
                  {college.nirfRank && (
                    <>
                      <span className="text-border">•</span>
                      <span className="text-amber-500 font-bold">NIRF #{college.nirfRank}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* CTAs Row */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={onAskSeniorClick}
                className="flex-1 sm:flex-none h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquarePlus className="size-3.5" />
                <span>Ask a Senior</span>
              </button>

              {college.website && (
                <a
                  href={
                    college.website.startsWith("http")
                      ? college.website
                      : `https://${college.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Official Website"
                >
                  <Globe className="size-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Description if present */}
          {college.description && (
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              {college.description}
            </p>
          )}

          {/* ─── Metric Badges Row ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <Award className="size-3" /> Collective Clout
              </span>
              <p className="text-base sm:text-lg font-black text-foreground">
                {collectivePoints.toLocaleString()}{" "}
                <span className="text-[10px] font-bold text-muted-foreground">LP</span>
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <Users className="size-3" /> Verified Students
              </span>
              <p className="text-base sm:text-lg font-black text-foreground">
                {studentCount}{" "}
                <span className="text-[10px] font-bold text-muted-foreground">Enrolled</span>
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                <Flame className="size-3" /> Active Threads
              </span>
              <p className="text-base sm:text-lg font-black text-foreground">
                {postsCount}{" "}
                <span className="text-[10px] font-bold text-muted-foreground">Discussions</span>
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 flex items-center gap-1">
                <Calendar className="size-3" /> Legacy
              </span>
              <p className="text-base sm:text-lg font-black text-foreground">
                {college.yearOfEstablishment ? `Est. ${college.yearOfEstablishment}` : "Accredited Hub"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
