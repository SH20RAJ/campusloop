"use client";

import Link from "next/link";
import { School, MapPin, ArrowUpRight } from "lucide-react";

export interface CollegeItem {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
  website: string | null;
  yearOfEstablishment: number | null;
  aisheCode: string;
}

export function CollegeHubCard({ college }: { college: CollegeItem }) {
  return (
    <Link
      href={`/app/college/${college.slug || college.id}`}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 font-bold text-xs">
            <School className="size-4" />
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary" />
          </span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {college.name}
          </h3>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
            {college.state || "India"} {college.district ? `• ${college.district}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
