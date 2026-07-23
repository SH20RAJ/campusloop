"use client";

import Link from "next/link";
import { MapPin, ArrowUpRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { College } from "@/hooks/use-colleges";

interface FeaturedCampusCardProps {
  college: College;
  index: number;
}

const CAMPUS_COLORS = [
  "from-blue-500/10 to-cyan-500/5",
  "from-violet-500/10 to-purple-500/5",
  "from-emerald-500/10 to-teal-500/5",
  "from-amber-500/10 to-orange-500/5",
  "from-rose-500/10 to-pink-500/5",
  "from-indigo-500/10 to-blue-500/5",
];

const CAMPUS_GLOWS = [
  "hover:border-blue-500/30 hover:shadow-blue-500/5",
  "hover:border-purple-500/30 hover:shadow-purple-500/5",
  "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
  "hover:border-amber-500/30 hover:shadow-amber-500/5",
  "hover:border-rose-500/30 hover:shadow-rose-500/5",
  "hover:border-indigo-500/30 hover:shadow-indigo-500/5",
];

export function FeaturedCampusCard({ college, index }: FeaturedCampusCardProps) {
  return (
    <Link
      href={`/app/college/${college.slug || college.id}`}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br p-4 transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        CAMPUS_COLORS[index % CAMPUS_COLORS.length],
        CAMPUS_GLOWS[index % CAMPUS_GLOWS.length]
      )}
    >
      <div className="pointer-events-none absolute -right-3 -top-3 size-16 rounded-full bg-primary/[0.03] blur-xl" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
            {college.name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
            <MapPin className="size-2.5 shrink-0" />
            {college.state}
            {college.district ? `, ${college.district}` : ""}
          </p>
        </div>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:border-primary/30">
          <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </span>
      </div>

      {college.postCount !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold bg-background/50 rounded-lg px-2.5 py-1.5 w-fit border border-border/40">
          <Users className="size-3" />
          {college.postCount} {college.postCount === 1 ? "post" : "posts"} in the loop
        </div>
      )}
    </Link>
  );
}
