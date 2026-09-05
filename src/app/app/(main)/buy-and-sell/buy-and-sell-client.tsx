"use client";

import {
  ArrowLeft,
  Bike,
  BookOpen,
  CheckCircle2,
  Compass,
  Home,
  Laptop,
  Loader2,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Wind,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { MarketplaceCard } from "@/components/communities/marketplace-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface BuyAndSellClientProps {
  profileId: string;
}

interface FeedPageResponse {
  items: any[];
  nextCursor: string | null;
  hasMore: boolean;
}

const CATEGORIES = [
  { id: "all", label: "All Items", icon: ShoppingBag },
  { id: "Cycles", label: "Cycles & Bikes", icon: Bike },
  { id: "Textbooks", label: "Textbooks & Notes", icon: BookOpen },
  { id: "Coolers", label: "Coolers & Fans", icon: Wind },
  { id: "Electronics", label: "Electronics", icon: Laptop },
  { id: "Lab Coats", label: "Drafters & Tools", icon: Compass },
  { id: "Furniture", label: "Mattresses & Furniture", icon: Home },
  { id: "Other", label: "Other Essentials", icon: Tag },
] as const;

const PRICE_FILTERS = [
  { id: "all", label: "All Prices" },
  { id: "under_500", label: "Under ₹500" },
  { id: "500_2000", label: "₹500 - ₹2,000" },
  { id: "above_2000", label: "₹2,000+" },
] as const;

export function BuyAndSellClient({ profileId }: BuyAndSellClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>("all");
  const [hideSold, setHideSold] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedIds, setDeletedIds] = useState<Record<string, boolean>>({});

  const getKey = (pageIndex: number, previousPageData: FeedPageResponse | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor || "";
    return `/api/communities/feed?tab=buy-and-sell&cursor=${encodeURIComponent(cursor)}&limit=15`;
  };

  const { data, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<FeedPageResponse>(
    getKey,
    fetcher,
    {
      dedupingInterval: 15000,
    }
  );

  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);

  // Flatten all feed items
  const allItems = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page.items || []);
  }, [data]);

  // Extract marketplace item records
  const marketplaceListings = useMemo(() => {
    return allItems
      .filter((item) => item.itemType === "MARKETPLACE" && item.data)
      .map((item) => item.data)
      .filter((item) => !deletedIds[item.id]);
  }, [allItems, deletedIds]);

  // Filter listings based on category, price range, search query, and sold state
  const filteredListings = useMemo(() => {
    return marketplaceListings.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Hide sold filter
      if (hideSold && item.isSold) {
        return false;
      }

      // Price filter
      if (selectedPriceFilter === "under_500" && item.price >= 500) {
        return false;
      }
      if (selectedPriceFilter === "500_2000" && (item.price < 500 || item.price > 2000)) {
        return false;
      }
      if (selectedPriceFilter === "above_2000" && item.price < 2000) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesLocation = item.hostelLocation?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesSeller =
          item.seller?.displayName?.toLowerCase().includes(q) ||
          item.seller?.username?.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesCategory && !matchesSeller) {
          return false;
        }
      }

      return true;
    });
  }, [marketplaceListings, selectedCategory, selectedPriceFilter, hideSold, searchQuery]);

  const hasMore = Boolean(data?.[data.length - 1]?.hasMore);
  const isLoadingMore = Boolean(
    isLoading || (isValidating && size > 1) || (size > 0 && data && typeof data[size - 1] === "undefined")
  );

  // Infinite Scroll Trigger
  useEffect(() => {
    if (!loadMoreNode || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(loadMoreNode);
    return () => observer.disconnect();
  }, [loadMoreNode, hasMore, isLoadingMore, setSize]);

  function handleCategoryChange(catId: string) {
    sounds.tap();
    haptics.light();
    setSelectedCategory(catId);
  }

  function handlePriceFilterChange(filterId: string) {
    sounds.tap();
    haptics.light();
    setSelectedPriceFilter(filterId);
  }

  function handleItemDeleted(itemId: string) {
    setDeletedIds((prev) => ({ ...prev, [itemId]: true }));
    mutate();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 pt-3 pb-2 backdrop-blur-xl border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                router.back();
              }}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="size-4.5" />
            </button>
            <div>
              <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5 leading-none">
                <span>Buy & Sell Hub</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  Verified
                </span>
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Peer-to-peer campus marketplace & hostel trades
              </p>
            </div>
          </div>

          <Link
            href="/app/buy-and-sell/new"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="size-3.5 stroke-3" />
            <span>Sell Item</span>
          </Link>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bicycles, coolers, mattresses, drafters, calculators..."
            className="w-full h-9 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background pl-9 pr-8 text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95",
                  isSelected
                    ? "bg-foreground text-background font-black shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40"
                )}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row: Price and Available Only */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/20 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {PRICE_FILTERS.map((pf) => (
              <button
                key={pf.id}
                type="button"
                onClick={() => handlePriceFilterChange(pf.id)}
                className={cn(
                  "px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer",
                  selectedPriceFilter === pf.id
                    ? "bg-foreground/10 text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {pf.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setHideSold(!hideSold);
            }}
            className={cn(
              "flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer shrink-0",
              hideSold
                ? "bg-emerald-500/15 text-emerald-500 font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CheckCircle2 className="size-3" />
            <span>Available only</span>
          </button>
        </div>
      </header>

      {/* ─── Listings Feed Body ─── */}
      <div className="divide-y divide-border/20">
        {isLoading && marketplaceListings.length === 0 ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : filteredListings.length > 0 ? (
          filteredListings.map((item) => (
            <MarketplaceCard
              key={item.id}
              item={item}
              currentUserId={profileId}
              onDeleted={handleItemDeleted}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4 space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center border border-border/40 text-muted-foreground">
              <ShoppingBag className="size-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No listings found</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                {searchQuery
                  ? `No results matching "${searchQuery}". Try different keywords.`
                  : "No items listed in this category yet. Be the first student to sell!"}
              </p>
            </div>
            <Link
              href="/app/buy-and-sell/new"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5 stroke-3" />
              <span>List First Item</span>
            </Link>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={setLoadMoreNode} className="py-6 text-center">
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
