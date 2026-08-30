"use client";

import { EventCard, EventItem } from "@/components/events/event-card";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { Calendar, Code, GraduationCap, Music, Plus, Search, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

const SCOPES = [
  { id: "ALL" as const, label: "All campuses" },
  { id: "MY_CAMPUS" as const, label: "My campus" },
];

const CATEGORIES = [
  { id: "ALL", label: "All", icon: Calendar },
  { id: "hackathons", label: "Hackathons", icon: Code },
  { id: "competitions", label: "Competitions", icon: Trophy },
  { id: "fests", label: "Fests", icon: Music },
  { id: "workshops", label: "Workshops", icon: GraduationCap },
];

export function EventsClient() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [scope, setScope] = useState<"ALL" | "MY_CAMPUS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const endpoint = `/api/events?category=${activeCategory}&scope=${scope}&q=${encodeURIComponent(searchQuery)}`;
  const { data, isLoading } = useSWR<{ events: EventItem[] }>(
    endpoint,
    fetcher,
    { dedupingInterval: 15000 }
  );

  const events = data?.events || [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl select-none flex-col border-x border-border/20 pb-28">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 px-4 py-3.5">
          <div className="min-w-0">
            <h1 className="text-lg font-black tracking-tight text-foreground">Events</h1>
            <p className="truncate text-[13px] text-muted-foreground">
              Hackathons, fests and workshops
            </p>
          </div>

          <Link
            href="/app/events/new"
            onClick={() => haptics.light()}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Host event</span>
            <span className="sm:hidden">Host</span>
          </Link>
        </div>

        {/* Scope tabs, matching the feed */}
        <div className="flex items-center">
          {SCOPES.map((s) => {
            const isActive = scope === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  haptics.light();
                  setScope(s.id);
                }}
                className={cn(
                  "relative flex-1 cursor-pointer py-3 text-[14px] font-bold transition-colors",
                  isActive
                    ? "font-black text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <span>{s.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Search ─── */}
      <div className="border-b border-border/30 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events, clubs or workshops"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full border border-border/60 bg-muted/30 pl-10 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
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
      </div>

      {/* ─── Category pills ─── */}
      <div className="border-b border-border/30 px-4 py-3">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  haptics.light();
                  setActiveCategory(cat.id);
                }}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                  isActive
                    ? "bg-foreground font-black text-background"
                    : "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="divide-y divide-border/30">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse gap-3.5 px-4 py-4">
              <div className="size-24 shrink-0 rounded-xl bg-muted/60 sm:size-28" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2.5 w-1/3 rounded bg-muted/50" />
                <div className="h-3.5 w-3/4 rounded bg-muted/60" />
                <div className="h-2.5 w-1/2 rounded bg-muted/40" />
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <Calendar className="size-8 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-foreground">No events yet</h3>
              <p className="text-[13px] text-muted-foreground">
                {searchQuery
                  ? `Nothing matches "${searchQuery}".`
                  : "Be the first club to host one on your campus."}
              </p>
            </div>
            <Link
              href="/app/events/new"
              className="mt-1 cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90"
            >
              Host an event
            </Link>
          </div>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </main>
  );
}
