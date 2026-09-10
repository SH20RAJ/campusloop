"use client";

import {
  Calendar,
  Code2,
  Compass,
  Flame,
  Globe,
  GraduationCap,
  Grid3X3,
  LayoutList,
  MapPin,
  PartyPopper,
  Plus,
  Radio,
  School,
  Search,
  Sparkles,
  Trophy,
  Users,
  Users2,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { EventCard, type EventItem } from "@/components/events/event-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const EVENT_TABS = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "upcoming", label: "Upcoming", icon: Calendar },
  { id: "latest", label: "Latest", icon: Sparkles },
] as const;

const CATEGORIES = [
  { id: "ALL", label: "All Events", icon: Calendar },
  { id: "hackathons", label: "Hackathons", icon: Code2 },
  { id: "fests", label: "Fests", icon: PartyPopper },
  { id: "competitions", label: "Competitions", icon: Trophy },
  { id: "workshops", label: "Workshops", icon: GraduationCap },
  { id: "meetups", label: "Meetups", icon: Users2 },
];

const MODES = [
  { id: "ALL", label: "All Modes", icon: null },
  { id: "IN_PERSON", label: "In-Person", icon: MapPin },
  { id: "ONLINE", label: "Online", icon: Globe },
  { id: "HYBRID", label: "Hybrid", icon: Zap },
];

