"use client";

import { useState } from "react";
import { CreateCommunityDialog } from "./create-community-dialog";
import { JoinCommunityButton } from "./join-community-button";
import Link from "next/link";
import { Users2, ArrowRight, Search, Flame, Sparkles, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  createdAt: Date;
  members: { id: string; communityId: string; userId: string }[];
  creator: { id: string; username: string; displayName: string };
}

interface CommunitiesClientViewProps {
  initialCommunities: Community[];
  profileId: string;
}

export function CommunitiesClientView({
  initialCommunities,
  profileId,
}: CommunitiesClientViewProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "joined" | "created" | "tech" | "music">("all");

  const filteredCommunities = initialCommunities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase());

    const isMember = c.members.some((m) => m.userId === profileId);
    const isCreator = c.creatorId === profileId;
    const nameLower = c.name.toLowerCase();

    if (activeTab === "joined") return matchesSearch && isMember;
    if (activeTab === "created") return matchesSearch && isCreator;
    if (activeTab === "tech") return matchesSearch && (nameLower.includes("code") || nameLower.includes("tech") || nameLower.includes("dev"));
    if (activeTab === "music") return matchesSearch && (nameLower.includes("music") || nameLower.includes("jam") || nameLower.includes("art"));
    return matchesSearch;
  });

  const tabCounts = {
    all: initialCommunities.length,
    joined: initialCommunities.filter((c) => c.members.some((m) => m.userId === profileId)).length,
    created: initialCommunities.filter((c) => c.creatorId === profileId).length,
  };

  function getInitialsGradient(name: string) {
    const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-indigo-500 to-violet-500",
      "from-purple-500 to-pink-500",
      "from-blue-500 to-indigo-500",
      "from-violet-500 to-fuchsia-500",
      "from-fuchsia-500 to-rose-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500",
      "from-cyan-500 to-blue-500",
    ];
    return gradients[charCodeSum % gradients.length];
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-16 px-4">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <div className="absolute right-[-10%] top-[-30%] h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <Users2 className="h-7 w-7 text-primary" /> Campus Sub-Hubs
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
              Join Reddit-style student sub-hubs, share anonymous thoughts, host canteen jams, or launch your own campus community.
            </p>
          </div>
          <div className="shrink-0">
            <CreateCommunityDialog />
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/40 border border-border/50 rounded-2xl p-3 backdrop-blur-md">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: "all", label: "All Sub-Hubs" },
            { id: "joined", label: `Joined (${tabCounts.joined})` },
            { id: "created", label: `My Hubs (${tabCounts.created})` },
            { id: "tech", label: "Tech & Coding" },
            { id: "music", label: "Music & Arts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 border",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card/60 text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search c/community..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 pl-9 pr-4 py-2 text-xs font-semibold focus:ring-1 focus:ring-ring outline-none"
          />
        </div>
      </div>

      {/* Grid of Communities */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCommunities.map((c) => {
          const isMember = c.members.some((m) => m.userId === profileId);
          const membersCount = c.members.length;

          return (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-amber-500/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${getInitialsGradient(c.name)} flex items-center justify-center text-white text-xs font-black shadow-inner shrink-0`}>
                      c/{c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/app/communities/${c.id}`}
                        className="font-black text-foreground hover:text-primary transition-colors hover:underline text-sm leading-tight line-clamp-1 block"
                      >
                        c/{c.name}
                      </Link>
                      <Link
                        href={`/app/profile/${c.creator?.username || ""}`}
                        className="text-[10px] text-muted-foreground font-semibold hover:text-primary transition-colors truncate block"
                      >
                        By @{c.creator?.username || "admin"}
                      </Link>
                    </div>
                  </div>
                </div>

                {c.description && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed font-medium">
                    {c.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                  <Users2 className="h-3.5 w-3.5" />
                  <span>{membersCount} {membersCount === 1 ? "member" : "members"}</span>
                  <span className="text-border">&bull;</span>
                  <span>Active Hub</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border/40 pt-4">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {isMember ? "Joined Member" : "Public Sub-Hub"}
                </span>
                <div className="flex items-center gap-2">
                  <JoinCommunityButton communityId={c.id} initialIsMember={isMember} />
                  <Link
                    href={`/app/communities/${c.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCommunities.length === 0 && (
          <div className="col-span-full text-center py-20 border border-dashed rounded-3xl border-border bg-card/40 my-4 flex flex-col items-center justify-center p-6 space-y-2">
            <Sparkles className="size-8 text-muted-foreground/40" />
            <h3 className="font-bold text-foreground text-sm">No sub-hubs found</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              We couldn&apos;t find any communities matching "{search}". Launch your own sub-hub now!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
