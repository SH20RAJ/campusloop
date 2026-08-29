"use client";

import {
ArrowLeft,
Check,
Globe,
MapPin,
MessageSquarePlus,
School,
Share2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
    <header className="space-y-3 select-none">
      {/* ─── Top Navigation Bar ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/colleges"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/40 hover:bg-muted px-3.5 py-1.5 rounded-full"
        >
          <ArrowLeft className="size-3.5" /> All Colleges
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareCollege}
            className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer bg-muted/40 hover:bg-muted px-3.5 py-1.5 rounded-full shadow-2xs"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* ─── Clean College Header Card ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-card shadow-2xs">
        {/* Banner Area */}
        <div className="relative h-36 sm:h-48 w-full bg-muted/30 overflow-hidden">
          {college.bannerUrl ? (
            <img
              src={college.bannerUrl}
              alt={`${college.name} Banner`}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-primary/15 via-violet-500/10 to-indigo-500/15" />
          )}

          {/* Top-Right Badges */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {isEnrolledHere && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground backdrop-blur-md shadow-xs">
                Your Campus
              </span>
            )}
            {college.state && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-background/80 text-foreground backdrop-blur-md shadow-xs">
                {college.state}
              </span>
            )}
          </div>
        </div>

        {/* Hero Content Body */}
        <div className="px-5 pb-5 pt-0 relative space-y-3.5">
          {/* Logo & Actions Top Row */}
          <div className="flex items-end justify-between -mt-12 sm:-mt-14 gap-3">
            {/* College Logo / Crest */}
            <div className="size-20 sm:size-24 rounded-2xl bg-card border-4 border-card shadow-xl p-1.5 shrink-0 flex items-center justify-center overflow-hidden z-10">
              {college.logoUrl ? (
                <img
                  src={college.logoUrl}
                  alt={college.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <School className="size-8" />
                </div>
              )}
            </div>

            {/* CTAs Row */}
            <div className="flex items-center gap-2 shrink-0 pb-1">
              <button
                type="button"
                onClick={onAskSeniorClick}
                className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquarePlus className="size-3.5" />
                <span>Ask Seniors</span>
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
                  className="h-9 px-4 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="Official Website"
                >
                  <Globe className="size-3.5 text-muted-foreground" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>

          {/* College Identity & Metadata — rendered cleanly below banner and logo */}
          <div className="space-y-1 pt-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight">
              {college.name}
            </h1>
            <p className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-foreground/80">
                <MapPin className="size-3 text-primary shrink-0" />
                {college.district ? `${college.district}, ` : ""}
                {college.state || "India"}
              </span>
              {college.nirfRank && (
                <>
                  <span>•</span>
                  <span className="text-amber-500 font-bold">NIRF #{college.nirfRank}</span>
                </>
              )}
              {college.yearOfEstablishment && (
                <>
                  <span>•</span>
                  <span>Est. {college.yearOfEstablishment}</span>
                </>
              )}
            </p>
          </div>

          {/* Description if present */}
          {college.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {college.description}
            </p>
          )}

          {/* Horizontal Stats Row */}
          <div className="flex items-center gap-4 py-2 px-4 rounded-2xl bg-muted/30 text-xs font-semibold text-muted-foreground">
            <span className="text-foreground">
              <strong className="text-foreground font-black">{studentCount}</strong> Verified Students
            </span>
            <span>•</span>
            <span className="text-foreground">
              <strong className="text-foreground font-black">{postsCount}</strong> Discussions
            </span>
            <span>•</span>
            <span className="text-foreground">
              <strong className="text-foreground font-black">{collectivePoints.toLocaleString()}</strong> LP Clout
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
