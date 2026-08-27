"use client";

import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
Globe,
Lock,
Plus,
Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface CommunityItem {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  privacy: "PUBLIC" | "PRIVATE" | "UNLISTED" | string;
  category: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  points?: number;
  creatorId: string;
  createdAt: Date;
  members: { id: string; communityId: string; userId: string; role: string; status: string }[];
  creator: { id: string; username: string; displayName: string };
}

interface CommunitiesIndexClientProps {
  initialCommunities: CommunityItem[];
  initialPosts?: FeedPost[];
  profileId: string;
}

const CATEGORIES = [
  "All",
  "Tech & Coding",
  "Academics & Placements",
  "Cultural & Arts",
  "Gaming & Anime",
  "Sports & Fitness",
  "Memes & Culture",
  "General",
];

export function CommunitiesIndexClient({
  initialCommunities,
  initialPosts = [],
  profileId,
}: CommunitiesIndexClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewTab, setViewTab] = useState<"EXPLORE" | "JOINED" | "FEED">("EXPLORE");

  const joinedCommunities = initialCommunities.filter((c) =>
    c.members.some((m) => m.userId === profileId)
  );

  const activePool =
    viewTab === "JOINED" ? joinedCommunities : initialCommunities;

  const filteredCommunities = activePool.filter((c) => {
    // Hide UNLISTED communities unless the user is a member
    const isMember = c.members.some((m) => m.userId === profileId);
    if (c.privacy === "UNLISTED" && !isMember) {
      return false;
    }

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(search.toLowerCase());

    if (selectedCategory !== "All") {
      return matchesSearch && c.category.toLowerCase() === selectedCategory.toLowerCase();
    }
    return matchesSearch;
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── Sticky Twitter/X Header ─── */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 pt-3 backdrop-blur-xl border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-4.5" />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight text-foreground">
                Communities
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">
                {initialCommunities.length} campus interest groups &amp; clubs
              </p>
            </div>
          </div>

          <Link
            href="/app/communities/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-3.5 stroke-[3]" />
            <span>Create</span>
          </Link>
        </div>

        {/* Twitter Tabs */}
        <div className="flex border-b border-border/30">
          {[
            { id: "EXPLORE", label: "Explore Hubs" },
            { id: "JOINED", label: `Joined (${joinedCommunities.length})` },
            { id: "FEED", label: "Community Feed" },
          ].map((tab) => {
            const isActive = viewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewTab(tab.id as "EXPLORE" | "JOINED" | "FEED")}
                className={cn(
                  "relative flex-1 pb-3 pt-1 text-center text-xs font-bold transition-colors cursor-pointer",
                  isActive
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── DIRECTORY VIEW (Explore / Joined) ─── */}
      {viewTab !== "FEED" ? (
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search communities by name or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-full border border-border/50 bg-muted/40 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs",
                  selectedCategory === cat
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Communities List */}
          <div className="space-y-3 pt-1">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((c) => {
                const isMember = c.members.some((m) => m.userId === profileId);
                const membersCount = c.members.length;

                return (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-border/40 bg-card p-4 hover:border-border/80 transition-all flex flex-col justify-between space-y-3 shadow-xs group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/app/communities/${c.slug || c.id}`}
                        className="flex items-start gap-3 min-w-0 flex-1 group"
                      >
                        <div className="size-11 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center text-foreground font-black text-sm shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-black text-foreground group-hover:underline truncate">
                            c/{c.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                            <span>{membersCount} {membersCount === 1 ? "member" : "members"}</span>
                            <span>·</span>
                            <span className="truncate">{c.category || "General"}</span>
                            {c.privacy === "PRIVATE" ? (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                  <Lock className="size-2.5" /> Private
                                </span>
                              </>
                            ) : (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-0.5">
                                  <Globe className="size-2.5" /> Public
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>

                      <JoinCommunityButton
                        communityId={c.id}
                        initialIsMember={isMember}
                      />
                    </div>

                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No communities found matching your criteria.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── COMMUNITY FEED VIEW ─── */
        <div className="p-4 space-y-4">
          {initialPosts.length > 0 ? (
            initialPosts.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No posts in community feed yet. Join a community to see conversations here!
            </div>
          )}
        </div>
      )}
    </main>
  );
}
