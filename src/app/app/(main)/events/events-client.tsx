"use client";

import { EventCard, EventItem } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import {
  Calendar,
  Code,
  Flame,
  Globe,
  GraduationCap,
  Music,
  Plus,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";

const CATEGORIES = [
  { id: "ALL", label: "All Events", icon: Calendar },
  { id: "hackathons", label: "Hackathons", icon: Code },
  { id: "competitions", label: "Competitions", icon: Trophy },
  { id: "fests", label: "Fests & Cultural", icon: Music },
  { id: "workshops", label: "Workshops", icon: GraduationCap },
];

export function EventsClient() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [scope, setScope] = useState<"ALL" | "MY_CAMPUS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const endpoint = `/api/events?category=${activeCategory}&scope=${scope}&q=${encodeURIComponent(searchQuery)}`;
  const { data, isLoading, mutate } = useSWR<{ events: EventItem[] }>(
    endpoint,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  const events = data?.events || [];

  return (
    <div className="min-h-screen pb-24 border-x border-border/40 bg-background">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/40 px-4 py-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Campus Events & Fests
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hackathons, cultural fests, workshops & competitions
            </p>
          </div>

          <Link href="/app/events/new">
            <Button
              size="sm"
              onClick={() => haptics.light()}
              className="h-9 px-4 rounded-full font-black text-xs bg-primary text-primary-foreground hover:opacity-90 shadow-2xs gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Create Event</span>
            </Button>
          </Link>
        </div>

        {/* Search Bar & Scope Switch */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search hackathons, clubs, workshops, fests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9.5 pl-9 pr-3 rounded-full text-xs bg-muted/30 border-border/60 focus:bg-background"
            />
          </div>

          <div className="flex items-center bg-muted/40 p-1 rounded-full border border-border/40 shrink-0">
            <button
              onClick={() => {
                haptics.light();
                setScope("ALL");
              }}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                scope === "ALL"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Global
            </button>
            <button
              onClick={() => {
                haptics.light();
                setScope("MY_CAMPUS");
              }}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                scope === "MY_CAMPUS"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Campus
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  haptics.light();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl border border-border/40 bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-4">
            <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
              <Calendar className="size-8 text-primary" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-black text-lg text-foreground">No events found</h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? `No events matching "${searchQuery}". Try a different search term.`
                  : "Be the first club or student organizer to host a campus event!"}
              </p>
            </div>
            <Link href="/app/events/new">
              <Button
                size="sm"
                className="h-9 px-5 rounded-full font-black text-xs bg-primary text-primary-foreground gap-1.5"
              >
                <Plus className="size-4" />
                Host a Campus Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
