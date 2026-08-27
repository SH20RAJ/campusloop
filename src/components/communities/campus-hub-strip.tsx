"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
BookOpen,
Car,
Compass,
Gamepad2,
Home,
PackageSearch,
ShoppingBag
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
  onOpenCreateModal?: (tab: HubTabType) => void;
}

export const CAMPUS_HUBS = [
  {
    id: "lost_found" as HubTabType,
    title: "Lost & Found",
    description: "Keys, IDs, earphones & items",
    href: "/app/lost-and-found",
    icon: PackageSearch,
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    border: "border-rose-500/30",
    badgeColor: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    iconColor: "text-rose-500",
  },
  {
    id: "marketplace" as HubTabType,
    title: "Buy & Sell",
    description: "Cycles, coolers, textbooks & notes",
    href: "/app/marketplace",
    icon: ShoppingBag,
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    border: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    iconColor: "text-emerald-500",
  },
  {
    id: "gaming" as HubTabType,
    title: "Gaming Arena",
    description: "Valorant, Chess & BGMI lobbies",
    href: "/app/gaming",
    icon: Gamepad2,
    gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
    border: "border-purple-500/30",
    badgeColor: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    iconColor: "text-purple-500",
  },
  {
    id: "rideshare" as HubTabType,
    title: "Ride Share",
    description: "Station & airport cab splits",
    href: "/app/rideshare",
    icon: Car,
    gradient: "from-sky-500/20 via-sky-500/10 to-transparent",
    border: "border-sky-500/30",
    badgeColor: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    iconColor: "text-sky-500",
  },
  {
    id: "housing" as HubTabType,
    title: "Housing & Flats",
    description: "PGs, flatmates & rooms",
    href: "/app/housing",
    icon: Home,
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    border: "border-amber-500/30",
    badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    iconColor: "text-amber-500",
  },
  {
    id: "academics" as HubTabType,
    title: "Notes & PYQs",
    description: "Semester papers & cheat sheets",
    href: "/app/academics",
    icon: BookOpen,
    gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
    border: "border-indigo-500/30",
    badgeColor: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
    iconColor: "text-indigo-500",
  },
];

export function CampusHubStrip({
  activeTab,
  onSelectTab,
  onOpenCreateModal,
}: CampusHubStripProps) {
  function handleCardClick() {
    sounds.tap();
    haptics.light();
  }

  return (
    <section className="space-y-2.5 px-4 pt-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Campus Utility Hubs
          </h2>
        </div>
        <span className="text-[11px] font-bold text-muted-foreground/70">
          Dedicated Services
        </span>
      </div>

      {/* Horizontal Scrollable Hub Cards linking to dedicated pages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {CAMPUS_HUBS.map((hub) => {
          const isActive = activeTab === hub.id;
          const Icon = hub.icon;

          return (
            <Link
              key={hub.id}
              href={hub.href}
              onClick={handleCardClick}
              className={cn(
                "flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group active:scale-98",
                isActive
                  ? "bg-card border-foreground/30 shadow-md ring-1 ring-foreground/20"
                  : "bg-card/60 hover:bg-card border-border/40 hover:border-border/80"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity",
                  hub.gradient,
                  isActive ? "opacity-100" : "group-hover:opacity-80"
                )}
              />

              <div className="relative z-10 flex items-center justify-between w-full mb-2">
                <div
                  className={cn(
                    "size-8 rounded-xl flex items-center justify-center border shadow-2xs",
                    hub.badgeColor
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <span className="text-[10px] text-muted-foreground/80 font-bold group-hover:text-foreground transition-colors">
                  Open →
                </span>
              </div>

              <div className="relative z-10 space-y-0.5 min-w-0 w-full">
                <p className="text-xs font-black text-foreground truncate">
                  {hub.title}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-1 leading-tight font-medium">
                  {hub.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
