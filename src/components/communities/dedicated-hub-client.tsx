"use client";

import { AcademicCard } from "@/components/communities/academic-card";
import { GamingLobbyCard } from "@/components/communities/gaming-lobby-card";
import { HousingCard } from "@/components/communities/housing-card";
import { LostFoundCard } from "@/components/communities/lost-found-card";
import { MarketplaceCard } from "@/components/communities/marketplace-card";
import { RideshareCard } from "@/components/communities/rideshare-card";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
BookOpen,
Car,
CheckCheck,
Compass,
Gamepad2,
Home,
Loader2,
PackageSearch,
Plus,
Search,
ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useEffect,useMemo,useRef,useState } from "react";
import useSWRInfinite from "swr/infinite";

export type DedicatedHubType =
  | "lost_found"
  | "marketplace"
  | "gaming"
  | "rideshare"
  | "housing"
  | "academics";

interface DedicatedHubClientProps {
  hubType: DedicatedHubType;
  profileId: string;
}

interface FeedPageResponse {
  items: any[];
  nextCursor: string | null;
  hasMore: boolean;
}

const HUB_META: Record<
  DedicatedHubType,
  {
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    actionLabel: string;
    createHref: string;
    badgeColor: string;
    gradient: string;
  }
> = {
  lost_found: {
    title: "Lost & Found Hub",
    subtitle: "Campus Lost & Reclaimed Items",
    description:
      "Report lost student IDs, keys, earphones, lab coats, and reclaim found items safely on campus.",
    icon: PackageSearch,
    actionLabel: "+ Report Item",
    createHref: "/app/lost-and-found/new",
    badgeColor: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    gradient: "from-rose-500/15 via-rose-500/5 to-transparent",
  },
  marketplace: {
    title: "Buy & Sell Hub",
    subtitle: "Verified Campus Marketplace",
    description:
      "Buy and sell second-hand bicycles, coolers, mattresses, textbooks, drafters, and calculators with batchmates.",
    icon: ShoppingBag,
    actionLabel: "+ Sell Item",
    createHref: "/app/buy-and-sell/new",
    badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
  },
  gaming: {
    title: "Gaming Arena",
    subtitle: "Campus Esports & Lobbies",
    description:
      "Find teammates, recruit for college tournaments, and play Valorant, BGMI, Chess, and EA FC scrimmage matches.",
    icon: Gamepad2,
    actionLabel: "+ Create Lobby",
    createHref: "/app/gaming/new",
    badgeColor: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
  },
  rideshare: {
    title: "Ride Share Hub",
    subtitle: "Station & Airport Cab Pool",
    description:
      "Split airport, railway station, and weekend city cab fares with verified students to save money.",
    icon: Car,
    actionLabel: "+ Offer / Request Ride",
    createHref: "/app/rideshare/new",
    badgeColor: "bg-sky-500/15 text-sky-500 border-sky-500/30",
    gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
  },
  housing: {
    title: "Housing & Flats Hub",
    subtitle: "PGs, Rooms & Flatmates",
    description:
      "Discover verified PGs, apartments, shared flats, and find student roommates near your college campus.",
    icon: Home,
    actionLabel: "+ List Room / PG",
    createHref: "/app/housing/new",
    badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
  },
  academics: {
    title: "Notes & PYQs Hub",
    subtitle: "Semester Papers & Cheat Sheets",
    description:
      "Previous year exam question papers, verified professor notes, formula cheat sheets, and placement drives.",
    icon: BookOpen,
    actionLabel: "+ Upload Resource",
    createHref: "/app/hub/new?type=academics",
    badgeColor: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
    gradient: "from-indigo-500/15 via-indigo-500/5 to-transparent",
  },
};

