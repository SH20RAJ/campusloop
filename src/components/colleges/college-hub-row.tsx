"use client";

import { MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CollegeItem {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
  website: string | null;
  yearOfEstablishment: number | null;
  aisheCode: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  nirfRank?: number | null;
  description?: string | null;
  postCount?: number;
}

/**
 * Edge-to-edge directory row, matching the list pattern used by the feed, the
 * branch directory and the follow lists — one column, hairline separators, no
 * card chrome.
 */
export function CollegeHubRow({
  college,
  rank,
  trailing,
}: {
  college: CollegeItem;
  /** Optional standings position, shown in place of nothing on the leaderboard. */
  rank?: number;
  trailing?: React.ReactNode;
}) {
  const [imgError, setImgError] = useState(false);
  const location = [college.district, college.state].filter(Boolean).join(", ") || "India";

  // Compute initials for fallback
  const initials =
    college.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "CL";

  return (
    <Link
      href={`/app/college/${college.slug || college.id}`}
      className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-muted/25"
    >
      {typeof rank === "number" && (
        <span
          className={cn(
            "w-6 shrink-0 text-center text-sm font-black tabular-nums",
            rank <= 3 ? "text-primary" : "text-muted-foreground"
          )}
        >
          {rank}
        </span>
      )}

      {/* Crest */}
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-muted/20 p-1 shadow-2xs">
        {college.logoUrl && !imgError ? (
          <img
            src={college.logoUrl}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-full bg-linear-to-br from-primary/20 via-violet-500/15 to-primary/10">
            <span className="text-xs font-black text-primary tracking-tight">{initials}</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[15px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {college.name}
          </h3>
          {college.nirfRank ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-black text-amber-500">
              <Trophy className="size-2.5" />
              {college.nirfRank}
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{location}</span>
          {college.yearOfEstablishment ? (
            <>
              <span aria-hidden>·</span>
              <span className="shrink-0">Est. {college.yearOfEstablishment}</span>
            </>
          ) : null}
        </p>
      </div>

      {trailing && <div className="shrink-0 pl-2 text-right">{trailing}</div>}
    </Link>
  );
}
