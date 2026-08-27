"use client";

import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { AcademicCard } from "@/components/communities/academic-card";
import { CampusHubStrip,HubTabType } from "@/components/communities/campus-hub-strip";
import { GamingLobbyCard } from "@/components/communities/gaming-lobby-card";
import { HousingCard } from "@/components/communities/housing-card";
import { HubCreateModal } from "@/components/communities/hub-create-modal";
import { LostFoundCard } from "@/components/communities/lost-found-card";
import { MarketplaceCard } from "@/components/communities/marketplace-card";
import { RideshareCard } from "@/components/communities/rideshare-card";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedPost } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,getAvatarUrl } from "@/lib/utils";
import {
CheckCheck,
Compass,
Globe,
Loader2,
Lock,
Plus,
Search,
Users
} from "lucide-react";
import Link from "next/link";
import { useEffect,useMemo,useRef,useState } from "react";
import useSWRInfinite from "swr/infinite";

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

export function CommunitiesIndexClient({
  initialCommunities,
  initialPosts = [],
  profileId,
}: CommunitiesIndexClientProps) {
  const [activeTab, setActiveTab] = useState<HubTabType | "clubs">("all");
  const [search, setSearch] = useState("");
  const [showCreateHubModal, setShowCreateHubModal] = useState(false);
  const [hubToCreate, setHubToCreate] = useState<HubTabType>("lost_found");

  // Filter keys for useSWRInfinite
  const getKey = (pageIndex: number, previousPageData: FeedPageResponse | null) => {
    if (activeTab === "clubs") return null; // Don't fetch feed when browsing clubs
    if (previousPageData && !previousPageData.hasMore) return null; // Reached end
    const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor || "";
    return `/api/communities/feed?tab=${activeTab}&cursor=${encodeURIComponent(cursor)}&limit=10`;
  };

  const { data, size, setSize, isValidating, mutate } = useSWRInfinite<FeedPageResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    dedupingInterval: 6000,
  });

  // Extract all loaded items across pages
  const feedItems = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page?.items || []);
  }, [data]);

  const isEmpty = data?.[0]?.items?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.hasMore === false);
  const isLoadingMore =
    isValidating && data && typeof data[size - 1] === "undefined";

  // Infinite Scroll Sentinel Intersection Observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === "clubs" || isReachingEnd || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isValidating) {
          setSize((prev) => prev + 1);
        }
      },
      { rootMargin: "400px" }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [activeTab, isReachingEnd, isValidating, setSize]);

  // Joined Communities for Clubs tab
  const joinedCommunities = useMemo(() => {
    return initialCommunities.filter((c) =>
      c.members.some((m) => m.userId === profileId)
    );
  }, [initialCommunities, profileId]);

  // Filtered communities list for clubs tab
  const filteredCommunities = useMemo(() => {
    return initialCommunities.filter((c) => {
      if (c.privacy === "UNLISTED" && !c.members.some((m) => m.userId === profileId)) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesDesc = (c.description || "").toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [initialCommunities, profileId, search]);

  function handleTabChange(tab: HubTabType | "clubs") {
    sounds.tap();
    haptics.light();
    setActiveTab(tab);
  }

  function handleOpenCreateModal(tab: HubTabType) {
    sounds.tap();
    haptics.light();
    setHubToCreate(tab);
    setShowCreateHubModal(true);
  }

  function handleItemCreated(newItem: any) {
    mutate();
  }

  const tabs: { id: HubTabType | "clubs"; label: string }[] = [
    { id: "all", label: "All Activity" },
    { id: "lost_found", label: "Lost & Found" },
    { id: "marketplace", label: "Buy & Sell" },
    { id: "gaming", label: "Gaming Arena" },
    { id: "rideshare", label: "Ride Share" },
    { id: "housing", label: "Housing & Flats" },
    { id: "academics", label: "Notes & PYQs" },
    { id: "discussions", label: "Club Discussions" },
    { id: "clubs", label: "Browse Student Clubs" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24 border-x border-border/20">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="space-y-0.5">
            <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-1.5">
              <span>Campus Hub & Communities</span>
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              Lost & Found, Buy/Sell, Gaming, Rides, Housing & Clubs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenCreateModal(activeTab === "clubs" ? "lost_found" : activeTab)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Post in Hub</span>
            </button>
            <Link
              href="/app/communities/new"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Users className="size-3.5 text-primary" />
              <span className="hidden sm:inline">New Club</span>
            </Link>
          </div>
        </div>

        {/* ─── Filter Pills Bar ─── */}
        <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                  isActive
                    ? "bg-foreground text-background font-black shadow-xs"
                    : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/40"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Top 6 Campus Hubs Strip (Shown on All & Hub views) ─── */}
      {activeTab !== "clubs" && (
        <CampusHubStrip
          activeTab={activeTab as HubTabType}
          onSelectTab={(tab) => handleTabChange(tab)}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}

      {/* ─── Mode A: Infinite Scroll Feed (All, Lost&Found, Marketplace, Gaming, etc.) ─── */}
      {activeTab !== "clubs" && (
        <div className="divide-y divide-border/20 pt-2">
          {feedItems.map((item: any) => {
            switch (item.itemType) {
              case "POST":
                return (
                  <FeedCard
                    key={item.id}
                    post={item.data}
                    currentUserId={profileId}
                  />
                );
              case "LOST_FOUND":
                return (
                  <LostFoundCard
                    key={item.id}
                    item={item.data}
                    currentUserId={profileId}
                  />
                );
              case "MARKETPLACE":
                return (
                  <MarketplaceCard
                    key={item.id}
                    item={item.data}
                    currentUserId={profileId}
                  />
                );
              case "GAMING":
                return (
                  <GamingLobbyCard
                    key={item.id}
                    item={item.data}
                    currentUserId={profileId}
                  />
                );
              case "RIDESHARE":
                return (
                  <RideshareCard
                    key={item.id}
                    item={item.data}
                    currentUserId={profileId}
                  />
                );
              case "HOUSING":
                return (
                  <HousingCard
                    key={item.id}
                    item={item.data}
                    currentUserId={profileId}
                  />
                );
              case "ACADEMICS":
                return (
                  <AcademicCard
                    key={item.id}
                    item={item.data}
                    currentUserId={profileId}
                  />
                );
              default:
                return null;
            }
          })}

          {/* Fallback initial posts if SWR hasn't loaded yet */}
          {feedItems.length === 0 && !isValidating && initialPosts.length > 0 && activeTab === "all" && (
            initialPosts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={profileId} />
            ))
          )}

          {/* Loading Skeleton / Sentinel */}
          <div ref={sentinelRef} className="py-6 flex justify-center items-center">
            {isValidating ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Loading more campus content...</span>
              </div>
            ) : isReachingEnd && feedItems.length > 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-bold py-4">
                <CheckCheck className="size-4 text-primary" />
                <span>You're all caught up on this campus hub!</span>
              </div>
            ) : null}
          </div>

          {/* Empty State */}
          {!isValidating && feedItems.length === 0 && (
            <div className="py-20 px-6 text-center max-w-sm mx-auto space-y-3">
              <div className="size-14 rounded-3xl bg-muted/50 border border-border/40 flex items-center justify-center mx-auto text-muted-foreground">
                <Compass className="size-7 text-primary" />
              </div>
              <h3 className="text-base font-black text-foreground">
                No active listings yet
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Be the first verified classmate to post in this campus hub or request items!
              </p>
              <button
                type="button"
                onClick={() => handleOpenCreateModal(activeTab === "all" ? "lost_found" : activeTab as HubTabType)}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                + Drop a Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Mode B: Student Interest Clubs & Communities Directory ─── */}
      {activeTab === "clubs" && (
        <div className="p-4 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student clubs, tech societies, anime & music groups..."
              className="w-full rounded-2xl border border-border/60 bg-muted/20 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {filteredCommunities.map((c) => {
              const isMember = c.members.some((m) => m.userId === profileId);
              const avatar = getAvatarUrl(c.avatarUrl, c.name);

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border/40 bg-card p-4 space-y-3 hover:border-border/80 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-11 rounded-2xl border border-border/50 shrink-0">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-xs font-black bg-muted">
                        {c.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/app/communities/${c.id}`}
                          className="text-xs font-black text-foreground hover:underline truncate"
                        >
                          {c.name}
                        </Link>
                        {c.privacy === "PRIVATE" ? (
                          <Lock className="size-3 text-amber-500 shrink-0" />
                        ) : (
                          <Globe className="size-3 text-muted-foreground/60 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {c.description || "Campus student community"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs">
                    <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <Users className="size-3" />
                      <span>{c.members.length} members</span>
                    </span>
                    <JoinCommunityButton
                      communityId={c.id}
                      initialIsMember={isMember}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Hub Create Modal ─── */}
      <HubCreateModal
        isOpen={showCreateHubModal}
        onClose={() => setShowCreateHubModal(false)}
        defaultHub={hubToCreate}
        onItemCreated={handleItemCreated}
      />
    </div>
  );
}
