"use client";

import { ArrowUpRight,CheckCircle2,MapPin,School,Trophy } from "lucide-react";
import Link from "next/link";

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

export function CollegeHubCard({ college }: { college: CollegeItem }) {
  return (
    <Link
      href={`/app/college/${college.slug || college.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
    >
      {/* Top Banner Area */}
      <div className="relative h-24 w-full bg-muted/40 overflow-hidden">
        {college.bannerUrl ? (
          <img
            src={college.bannerUrl}
            alt={college.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20" />
        )}

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-black/20 to-transparent" />

        {/* Badges on Top-Right of Card Banner */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {college.nirfRank ? (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-black/60 text-amber-400 backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-xs">
              <Trophy className="size-2.5" /> #{college.nirfRank}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/50 text-white/90 backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="size-2.5 text-emerald-400" /> Hub
            </span>
          )}

          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-black/50 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="size-3 text-primary" />
          </span>
        </div>
      </div>

      {/* Card Content Body with Overlapping Crest */}
      <div className="px-4 pb-4 pt-1 space-y-2.5">
        <div className="flex items-start gap-3 -mt-6">
          {/* Official Logo / Crest Avatar */}
          <div className="size-11 rounded-xl bg-card border-2 border-border shadow-md p-1 shrink-0 flex items-center justify-center overflow-hidden z-10 group-hover:border-primary transition-colors">
            {college.logoUrl ? (
              <img
                src={college.logoUrl}
                alt={college.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <School className="size-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 pt-6">
            <h3 className="text-xs sm:text-sm font-extrabold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {college.name}
            </h3>
          </div>
        </div>

        {/* Location & Details */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/40">
          <p className="flex items-center gap-1 truncate font-medium">
            <MapPin className="size-3 shrink-0 text-primary" />
            <span className="truncate">
              {college.district ? `${college.district}, ` : ""}
              {college.state || "India"}
            </span>
          </p>

          <span className="text-[10px] font-mono text-muted-foreground/80 shrink-0">
            {college.yearOfEstablishment ? `Est. ${college.yearOfEstablishment}` : college.aisheCode}
          </span>
        </div>
      </div>
    </Link>
  );
}
