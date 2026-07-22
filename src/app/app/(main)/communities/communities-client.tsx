"use client";

import { useState } from "react";
import { CreateCommunityDialog } from "./create-community-dialog";
import { JoinCommunityButton } from "./join-community-button";
import Link from "next/link";
import { Users2, ArrowRight, Search, Flame } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"all" | "joined" | "created">("all");

  const filteredCommunities = initialCommunities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase());

    const isMember = c.members.some((m) => m.userId === profileId);
    const isCreator = c.creatorId === profileId;

    if (activeTab === "joined") return matchesSearch && isMember;
    if (activeTab === "created") return matchesSearch && isCreator;
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

  function getActivityLevel(membersCount: number) {
    if (membersCount >= 50) return { label: "Hot", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: Flame };
    if (membersCount >= 20) return { label: "Trending", color: "text-primary bg-primary/10 border-primary/20", icon: Flame };
    if (membersCount >= 5) return null;
    return null;
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-16 px-4">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <div className="absolute right-[-10%] top-[-30%] h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-20%] h-36 w-36 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <Users2 className="h-7 w-7 text-primary" /> Student Communities
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
              Discover active campus circles, find students with shared interests, or launch your own community.
            </p>
          </div>
          <div className="shrink-0">
            <CreateCommunityDialog />
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/40 border border-border/50 rounded-2xl p-3 backdrop-blur-md">
        {/* Tabs */}
        <div className="flex bg-muted/60 p-1 rounded-xl w-full sm:w-auto">
          {([
            { id: "all", label: "All Hubs" },
            { id: "joined", label: "Joined" },
            { id: "created", label: "My Hubs" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial text-center px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground/60"
              }`}>
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search communities..."
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
          const initials = c.name.slice(0, 2).toUpperCase();
          const activity = getActivityLevel(membersCount);
          const ActivityIcon = activity?.icon;

          return (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card/75 p-5 shadow-sm hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getInitialsGradient(c.name)} flex items-center justify-center text-white text-sm font-black shadow-inner shadow-black/10 shrink-0`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/app/communities/${c.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors hover:underline text-sm leading-tight line-clamp-1 block"
                      >
                        {c.name}
                      </Link>
                      <Link
                        href={`/app/profile/${c.creator?.username || ""}`}
                        className="text-[10px] text-muted-foreground font-semibold hover:text-primary transition-colors truncate block"
                      >
                        By @{c.creator?.username || "admin"}
                      </Link>
                    </div>
                  </div>
                  {activity && ActivityIcon && (
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${activity.color}`}>
                      <ActivityIcon className="h-3 w-3" />
                      {activity.label}
                    </span>
                  )}
                </div>

                {c.description && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                  <Users2 className="h-3.5 w-3.5" />
                  <span>{membersCount} {membersCount === 1 ? "member" : "members"}</span>
                  <span className="text-border">•</span>
                  <span>Created {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border/40 pt-4">
                <span className="text-[10px] text-muted-foreground font-semibold hidden sm:inline">
                  {isMember ? "You're a member" : "Join to participate"}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold sm:hidden">
                  {isMember ? "Joined" : "Join"}
                </span>
                <div className="flex items-center gap-2">
                  <JoinCommunityButton communityId={c.id} initialIsMember={isMember} />
                  <Link
                    href={`/app/communities/${c.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 group-hover:border-primary/20"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCommunities.length === 0 && (
          <div className="col-span-full text-center py-20 border border-dashed rounded-3xl border-border bg-card/40 my-4 flex flex-col items-center justify-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 mb-4">
              <Users2 className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">No communities found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              {activeTab === "joined"
                ? "You haven't joined any communities yet. Explore and join one!"
                : activeTab === "created"
                ? "You haven't created any communities yet. Start your own!"
                : "We couldn't find any communities matching your criteria. Try creating a new one!"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
