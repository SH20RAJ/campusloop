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
  const events = modeFilter === "ALL"
    ? rawEvents
    : rawEvents.filter((e) => e.mode?.toUpperCase() === modeFilter);

  // Stats calculation
  const totalRegistered = rawEvents.reduce((acc, curr) => acc + (curr.attendeeCount || 0), 0);
  const hackathonsCount = rawEvents.filter((e) => e.eventType === "HACKATHON").length;

  return (
    <PullToRefresh onRefresh={() => mutate()}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col bg-background pb-28 px-3 sm:px-6 lg:px-8">
        {/* ─── Top Sticky Omnibar & Action Bar ─── */}
        <header className="sticky top-0 z-40 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 border-b border-border/30 bg-background/85 backdrop-blur-xl transition-all">
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Title & Scope Pill */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                  <Calendar className="size-4.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-base font-black tracking-tight text-foreground truncate">
                      Events &amp; Hackathons
                    </h1>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/25">
                      {rawEvents.length} Active
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground truncate hidden md:inline">
                    Competitions, Fests &amp; Bootcamps
                  </span>
                </div>
              </div>

              {/* Scope Pill (Campus vs All India) */}
              <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setScope("ALL");
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    scope === "ALL"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="View events across all 1,350+ colleges in India"
                >
                  <Globe className="size-3" />
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
                    "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    scope === "MY_CAMPUS"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="View events exclusive to your college campus"
                >
                  <School className="size-3" />
                  <span>My Campus</span>
                </button>
              </div>
            </div>

            {/* Right: View Toggle & Host Event CTA */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Grid / List View Switcher */}
              <div className="flex items-center rounded-full bg-muted/50 p-0.5 border border-border/40">
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

              <Link
                href="/app/events/new"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="flex h-8.5 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-sm"
              >
                <Plus className="size-3.5" />
                <span>Host Event</span>
                <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded-full bg-primary-foreground/20 font-mono">
                  +25 LP
                </span>
              </Link>
            </div>
          </div>

          {/* ─── Search & Fast Filter Ribbon ─── */}
          <div className="py-2.5 space-y-2 border-t border-border/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search hackathons, cultural fests, workshops or clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9.5 w-full rounded-2xl border border-border/40 bg-muted/40 pl-10 pr-9 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Mode Filter Selector */}
              <div className="no-scrollbar flex items-center gap-1 overflow-x-auto shrink-0">
                {MODES.map((mode) => {
                  const isActive = modeFilter === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        sounds.tap();
                        haptics.light();
                        setModeFilter(mode.id);
                      }}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border flex items-center gap-1.5",
                        isActive
                          ? "bg-foreground text-background border-foreground font-black shadow-xs"
                          : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
                      )}
                    >
                      {Icon && <Icon className="size-3" />}
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category pills & Sort tabs row */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pt-0.5">
              {/* Categories */}
              <div className="flex items-center gap-1.5 shrink-0">
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
                        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border",
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
              </div>

              {/* Sort Tabs (Trending / Upcoming / Latest) */}
              <div className="flex items-center rounded-full bg-muted/40 p-0.5 border border-border/40 shrink-0 ml-auto">
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
                        "px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1",
                        isActive
                          ? "bg-background text-foreground shadow-xs font-black"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* ─── Highlights & Stats Ribbon ─── */}
        {!isLoading && rawEvents.length > 0 && !searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 py-4">
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
          <div className="pb-4">
            {(() => {
              const featured = events.find((e) => e.prizesDescription) || events[0];
              return (
                <Link
                  href={`/app/events/${featured.slug || featured.id}`}
                  className="group relative block overflow-hidden rounded-3xl border border-primary/30 bg-linear-to-br from-primary/15 via-card to-card p-5 sm:p-6 shadow-sm transition-all hover:border-primary/60 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-primary-foreground shadow-xs">
                        <Sparkles className="size-3" />
                        Featured Spotlight
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted/60 text-muted-foreground border border-border/40">
                        {featured.clubName}
                      </span>
                    </div>

                    {featured.prizesDescription && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-black">
                        <Trophy className="size-3.5" />
                        <span>{featured.prizesDescription}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1.5 min-w-0 max-w-3xl">
                      <h2 className="text-lg sm:text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {featured.title}
                      </h2>
                      {featured.tagline && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {featured.tagline}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex flex-col text-right text-xs">
                        <span className="font-black text-foreground">{featured.attendeeCount} Registered</span>
                        <span className="text-[10px] text-muted-foreground">{featured.entryFee || "Free Entry"}</span>
                      </div>
                      <span className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black group-hover:opacity-90 transition-opacity shadow-xs">
                        View &amp; Register →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
        )}

        {/* ─── Stream of Event Cards (Grid or List Layout) ─── */}
        <div className="pt-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-muted/30 border border-border/30 animate-pulse" />
              ))}
            </div>
          ) : events.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {events.map((ev) => (
                  <EventCard key={ev.id} event={ev} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-w-4xl mx-auto">
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
