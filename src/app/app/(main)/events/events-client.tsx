"use client";

import { Calendar, Globe, Plus, School, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { EventCard, type EventItem } from "@/components/events/event-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const EVENT_TABS = [
  { id: "trending", label: "Trending 🔥" },
  { id: "upcoming", label: "Upcoming 📅" },
  { id: "latest", label: "Latest ✨" },
] as const;

const CATEGORIES = [
  { id: "ALL", label: "All" },
  { id: "hackathons", label: "Hackathons 💻" },
  { id: "fests", label: "Fests 🎪" },
  { id: "competitions", label: "Competitions 🏆" },
  { id: "workshops", label: "Workshops 🎓" },
];

export function EventsClient() {
  const [activeTab, setActiveTab] = useState<"trending" | "upcoming" | "latest">("trending");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [scope, setScope] = useState<"ALL" | "MY_CAMPUS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const endpoint = `/api/events?category=${activeCategory}&scope=${scope}&sort=${activeTab}&q=${encodeURIComponent(
    searchQuery
  )}`;
  const { data, isLoading, mutate } = useSWR<{ events: EventItem[] }>(endpoint, fetcher, {
    dedupingInterval: 15000,
    revalidateOnFocus: true,
  });

  const events = data?.events || [];

  return (
    <PullToRefresh onRefresh={() => mutate()}>
      <main className="mx-auto flex min-h-screen w-full max-w-2xl select-none flex-col border-x border-border/30 bg-background pb-28">
        {/* ─── Sticky Header (Twitter / X Minimal) ─── */}
        <header className="sticky top-0 z-40 border-b border-border/30 bg-background/85 backdrop-blur-xl">
          <div className="flex h-13 items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-1.5">
                <span>Campus Events</span>
                <Calendar className="size-4 text-primary shrink-0" />
              </h1>

              {/* Scope Pill Toggle */}
              <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setScope("ALL");
                  }}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    scope === "ALL"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe className="size-3" />
                  <span>India</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setScope("MY_CAMPUS");
                  }}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                    scope === "MY_CAMPUS"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <School className="size-3" />
                  <span>Campus</span>
                </button>
              </div>
            </div>

            <Link
              href="/app/events/new"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>Host (+25 LP)</span>
            </Link>
          </div>

          {/* ─── Flat Twitter Tabs ─── */}
          <div className="grid grid-cols-3 border-t border-border/20 text-center font-bold text-xs sm:text-sm">
            {EVENT_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
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
                    "py-3 transition-colors relative cursor-pointer flex items-center justify-center gap-1",
                    isActive
                      ? "text-foreground font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* ─── Search & Category Strip (Zero Clutter) ─── */}
        <div className="space-y-2.5 px-4 pt-3 pb-2 border-b border-border/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hackathons, fests, workshops or clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-2xl border border-border/40 bg-muted/40 pl-10 pr-9 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category filter pills */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
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
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                    isActive
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                  )}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Featured Spotlight Banner (Unstop / Devpost Style) ─── */}
        {!isLoading && events.length > 0 && !searchQuery && activeCategory === "ALL" && (
          <div className="p-4 pb-0">
            {(() => {
              const featured = events.find((e) => e.prizesDescription) || events[0];
              return (
                <Link
                  href={`/app/events/${featured.slug || featured.id}`}
                  className="group relative block overflow-hidden rounded-3xl border border-primary/30 bg-linear-to-br from-primary/15 via-background to-card p-5 shadow-sm transition-all hover:border-primary/60 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-xs">
                      🔥 Spotlight Event
                    </span>
                    {featured.prizesDescription && (
                      <span className="text-xs font-black text-amber-500">
                        🏆 {featured.prizesDescription}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-muted-foreground">{featured.clubName}</p>
                      <h2 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {featured.title}
                      </h2>
                      {featured.tagline && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{featured.tagline}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black group-hover:opacity-90 transition-opacity">
                        View & Register →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
        )}

        {/* ─── Stream of Event Cards (Immediate, Content-First) ─── */}
        <div className="flex flex-col p-4 gap-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
              <div className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
            </div>
          ) : events.length > 0 ? (
            events.map((ev) => <EventCard key={ev.id} event={ev} />)
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mx-auto">
                <Calendar className="size-6" />
              </div>
              <p className="text-sm font-bold text-foreground">No events found</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {searchQuery
                  ? "Try searching for a different keyword or category."
                  : "Be the pioneer organizer to host the next big hackathon or workshop on your campus."}
              </p>
              <Link
                href="/app/events/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Host First Event (+25 LP)</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </PullToRefresh>
  );
}
