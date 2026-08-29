"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BookOpen,
  Car,
  Compass,
  Gamepad2,
  Home,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

export type HubTabType =
  | "all"
  | "discussions"
  | "lost_found"
  | "marketplace"
  | "gaming"
  | "rideshare"
  | "housing"
  | "academics";

interface CampusHubStripProps {
  activeTab?: HubTabType | "clubs";
  onSelectTab?: (tab: HubTabType) => void;
}

export const CAMPUS_HUBS = [
  {
    id: "lost_found" as HubTabType,
    title: "Lost & Found",
    tagline: "Keys, IDs, earphones & items",
    tag: "Campus Items",
    href: "/app/lost-and-found",
    icon: PackageSearch,
    gradient: "from-rose-500/15 via-rose-500/5 to-transparent",
    border: "border-rose-500/25 group-hover:border-rose-500/50",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    iconColor: "text-rose-500",
  },
  {
    id: "marketplace" as HubTabType,
    title: "Buy & Sell",
    tagline: "Cycles, coolers, books & dorm gear",
    tag: "Marketplace",
    href: "/app/marketplace",
    icon: ShoppingBag,
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/25 group-hover:border-emerald-500/50",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    iconColor: "text-emerald-500",
  },
  {
    id: "gaming" as HubTabType,
    title: "Gaming Arena",
    tagline: "Valorant, BGMI & Esports lobbies",
    tag: "Esports Hub",
    href: "/app/gaming",
    icon: Gamepad2,
    gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
    border: "border-purple-500/25 group-hover:border-purple-500/50",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    id: "rideshare" as HubTabType,
    title: "Ride Share",
    tagline: "Station & airport cab pooling",
    tag: "Cab Pool",
    href: "/app/rideshare",
    icon: Car,
    gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
    border: "border-sky-500/25 group-hover:border-sky-500/50",
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    iconColor: "text-sky-500",
  },
  {
    id: "housing" as HubTabType,
    title: "Housing & Flats",
    tagline: "PGs, rooms & student flatmates",
    tag: "Room Finder",
    href: "/app/housing",
    icon: Home,
    gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
    border: "border-amber-500/25 group-hover:border-amber-500/50",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    iconColor: "text-amber-500",
  },
  {
    id: "academics" as HubTabType,
    title: "Notes & PYQs",
    tagline: "Semester exam papers & notes",
    tag: "Academic Vault",
    href: "/app/academics",
    icon: BookOpen,
    gradient: "from-indigo-500/15 via-indigo-500/5 to-transparent",
    border: "border-indigo-500/25 group-hover:border-indigo-500/50",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    iconColor: "text-indigo-500",
  },
];

export function CampusHubStrip({ activeTab }: CampusHubStripProps) {
  function handleCardClick() {
    sounds.tap();
    haptics.light();
  }

  return (
    <section className="space-y-3 px-4 pt-4 pb-2 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Compass className="size-3.5" />
          </div>
          <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
            Campus Utility Hubs
          </h2>
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground">
          6 Dedicated Services
        </span>
      </div>

      {/* Spacious 2-Column Mobile / 3-Column Tablet Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {CAMPUS_HUBS.map((hub) => {
          const isActive = activeTab === hub.id;
          const Icon = hub.icon;

          return (
            <Link
              key={hub.id}
              href={hub.href}
              onClick={handleCardClick}
              className={cn(
                "group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
                isActive
                  ? "bg-card border-foreground/30 ring-1 ring-foreground/20"
                  : "bg-card/75 hover:bg-card border-border/50",
                hub.border
              )}
            >
              {/* Card Ambient Gradient */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-opacity duration-300 pointer-events-none",
                  hub.gradient,
                  isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                )}
              />

              {/* Top Row: Icon + Category Badge & Arrow */}
              <div className="relative z-10 flex items-start justify-between w-full mb-3">
                <div
                  className={cn(
                    "size-9 sm:size-10 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-105",
                    hub.badgeColor
                  )}
                >
                  <Icon className="size-4.5 sm:size-5" />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  <span className="hidden xs:inline text-[10px] uppercase tracking-wide font-black px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                    {hub.tag}
                  </span>
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              {/* Bottom Row: Full Uncut Title & Tagline */}
              <div className="relative z-10 space-y-1 min-w-0 w-full">
                <h3 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                  {hub.title}
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed line-clamp-2">
                  {hub.tagline}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