export function DedicatedHubClient({ hubType, profileId }: DedicatedHubClientProps) {
  const meta = HUB_META[hubType];
  const Icon = meta.icon;

  const [search, setSearch] = useState("");

  const getKey = (pageIndex: number, previousPageData: FeedPageResponse | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor || "";
    return `/api/communities/feed?tab=${hubType}&cursor=${encodeURIComponent(cursor)}&limit=10`;
  };

  const { data, size, setSize, isValidating, mutate } = useSWRInfinite<FeedPageResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      dedupingInterval: 6000,
    }
  );

  const feedItems = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page?.items || []);
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return feedItems;
    const q = search.toLowerCase();
    return feedItems.filter((item) => {
      const d = item.data;
      const titleMatch = (d.title || d.gameName || d.destination || "").toLowerCase().includes(q);
      const descMatch = (d.description || d.location || d.hostelLocation || "").toLowerCase().includes(q);
      return titleMatch || descMatch;
    });
  }, [feedItems, search]);

  const isEmpty = data?.[0]?.items?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.hasMore === false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isReachingEnd || isValidating) return;

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
  }, [isReachingEnd, isValidating, setSize]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24 border-x border-border/20 bg-background text-foreground select-none">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app/communities"
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back to communities"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn("size-6 rounded-lg flex items-center justify-center border", meta.badgeColor)}>
                <Icon className="size-3.5" />
              </div>
              <h1 className="text-base font-black tracking-tight text-foreground truncate">
                {meta.title}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
          </div>
        </div>

        <Link
          href={meta.createHref}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="size-3.5" />
          <span>{meta.actionLabel}</span>
        </Link>
      </header>

      {/* ─── Hero Banner Card ─── */}
      <div className="px-4 py-4 border-b border-border/20 bg-muted/10 relative overflow-hidden">
        <div className={cn("absolute inset-0 bg-linear-to-r pointer-events-none", meta.gradient)} />
        <div className="relative z-10 space-y-2">
          <p className="text-xs text-foreground/90 leading-relaxed font-medium">
            {meta.description}
          </p>

          {/* Quick Search */}
          <div className="relative w-full pt-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${meta.title.toLowerCase()}...`}
              className="w-full h-9 pl-9 pr-4 rounded-full border border-border/50 bg-background text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* ─── Feed of Listings ─── */}
      <div className="divide-y divide-border/20 pt-1">
        {filteredItems.map((item: any) => {
          switch (item.itemType) {
            case "LOST_FOUND":
              return <LostFoundCard key={item.id} item={item.data} currentUserId={profileId} />;
            case "MARKETPLACE":
              return <MarketplaceCard key={item.id} item={item.data} currentUserId={profileId} />;
            case "GAMING":
              return <GamingLobbyCard key={item.id} item={item.data} currentUserId={profileId} />;
            case "RIDESHARE":
              return <RideshareCard key={item.id} item={item.data} currentUserId={profileId} />;
            case "HOUSING":
              return <HousingCard key={item.id} item={item.data} currentUserId={profileId} />;
            case "ACADEMICS":
              return <AcademicCard key={item.id} item={item.data} currentUserId={profileId} />;
            default:
              return null;
          }
        })}

        {/* Loading Sentinel */}
        <div ref={sentinelRef} className="py-6 flex justify-center items-center">
          {isValidating ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Loading more items...</span>
            </div>
          ) : isReachingEnd && filteredItems.length > 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-bold py-4">
              <CheckCheck className="size-4 text-primary" />
              <span>You're all caught up!</span>
            </div>
          ) : null}
        </div>

        {/* Empty State */}
        {!isValidating && filteredItems.length === 0 && (
          <div className="py-20 px-6 text-center max-w-sm mx-auto space-y-3">
            <div className="size-14 rounded-3xl bg-muted/50 border border-border/40 flex items-center justify-center mx-auto text-muted-foreground">
              <Compass className="size-7 text-primary" />
            </div>
            <h3 className="text-base font-black text-foreground">No active listings found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {search.trim()
                ? `No items match "${search}". Try searching with different keywords.`
                : "Be the first verified student to post or share in this campus hub!"}
            </p>
            <Link
              href={meta.createHref}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {meta.actionLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