export function EventsClient() {
  const [activeTab, setActiveTab] = useState<"trending" | "upcoming" | "latest">("trending");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [scope, setScope] = useState<"ALL" | "MY_CAMPUS">("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("campusloop_events_view_mode");
      if (saved === "grid" || saved === "list") {
        setViewMode(saved);
      }
    }
  }, []);

  function handleViewModeChange(mode: "grid" | "list") {
    sounds.tap();
    haptics.light();
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("campusloop_events_view_mode", mode);
    }
  }

  const endpoint = `/api/events?category=${activeCategory}&scope=${scope}&sort=${activeTab}&q=${encodeURIComponent(
    searchQuery
  )}`;
  const { data, isLoading, mutate } = useSWR<{ events: EventItem[] }>(endpoint, fetcher, {
    dedupingInterval: 15000,
    revalidateOnFocus: true,
  });

  const rawEvents = data?.events || [];
  const events =
    modeFilter === "ALL" ? rawEvents : rawEvents.filter((e) => e.mode?.toUpperCase() === modeFilter);

  // Stats calculation
  const totalRegistered = rawEvents.reduce((acc, curr) => acc + (curr.attendeeCount || 0), 0);
  const hackathonsCount = rawEvents.filter((e) => e.eventType === "HACKATHON").length;

  return (
    <PullToRefresh onRefresh={() => mutate()}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col bg-background pb-28 px-3 sm:px-6">
        {/* ─── Top Sticky Omnibar & Filter Strip ─── */}
        <header className="sticky top-0 z-40 -mx-3 sm:-mx-6 px-3 sm:px-6 border-b border-border/30 bg-background/90 backdrop-blur-xl transition-all">
          {/* Row 1: Title, Scope Switcher, View Switcher & Host Button */}
          <div className="flex h-13 sm:h-14 items-center justify-between gap-2.5">
            {/* Title & Count */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Calendar className="size-4 sm:size-4.5" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-foreground truncate">
                  <span className="sm:hidden">Events</span>
                  <span className="hidden sm:inline">Events &amp; Hackathons</span>
                </h1>
                {rawEvents.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {rawEvents.length}
                  </span>
                )}
              </div>
            </div>

            {/* Scope Pill (All India vs My Campus), View Toggle, and Host CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Scope Switcher */}
              <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setScope("ALL");
                  }}
                  className={cn(
                    "px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    scope === "ALL"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="View events across all colleges in India"
                >
                  <Globe className="size-2.5 sm:size-3" />
                  <span>All India</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setScope("MY_CAMPUS");
                  }}
                  className={cn(
                    "px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    scope === "MY_CAMPUS"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="View events exclusive to your college campus"
                >
                  <School className="size-2.5 sm:size-3" />
                  <span>Campus</span>
                </button>
              </div>

              {/* View Switcher (Desktop/Tablet) */}
              <div className="hidden sm:flex items-center rounded-full bg-muted/50 p-0.5 border border-border/40">
                <button
                  type="button"
                  onClick={() => handleViewModeChange("grid")}
                  className={cn(
                    "p-1.5 rounded-full transition-all cursor-pointer",
                    viewMode === "grid"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <Grid3X3 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange("list")}
                  className={cn(
                    "p-1.5 rounded-full transition-all cursor-pointer",
                    viewMode === "list"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="List View"
                  aria-label="List View"
                >
                  <LayoutList className="size-3.5" />
                </button>
              </div>

              {/* Host CTA */}
              <Link
                href="/app/events/new"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="flex h-8 sm:h-8.5 shrink-0 cursor-pointer items-center gap-1 sm:gap-1.5 rounded-full bg-primary px-3 sm:px-3.5 text-xs font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-sm"
              >
                <Plus className="size-3.5 stroke-3" />
                <span className="sm:hidden">Host</span>
                <span className="hidden sm:inline">Host Event</span>
                <span className="hidden md:inline text-[9px] px-1.5 py-0.2 rounded-full bg-primary-foreground/20 font-mono">
                  +25 LP
                </span>
              </Link>
            </div>
          </div>

          {/* Row 2: Search Input & Fast Horizontal Filter Strip */}
          <div className="py-2 space-y-2 border-t border-border/20">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hackathons, cultural fests, workshops or clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 sm:h-9 w-full rounded-full border border-border/40 bg-muted/40 pl-8.5 pr-8 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Single Unified Filter Strip: Sort Tabs | Categories | Modes */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
              {/* Sort Tabs */}
              {EVENT_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setActiveTab(tab.id);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 border",
                      isActive
                        ? "bg-foreground text-background border-foreground font-black shadow-xs"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
                    )}
                  >
                    <Icon className="size-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-border/40 shrink-0 mx-0.5" />

              {/* Categories */}
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setActiveCategory(cat.id);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs font-black"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border-border/40"
                    )}
                  >
                    <Icon className="size-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-border/40 shrink-0 mx-0.5" />

              {/* Modes */}
              {MODES.filter((m) => m.id !== "ALL").map((mode) => {
                const isActive = modeFilter === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setModeFilter(modeFilter === mode.id ? "ALL" : mode.id);
                    }}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border flex items-center gap-1",
                      isActive
                        ? "bg-primary/20 text-primary border-primary/40 font-black shadow-xs"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
                    )}
                  >
                    {Icon && <Icon className="size-3" />}
                    <span>{mode.label}</span>
                  </button>
                );
              })}

              <div className="h-4 w-px bg-border/40 shrink-0 mx-0.5 sm:hidden" />

              {/* Mobile Quick View Mode Switcher */}
              <div className="flex sm:hidden items-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleViewModeChange(viewMode === "grid" ? "list" : "grid")}
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border bg-muted/40 text-muted-foreground hover:text-foreground border-border/40 flex items-center gap-1"
                >
                  {viewMode === "grid" ? <LayoutList className="size-3" /> : <Grid3X3 className="size-3" />}
                  <span>{viewMode === "grid" ? "List" : "Grid"}</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Highlights & Stats Ribbon (Desktop only to keep mobile 100% clean) ─── */}
        {!isLoading && rawEvents.length > 0 && !searchQuery && (
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 py-4">
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xs">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
                <Compass className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-black text-foreground">{rawEvents.length}</p>
                <p className="text-[11px] text-muted-foreground truncate font-medium">Active Events</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xs">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 shrink-0 border border-purple-500/20">
                <Radio className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-black text-foreground">{hackathonsCount}</p>
                <p className="text-[11px] text-muted-foreground truncate font-medium">Live Hackathons</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xs">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shrink-0 border border-amber-500/20">
                <Users className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-black text-foreground">{totalRegistered}+</p>
                <p className="text-[11px] text-muted-foreground truncate font-medium">Students Enrolled</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-xs">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                <Zap className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-black text-foreground">+25 LP</p>
                <p className="text-[11px] text-muted-foreground truncate font-medium">Per Registration</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Featured Spotlight Banner (Devpost / Unstop Style) ─── */}
        {!isLoading && events.length > 0 && !searchQuery && activeCategory === "ALL" && (
          <div className="pb-3 sm:pb-4">
            {(() => {
              const featured = events.find((e) => e.prizesDescription) || events[0];
              return (
                <Link
                  href={`/app/events/${featured.slug || featured.id}`}
                  className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/30 bg-linear-to-br from-primary/15 via-card to-card p-3.5 sm:p-6 shadow-sm transition-all hover:border-primary/60 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-primary-foreground shadow-xs">
                        <Sparkles className="size-3" />
                        Featured Spotlight
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted/60 text-muted-foreground border border-border/40 truncate max-w-[150px]">
                        {featured.clubName}
                      </span>
                    </div>

                    {featured.prizesDescription && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[11px] sm:text-xs font-black">
                        <Trophy className="size-3 sm:size-3.5" />
                        <span className="truncate max-w-[180px]">{featured.prizesDescription}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 sm:mt-3 flex flex-col md:flex-row gap-2.5 sm:gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1 min-w-0 max-w-3xl">
                      <h2 className="text-base sm:text-lg md:text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {featured.title}
                      </h2>
                      {featured.tagline && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-relaxed">
                          {featured.tagline}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0 pt-1 md:pt-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-foreground">{featured.attendeeCount} enrolled</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span className="font-bold text-primary">{featured.entryFee || "Free"}</span>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black group-hover:opacity-90 transition-opacity shadow-xs shrink-0">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
        )}

        {/* ─── Stream of Event Cards (Grid or List Layout) ─── */}
        <div className="pt-1 sm:pt-2">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 sm:h-80 rounded-3xl bg-muted/30 border border-border/30 animate-pulse"
                />
              ))}
            </div>
          ) : events.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 sm:gap-3.5 max-w-4xl mx-auto">
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} variant="row" />
                ))}
              </div>
            )
          ) : (
            <div className="py-24 text-center space-y-3 max-w-md mx-auto">
              <div className="flex size-14 items-center justify-center rounded-3xl bg-muted/60 text-muted-foreground mx-auto border border-border/40">
                <Calendar className="size-7" />
              </div>
              <h3 className="text-base font-black text-foreground">No events found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchQuery
                  ? "Try searching for a different keyword, category, or mode."
                  : "No events match this filter. Be the first organizer to host a competition or meetup on your campus."}
              </p>
              <Link
                href="/app/events/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Host Event (+25 LP)</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
