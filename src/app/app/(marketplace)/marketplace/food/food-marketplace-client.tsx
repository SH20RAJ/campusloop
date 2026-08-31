"use client";

import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Flame,
  History,
  MapPin,
  Percent,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface FoodMarketplaceClientProps {
  profileId: string;
  collegeName?: string;
}

const FOOD_TAGS = [
  { id: "all", label: "All Spots", icon: UtensilsCrossed },
  { id: "veg", label: "Pure Veg 🥦" },
  { id: "momos", label: "Momos & Rolls 🥟" },
  { id: "thali", label: "Thali & Meals 🍛" },
  { id: "night", label: "Late Night 🌙" },
  { id: "snacks", label: "Maggi & Chai ☕" },
  { id: "desserts", label: "Beverages & Shakes 🥤" },
] as const;

export function FoodMarketplaceClient({ profileId, collegeName = "Campus Hub" }: FoodMarketplaceClientProps) {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pureVegOnly, setPureVegOnly] = useState(false);

  const { totalItemsCount, overallSubtotal } = useMarketplaceCart();

  const { data, isLoading } = useSWR<{ stores: any[] }>(
    `/api/marketplace/stores?category=food&q=${encodeURIComponent(searchQuery)}`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const stores = data?.stores || [];

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (pureVegOnly) {
        // Must have veg items or pure veg in description
        const isVegStore =
          store.description?.toLowerCase().includes("pure veg") ||
          store.name?.toLowerCase().includes("veg") ||
          (store.products || []).every((p: any) => p.isVeg);
        if (!isVegStore) return false;
      }

      if (selectedTag === "all") return true;
      const q = selectedTag.toLowerCase();
      const combined = `${store.name} ${store.description} ${(store.products || []).map((p: any) => p.name).join(" ")}`.toLowerCase();
      return combined.includes(q);
    });
  }, [stores, pureVegOnly, selectedTag]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16">
      {/* ─── Zomato-Style Header Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Flame className="size-3.5 fill-white" />
            <span>Hostel Express Delivery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Craving Night Mess or Canteen Chow?
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            Hot momos, butter paneer rolls, and midnight cold coffee delivered in 15–20 mins inside {collegeName}.
          </p>
        </div>

        <div className="absolute right-3 -bottom-6 opacity-20 sm:opacity-30 pointer-events-none">
          <UtensilsCrossed className="size-48" />
        </div>
      </div>

      {/* ─── Search & Pure Veg Toggle ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search momos, burgers, rolls, or canteens..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-card border border-border text-xs font-medium text-foreground outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.tap();
            haptics.light();
            setPureVegOnly((prev) => !prev);
          }}
          className={cn(
            "flex items-center justify-center gap-2 h-11 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0",
            pureVegOnly
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "bg-card border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "size-3 rounded-xs border-2 flex items-center justify-center",
              pureVegOnly ? "border-emerald-500" : "border-muted-foreground"
            )}
          >
            <div className={cn("size-1.5 rounded-full", pureVegOnly ? "bg-emerald-500" : "bg-transparent")} />
          </div>
          <span>Pure Veg</span>
        </button>

        <Link
          href="/app/marketplace/food/orders"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="flex items-center justify-center gap-2 h-11 px-4 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 shadow-xs"
        >
          <History className="size-3.5" />
          <span>Food Orders</span>
        </Link>
      </div>

      {/* ─── Tag Filter Pills ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {FOOD_TAGS.map((tag) => {
          const isActive = selectedTag === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setSelectedTag(tag.id);
              }}
              className={cn(
                "px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border",
                isActive
                  ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              )}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* ─── Restaurants Grid (Zomato-Style Cards) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Campus Canteens &amp; Outlets ({filteredStores.length})
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Delivered to Hostel Gates</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-3xl border border-border bg-card p-3 space-y-3">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredStores.map((store) => {
              const bestOffer = (store.offers || [])[0];
              const popularItems = (store.products || []).slice(0, 3);

              return (
                <Link
                  key={store.id}
                  href={`/app/marketplace/store/${store.id}`}
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                  }}
                  className="group block rounded-3xl border border-border bg-card hover:border-rose-500/40 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Store Cover Image with Badges */}
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    <img
                      src={store.coverUrl || store.logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop"}
                      alt={store.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {!store.isOpen && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider">
                          Closed Right Now
                        </span>
                      </div>
                    )}

                    {/* Deal Badge Overlay */}
                    {bestOffer && store.isOpen && (
                      <div className="absolute left-3 bottom-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black shadow-md">
                        <Percent className="size-3" />
                        <span>{bestOffer.title || "Special Campus Offer"}</span>
                      </div>
                    )}

                    {/* Rating Pill */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-black shadow-md">
                      <span>{store.rating || "4.5"}</span>
                      <Star className="size-3 fill-white" />
                    </div>

                    {/* Delivery Time Badge */}
                    <div className="absolute right-3 bottom-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                      <Clock className="size-3 text-rose-400" />
                      <span>{store.estimatedPrepTime || "15–20 min"}</span>
                    </div>
                  </div>

                  {/* Store Meta Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-black text-foreground group-hover:text-rose-500 transition-colors flex items-center gap-1.5">
                          <span>{store.name}</span>
                          <ShieldCheck className="size-3.5 text-rose-500 shrink-0" />
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {store.description || store.address}
                        </p>
                      </div>
                    </div>

                    {/* Location Pin & Pricing info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium border-t border-border/40 pt-2.5">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{store.locationPin || store.address}</span>
                      </div>
                      <span className="shrink-0 font-bold text-foreground">
                        Min ₹{store.minOrderValue || 50}
                      </span>
                    </div>

                    {/* Popular Dishes Preview */}
                    {popularItems.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 overflow-hidden">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">Popular:</span>
                        <div className="flex items-center gap-1 truncate">
                          {popularItems.map((p: any, idx: number) => (
                            <span
                              key={p.id}
                              className="text-[11px] font-semibold text-foreground/80 bg-muted/60 px-2 py-0.5 rounded-md truncate"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
            <UtensilsCrossed className="size-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No food spots found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn&apos;t find any active canteens matching &quot;{searchQuery}&quot;. Try clearing filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
