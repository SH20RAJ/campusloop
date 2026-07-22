"use client";

import { useState } from "react";
import { CreateCommunityDialog } from "./create-community-dialog";
import { JoinCommunityButton } from "./join-community-button";
import Link from "next/link";
import { Users2, ArrowRight, Search, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedPost } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";

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
  initialPosts?: FeedPost[];
  profileId: string;
}

export function CommunitiesClientView({
  initialCommunities,
  initialPosts = [],
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
    <main className="space-y-8 max-w-5xl mx-auto pb-16 px-4 pt-2">
      {/* Clean Minimal Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/80 to-background p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Users2 className="h-6 w-6 text-primary" /> Student Sub-Hubs
            </h1>
            <p className="text-xs text-muted-foreground font-medium max-w-md leading-relaxed">
              Explore Reddit-style student sub-hubs, post anonymously, participate in campus polls, and join discussions.
            </p>
          </div>
          <div className="shrink-0">
            <CreateCommunityDialog />
          </div>
        </div>
      </div>

      {/* Section 1: Sub-Hubs Directory */}
      <div className="space-y-4">
        {/* Category Pills & Search */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-card/40 border border-border/50 rounded-2xl p-2.5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
            {[
              { id: "all", label: "All Hubs" },
              { id: "joined", label: `Joined (${tabCounts.joined})` },
              { id: "created", label: `My Hubs (${tabCounts.created})` },
              { id: "tech", label: "Tech" },
              { id: "music", label: "Music & Arts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 border",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card/60 text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search sub-hubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/30 pl-8 pr-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        {/* Sub-Hubs Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCommunities.map((c) => {
            const isMember = c.members.some((m) => m.userId === profileId);
            const membersCount = c.members.length;

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:border-primary/30 transition-all duration-200 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${getInitialsGradient(
                        c.name
                      )} flex items-center justify-center text-white text-xs font-black shadow-inner shrink-0`}
                    >
                      c/{c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/app/communities/${c.id}`}
                        className="font-black text-foreground hover:text-primary transition-colors hover:underline text-xs leading-tight line-clamp-1 block"
                      >
                        c/{c.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {membersCount} {membersCount === 1 ? "member" : "members"}
                      </span>
                    </div>
                  </div>

                  {c.description && (
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed font-medium">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-border/30 pt-3">
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {isMember ? "Joined" : "Public Sub-Hub"}
                  </span>
                  <div className="flex items-center gap-2">
                    <JoinCommunityButton communityId={c.id} initialIsMember={isMember} />
                    <Link
                      href={`/app/communities/${c.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCommunities.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed rounded-2xl border-border bg-card/40 my-2 flex flex-col items-center justify-center p-6 space-y-2">
              <Sparkles className="size-6 text-muted-foreground/40" />
              <h3 className="font-bold text-foreground text-xs">No matching sub-hubs</h3>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                No communities found for "{search}". Create one using the button above!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Recent Community Posts Feed */}
      {initialPosts.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-primary" /> Active Community Threads
            </h2>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {initialPosts.length} Recent Posts
            </span>
          </div>

          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {initialPosts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={profileId} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
