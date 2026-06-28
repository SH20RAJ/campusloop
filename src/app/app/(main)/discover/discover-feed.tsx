"use client";

import { useState } from "react";
import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, HelpCircle, Heart, Flame, School } from "lucide-react";

export function DiscoverFeed() {
  const [activeTab, setActiveTab] = useState<"TRENDING" | "CONFESSION" | "QUESTION">("TRENDING");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  // Map tabs to feed API types
  const feedType = activeTab === "TRENDING" ? undefined : activeTab;
  const { feed, isLoading } = useFeed("GLOBAL", feedType);

  const colleges = [
    { id: "inst_iitb", name: "IIT Bombay", shortName: "IITB" },
    { id: "inst_bits", name: "BITS Pilani", shortName: "BITS" },
    { id: "inst_iiitd", name: "IIIT Delhi", shortName: "IIITD" },
    { id: "inst_nitt", name: "NIT Trichy", shortName: "NITT" },
    { id: "inst_lpu", name: "LPU", shortName: "LPU" }
  ];

  // Filter feed locally if college selected
  const filteredFeed = feed?.filter(post => 
    selectedCollegeId ? post.institutionId === selectedCollegeId : true
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 px-4 py-4 backdrop-blur-xl border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-primary" /> Discover
            </h1>
            <p className="text-xs text-muted-foreground">What's happening across all campuses.</p>
          </div>
        </div>

        {/* Horizontal College Selector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <School className="h-3 w-3" /> Explore Campuses
          </span>
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
            {colleges.map((col) => (
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
            ))}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-t border-border pt-3">
          <button
            onClick={() => setActiveTab("TRENDING")}
            className={`flex-1 pb-2 text-center text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "TRENDING" 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3.5 w-3.5" /> Trending
          </button>
          <button
            onClick={() => setActiveTab("CONFESSION")}
            className={`flex-1 pb-2 text-center text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "CONFESSION" 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="h-3.5 w-3.5" /> Confessions
          </button>
          <button
            onClick={() => setActiveTab("QUESTION")}
            className={`flex-1 pb-2 text-center text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "QUESTION" 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" /> Questions
          </button>
        </div>
      </header>

      {/* Feed List */}
      <div className="flex flex-col px-4 pt-6 pb-24 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
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
