"use client";

import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
Flame,
Globe,
Lock,
Plus,
Search,
Sparkles,
Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo,useState } from "react";

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
  "Cultural & Arts",
  "Academics & Placements",
  "Gaming & Anime",
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
  const [viewTab, setViewTab] = useState<"FOR_YOU" | "TRENDING_BUZZ" | "EXPLORE" | "JOINED">("FOR_YOU");

  const joinedCommunities = useMemo(() => {
    return initialCommunities.filter((c) =>
      c.members.some((m) => m.userId === profileId)
    );
  }, [initialCommunities, profileId]);

  // Algorithmic ranking of communities for "FOR YOU"
  const recommendedCommunities = useMemo(() => {
    const list = [...initialCommunities];
    return list.sort((a, b) => {
      // Prioritize non-joined with highest member count and points
      const aJoined = a.members.some((m) => m.userId === profileId) ? 0 : 1;
      const bJoined = b.members.some((m) => m.userId === profileId) ? 0 : 1;
      if (aJoined !== bJoined) return bJoined - aJoined;
      const scoreA = (a.points || 0) + a.members.length * 15;
      const scoreB = (b.points || 0) + b.members.length * 15;
      return scoreB - scoreA;
    });
  }, [initialCommunities, profileId]);

  // Algorithmic trending community discussions
  const trendingCommunityPosts = useMemo(() => {
    const list = [...initialPosts];
    return list.sort((a, b) => {
      const now = Date.now();
      const ageHoursA = Math.max(1, (now - new Date(a.createdAt).getTime()) / (3600 * 1000));
      const ageHoursB = Math.max(1, (now - new Date(b.createdAt).getTime()) / (3600 * 1000));
      const scoreA = (a.votesCount * 2 + a.commentsCount * 3 + 5) / Math.pow(ageHoursA, 0.75);
      const scoreB = (b.votesCount * 2 + b.commentsCount * 3 + 5) / Math.pow(ageHoursB, 0.75);
      return scoreB - scoreA;
    });
  }, [initialPosts]);

  // Filtered communities for Explore and Joined tabs
  const filteredCommunities = useMemo(() => {
    const base = viewTab === "JOINED" ? joinedCommunities : initialCommunities;
    return base.filter((c) => {
      if (c.privacy === "UNLISTED" && !c.members.some((m) => m.userId === profileId)) {
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
  }, [initialCommunities, joinedCommunities, viewTab, profileId, search, selectedCategory]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen bg-background text-foreground pb-24 border-x border-border/30 select-none">
      {/* ─── Sticky Twitter/X Header ─── */}
      <header className="sticky top-0 z-40 bg-background/80 px-4 pt-2.5 backdrop-blur-xl border-b border-border/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="size-4.5" />
            </button>
            <div>
              <h1 className="text-base font-black tracking-tight text-foreground">
                Communities
              </h1>
              <p className="text-xs text-muted-foreground font-normal">
                {initialCommunities.length} student-run sub-hubs &amp; circles
              </p>
            </div>
          </div>

          <Link
            href="/app/communities/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-3.5 stroke-[3]" />
            <span>Create Hub</span>
          </Link>
        </div>

        {/* ─── Twitter/X Segmented Tabs with Active Indicator ─── */}
        <div className="flex border-b border-border/20 -mx-4 px-2">
          {[
            { id: "FOR_YOU", label: "For You" },
            { id: "TRENDING_BUZZ", label: "Trending Buzz" },
            { id: "EXPLORE", label: "Explore All" },
            { id: "JOINED", label: `Joined (${joinedCommunities.length})` },
          ].map((tab) => {
            const isActive = viewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewTab(tab.id as typeof viewTab)}
                className={cn(
                  "relative flex-1 py-2.5 text-center text-xs transition-colors cursor-pointer flex flex-col items-center justify-center",
                  isActive
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground font-bold"
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 h-1 w-10 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── TAB 1: FOR YOU (Algorithmic Personalized Discovery) ─── */}
      {viewTab === "FOR_YOU" && (
        <div className="flex flex-col divide-y divide-border/30">
          {/* Featured Spotlight Hub Hero Card */}
          {recommendedCommunities.length > 0 && (
            <div className="relative border-b border-border/30 bg-card/20 overflow-hidden">
              <div className="relative h-28 sm:h-36 w-full bg-neutral-900 overflow-hidden">
                {recommendedCommunities[0].bannerUrl ? (
                  <img
                    src={recommendedCommunities[0].bannerUrl}
                    alt={recommendedCommunities[0].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
                  </div>
                )}
                <span className="absolute top-2.5 left-3 px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-primary border border-border/40 flex items-center gap-1">
                  <Sparkles className="size-2.5" /> Featured Sub-Hub
                </span>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-end justify-between -mt-8 mb-2">
                  <Avatar className="size-16 rounded-full border-4 border-background bg-card shadow-md">
                    <AvatarImage src={recommendedCommunities[0].avatarUrl || ""} />
                    <AvatarFallback className="bg-neutral-800 text-foreground font-black text-sm">
                      {recommendedCommunities[0].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <JoinCommunityButton
                    communityId={recommendedCommunities[0].id}
                    initialIsMember={recommendedCommunities[0].members.some((m) => m.userId === profileId)}
                    className="h-8 px-4 text-xs font-black rounded-full shadow-xs"
                  />
                </div>

                <Link href={`/app/communities/${recommendedCommunities[0].slug || recommendedCommunities[0].id}`} className="group block space-y-1">
                  <h2 className="text-base font-black text-foreground group-hover:underline flex items-center gap-1.5">
                    c/{recommendedCommunities[0].name}
                  </h2>
                  <p className="text-xs text-primary font-bold">
                    {recommendedCommunities[0].category} · {recommendedCommunities[0].members.length} members
                  </p>
                  {recommendedCommunities[0].description && (
                    <p className="text-xs text-foreground/80 font-normal line-clamp-2 leading-relaxed pt-0.5">
                      {recommendedCommunities[0].description}
                    </p>
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* Suggested Circles List */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-tight uppercase text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" /> Circles You Might Like
              </span>
              <button
                type="button"
                onClick={() => setViewTab("EXPLORE")}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-border/25">
              {recommendedCommunities.slice(1, 4).map((c) => {
                const isMember = c.members.some((m) => m.userId === profileId);
                return (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                    <Link
                      href={`/app/communities/${c.slug || c.id}`}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                    >
                      <Avatar className="size-11 rounded-full border border-border/40 shrink-0">
                        <AvatarImage src={c.avatarUrl || ""} />
                        <AvatarFallback className="bg-muted text-xs font-bold">
                          {c.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-bold text-foreground group-hover:underline truncate">
                          c/{c.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.category} · {c.members.length} members
                        </p>
                        {c.description && (
                          <p className="text-xs text-muted-foreground/80 line-clamp-1">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </Link>

                    <JoinCommunityButton
                      communityId={c.id}
                      initialIsMember={isMember}
                      className="h-8 px-4 text-xs font-bold rounded-full shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Algorithmic In-Feed Discussions Section */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-tight uppercase text-foreground flex items-center gap-1.5">
                <Flame className="size-3.5 text-primary" /> Trending In Communities
              </span>
              <button
                type="button"
                onClick={() => setViewTab("TRENDING_BUZZ")}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                More buzz
              </button>
            </div>

            <div className="divide-y divide-border/25">
              {trendingCommunityPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="pt-2">
                  <FeedCard post={post} currentUserId={profileId} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TRENDING BUZZ (Algorithmic Community Feed) ─── */}
      {viewTab === "TRENDING_BUZZ" && (
        <div className="flex flex-col divide-y divide-border/30">
          {trendingCommunityPosts.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No community posts found yet. Join a community and post something!
            </div>
          ) : (
            trendingCommunityPosts.map((post) => (
              <div key={post.id}>
                <FeedCard post={post} currentUserId={profileId} />
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── TAB 3 & 4: EXPLORE & JOINED DIRECTORY ─── */}
      {(viewTab === "EXPLORE" || viewTab === "JOINED") && (
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

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-foreground text-background font-black shadow-2xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Flat Community Rows (Twitter/X style) */}
          <div className="divide-y divide-border/25 pt-1">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((c) => {
                const isMember = c.members.some((m) => m.userId === profileId);
                const membersCount = c.members.length;

                return (
                  <div key={c.id} className="py-3.5 flex items-center justify-between gap-3 group">
                    <Link
                      href={`/app/communities/${c.slug || c.id}`}
                      className="flex items-center gap-3.5 min-w-0 flex-1"
                    >
                      <Avatar className="size-12 rounded-full border border-border/40 shrink-0">
                        <AvatarImage src={c.avatarUrl || ""} />
                        <AvatarFallback className="bg-muted text-xs font-bold">
                          {c.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-foreground group-hover:underline truncate">
                            c/{c.name}
                          </p>
                          {c.privacy === "PRIVATE" ? (
                            <Lock className="size-3 text-muted-foreground shrink-0" />
                          ) : (
                            <Globe className="size-3 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-primary font-bold truncate">
                          {c.category} · <span className="text-muted-foreground font-medium">{membersCount} members</span>
                        </p>
                        {c.description && (
                          <p className="text-xs text-muted-foreground/80 line-clamp-1">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </Link>

                    <JoinCommunityButton
                      communityId={c.id}
                      initialIsMember={isMember}
                      className="h-8 px-4 text-xs font-bold rounded-full shrink-0"
                    />
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center space-y-2">
                <p className="text-sm font-bold text-foreground">
                  {viewTab === "JOINED" ? "You haven't joined any sub-hubs yet" : "No communities found"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {viewTab === "JOINED"
                    ? "Explore the circles above to discover interest groups and campus societies."
                    : "Try adjusting your search or category filter."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
