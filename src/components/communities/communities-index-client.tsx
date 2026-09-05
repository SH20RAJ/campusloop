"use client";

import {
  CheckCheck,
  Compass,
  Globe,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import type { FeedPost } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, getAvatarUrl } from "@/lib/utils";

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

interface FeedPageResponse {
  items: any[];
  nextCursor: string | null;
  hasMore: boolean;
}

const CATEGORIES = [
  "All",
  "Tech & Coding",
  "Cultural & Arts",
  "Gaming & Anime",
  "Academics & Placements",
  "Campus Services",
  "General",
];

export function CommunitiesIndexClient({
  initialCommunities,
  initialPosts = [],
  profileId,
}: CommunitiesIndexClientProps) {
  const [activeTab, setActiveTab] = useState<"explore" | "feed" | "my_communities">("explore");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Feed pagination for the "feed" tab
  const getKey = (pageIndex: number, previousPageData: FeedPageResponse | null) => {
    if (activeTab !== "feed") return null;
    if (previousPageData && !previousPageData.hasMore) return null;
    const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor || "";
    return `/api/communities/feed?tab=discussions&cursor=${encodeURIComponent(cursor)}&limit=10`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite<FeedPageResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
    dedupingInterval: 6000,
  });

  const feedItems = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page?.items || []);
  }, [data]);

  const isEmptyFeed = data?.[0]?.items?.length === 0;
  const isReachingFeedEnd = isEmptyFeed || (data && data[data.length - 1]?.hasMore === false);

  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const isValidatingRef = useRef(isValidating);
  isValidatingRef.current = isValidating;

  useEffect(() => {
    if (!sentinelNode || activeTab !== "feed" || isReachingFeedEnd) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingFeedEnd && !isValidatingRef.current) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [sentinelNode, activeTab, isReachingFeedEnd, setSize]);

  // Filtered communities list for Explore tab
  const filteredCommunities = useMemo(() => {
    return initialCommunities.filter((c) => {
      // Privacy filter: Hide unlisted communities if not a member
      if (c.privacy === "UNLISTED" && !c.members.some((m) => m.userId === profileId)) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "All" && c.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesDesc = (c.description || "").toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [initialCommunities, profileId, selectedCategory, search]);

  // Student's joined communities
  const myCommunities = useMemo(() => {
    return initialCommunities.filter((c) => c.members.some((m) => m.userId === profileId));
  }, [initialCommunities, profileId]);

  function handleTabChange(tab: "explore" | "feed" | "my_communities") {
    sounds.tap();
    haptics.light();
    setActiveTab(tab);
  }

  function handleCategoryChange(cat: string) {
    sounds.tap();
    haptics.light();
    setSelectedCategory(cat);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24 border-x border-border/20 bg-background text-foreground select-none">
      {/* ─── Sticky Twitter/X Header ─── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="space-y-0.5">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-1.5">
              <span>Campus Communities</span>
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              Student sub-hubs, tech clubs, interest groups & discussions
            </p>
          </div>

          <Link
            href="/app/communities/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="size-3.5" />
            <span>New Community</span>
          </Link>
        </div>

        {/* ─── Primary Navigation Tabs ─── */}
        <div className="flex border-t border-border/20 text-center">
          <button
            type="button"
            onClick={() => handleTabChange("explore")}
            className={cn(
              "flex-1 py-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer",
              activeTab === "explore"
                ? "text-foreground font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            <span>Explore Sub-Hubs</span>
            {activeTab === "explore" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("feed")}
            className={cn(
              "flex-1 py-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer",
              activeTab === "feed"
                ? "text-foreground font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            <span>Community Feed</span>
            {activeTab === "feed" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("my_communities")}
            className={cn(
              "flex-1 py-3 text-xs sm:text-sm font-bold transition-all relative cursor-pointer",
              activeTab === "my_communities"
                ? "text-foreground font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            <span>My Hubs ({myCommunities.length})</span>
            {activeTab === "my_communities" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* ─── TAB 1: Explore Student Communities (Reddit-Style Sub-Hubs) ─── */}
      {activeTab === "explore" && (
        <div className="p-4 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student communities (e.g. coding, music, startups, anime)..."
              className="w-full rounded-2xl border border-border/50 bg-muted/20 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                    isSelected
                      ? "bg-foreground text-background font-black shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Reddit-Style Sub-Hubs List */}
          <div className="space-y-3 pt-1">
            {filteredCommunities.map((c) => {
              const isMember = c.members.some((m) => m.userId === profileId);
              const avatar = getAvatarUrl(c.avatarUrl, c.name);

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border/40 bg-card p-4 hover:border-border/80 transition-all space-y-3 group shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/app/communities/${c.id}`}
                      className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <Avatar className="size-12 rounded-2xl border border-border/50 shrink-0 ring-2 ring-border/20">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="text-xs font-black bg-muted">{c.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                            c/{c.name}
                          </h3>
                          {c.privacy === "PRIVATE" ? (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                              <Lock className="size-2.5" />
                              <span>Private</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md shrink-0">
                              <Globe className="size-2.5" />
                              <span>Public</span>
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {c.description || "Student-created campus community and discussion space."}
                        </p>
                      </div>
                    </Link>

                    {/* Join / Leave Button */}
                    <div className="shrink-0 pt-0.5">
                      <JoinCommunityButton communityId={c.id} initialIsMember={isMember} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-bold text-[11px]">
                        <Users className="size-3 text-primary" />
                        <span>{c.members.length} members</span>
                      </span>
                      {c.creator && (
                        <span className="text-[11px] text-muted-foreground/80 truncate">
                          Created by @{c.creator.username}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/app/communities/${c.id}`}
                      className="text-[11px] font-black text-primary hover:underline cursor-pointer"
                    >
                      Visit Hub →
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Empty State when search returns 0 */}
            {filteredCommunities.length === 0 && (
              <div className="py-16 text-center space-y-3 px-4 border border-dashed border-border/50 rounded-3xl bg-muted/10">
                <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <Users2 className="size-6 text-primary" />
                </div>
                <h3 className="text-sm font-black text-foreground">
                  No communities found {search ? `matching "${search}"` : `in ${selectedCategory}`}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Start your own student community, club, or branch sub-hub on CampusLoop!
                </p>
                <Link
                  href={`/app/communities/new${search ? `?name=${encodeURIComponent(search)}` : ""}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Create {search ? `c/${search}` : "New Community"}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: Community Feed (All Types of Posts across Communities) ─── */}
      {activeTab === "feed" && (
        <div className="divide-y divide-border/20 pt-1">
          {/* Loaded Infinite Feed Items */}
          {feedItems.map((item: any) => {
            if (item.itemType === "POST") {
              return <FeedCard key={item.id} post={item.data} currentUserId={profileId} />;
            }
            return null;
          })}

          {/* Initial Posts Instant Fallback */}
          {feedItems.length === 0 &&
            !isValidating &&
            initialPosts.length > 0 &&
            initialPosts.map((post) => <FeedCard key={post.id} post={post} currentUserId={profileId} />)}

          {/* Infinite Scroll Sentinel */}
          <div ref={setSentinelNode} className="py-6 flex justify-center items-center">
            {isValidating ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Loading community discussions...</span>
              </div>
            ) : isReachingFeedEnd && (feedItems.length > 0 || initialPosts.length > 0) ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-bold py-4">
                <CheckCheck className="size-4 text-primary" />
                <span>You're all caught up on community posts!</span>
              </div>
            ) : null}
          </div>

          {/* Empty Feed State */}
          {!isValidating && feedItems.length === 0 && initialPosts.length === 0 && (
            <div className="py-20 px-6 text-center max-w-sm mx-auto space-y-3">
              <div className="size-14 rounded-3xl bg-muted/50 border border-border/40 flex items-center justify-center mx-auto text-muted-foreground">
                <MessageSquare className="size-7 text-primary" />
              </div>
              <h3 className="text-base font-black text-foreground">No community posts yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Be the first classmate to post a discussion, question, or poll in a student community!
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("explore")}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Browse Sub-Hubs to Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: My Communities (Joined Hubs) ─── */}
      {activeTab === "my_communities" && (
        <div className="p-4 space-y-3">
          {myCommunities.length > 0 ? (
            myCommunities.map((c) => {
              const avatar = getAvatarUrl(c.avatarUrl, c.name);

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border/40 bg-card p-4 hover:border-border/80 transition-all flex items-center justify-between gap-3 group"
                >
                  <Link
                    href={`/app/communities/${c.id}`}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <Avatar className="size-11 rounded-2xl border border-border/50 shrink-0">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-xs font-black bg-muted">{c.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                          c/{c.name}
                        </h3>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-md">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.description || "Campus student sub-hub"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 font-semibold">
                        {c.members.length} members
                      </p>
                    </div>
                  </Link>

                  <div className="shrink-0">
                    <JoinCommunityButton communityId={c.id} initialIsMember={true} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center space-y-3 px-4 border border-dashed border-border/50 rounded-3xl bg-muted/10">
              <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                <Compass className="size-6 text-primary" />
              </div>
              <h3 className="text-sm font-black text-foreground">
                You haven't joined any student communities yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Discover coding clubs, music bands, gaming squads, and batch communities on campus.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("explore")}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Explore Sub-Hubs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
