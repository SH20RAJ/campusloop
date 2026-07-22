"use client";

import { useState } from "react";
import useSWR from "swr";
import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, HelpCircle, Heart, Flame, School, ArrowUpRight, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { FeedSkeleton } from "@/components/ui/skeleton-card";

interface College {
  id: string;
  name: string;
  state: string | null;
  district: string | null;
  postCount: number;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => res.json() as Promise<T>);

export function DiscoverFeed() {
  const [activeTab, setActiveTab] = useState<"TRENDING" | "CONFESSION" | "QUESTION">("TRENDING");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  const feedType = activeTab === "TRENDING" ? undefined : activeTab;
  const { feed, isLoading: feedLoading } = useFeed("GLOBAL", feedType);
  const { data: colleges, isLoading: collegesLoading } = useSWR<College[]>("/api/colleges?limit=12", fetcher);

  const filteredFeed = feed?.filter(post =>
    selectedCollegeId ? post.institutionId === selectedCollegeId : true
  );

  const selectedCollege = colleges?.find(c => c.id === selectedCollegeId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 px-4 py-4 backdrop-blur-xl border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Discover
            </h1>
            <p className="text-xs text-muted-foreground">What&apos;s happening across all campuses.</p>
          </div>
        </div>

        {/* Horizontal College Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <School className="h-3 w-3" /> Explore Campuses
            </span>
            {selectedCollegeId && selectedCollege && (
              <Link
                href={`/college/${selectedCollegeId}`}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                View details <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCollegeId(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                selectedCollegeId === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              All Campuses
            </button>
            {collegesLoading ? (
              <Skeleton className="h-6 w-24 rounded-full" />
            ) : (
              colleges?.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedCollegeId(col.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors border cursor-pointer ${
                    selectedCollegeId === col.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {col.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-t border-border pt-3">
          {[
            { id: "TRENDING", label: "Trending", icon: Flame },
            { id: "CONFESSION", label: "Confessions", icon: Heart },
            { id: "QUESTION", label: "Questions", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "TRENDING" | "CONFESSION" | "QUESTION")}
                className={`flex-1 pb-2 text-center text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Featured Campuses Grid */}
      {!selectedCollegeId && !feedLoading && (
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <School className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Featured Campuses</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {collegesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-xl" />
                </div>
              ))
            ) : (
              colleges?.slice(0, 6).map((college) => (
                <Link
                  key={college.id}
                  href={`/college/${college.id}`}
                  className="group rounded-2xl border border-border/60 bg-card/60 p-4 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {college.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {college.state}{college.district ? `, ${college.district}` : ""}
                      </p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold bg-muted/30 rounded-lg px-2.5 py-1.5 w-fit">
                    <Users className="h-3 w-3" />
                    {college.postCount} {college.postCount === 1 ? "post" : "posts"}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Feed List */}
      <div className="flex flex-col px-4 pt-4 pb-24 gap-6">
        {feedLoading ? (
          <FeedSkeleton />
        ) : filteredFeed && filteredFeed.length > 0 ? (
          filteredFeed.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-card p-6">
            <School className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <h3 className="font-semibold text-foreground text-sm">No posts found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[250px] mx-auto">
              Be the first to share something on this campus or try a different filter.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
