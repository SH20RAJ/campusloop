"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  Bike,
  Car,
  ChevronRight,
  Clock,
  Flame,
  Loader2,
  MapPin,
  Percent,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Ticket,
  Truck,
  UtensilsCrossed,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";

interface MarketplaceClientProps {
  profileId: string;
  collegeName?: string;
}

const CATEGORIES = [
  { id: "all", label: "All Stores", icon: Store, color: "bg-foreground text-background" },
  { id: "food", label: "Food & Canteens", icon: UtensilsCrossed, color: "bg-orange-500/10 text-orange-500 border-orange-500/30" },
  { id: "essentials", label: "Essentials & Grocery", icon: ShoppingBag, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  { id: "services", label: "Laundry & Services", icon: Wrench, color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  { id: "rentals", label: "Vehicle Rentals", icon: Car, color: "bg-purple-500/10 text-purple-500 border-purple-500/30" },
  { id: "activities", label: "Activities & Outings", icon: Ticket, color: "bg-pink-500/10 text-pink-500 border-pink-500/30" },
  { id: "deals", label: "Student Deals", icon: Tag, color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
] as const;

export function MarketplaceClient({ profileId, collegeName = "Campus Hub" }: MarketplaceClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { totalItemsCount, overallSubtotal } = useMarketplaceCart();

  const { data, isLoading } = useSWR<{ stores: any[] }>(
    `/api/marketplace/stores?category=${selectedCategory}&q=${encodeURIComponent(searchQuery)}`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const stores = data?.stores || [];

  // Filter deals
  const deals = useMemo(() => {
    return stores.flatMap((s) =>
      (s.offers || []).map((o: any) => ({
        ...o,
        storeName: s.name,
        storeId: s.id,
        storeLogo: s.logoUrl,
      }))
    );
  }, [stores]);

  function handleCategorySelect(catId: string) {
    sounds.tap();
    haptics.light();
    setSelectedCategory(catId);
  }

  const { data: bikesData } = useSWR<{ bikes: any[] }>(
    selectedCategory === "rentals" ? "/api/marketplace/rentals/bikes" : null,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const rentalBikes = bikesData?.bikes || [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── Top Header & Omnibar Search ─── */}
      <header className="sticky top-0 z-40 flex flex-col gap-2.5 border-b border-border/30 bg-background/85 px-4 pt-3 pb-2 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-foreground tracking-tight">
              Campus<span className="text-emerald-500">Market</span>
            </h1>
            <span className="text-xs text-muted-foreground font-medium">· {collegeName}</span>
          </div>

          <Link
            href="/app/marketplace/orders"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            <ShoppingBag className="size-3.5" />
            <span>My Orders</span>
          </Link>
        </div>

        {/* Omnibar Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search canteens, momos, bike rentals, and services...`}
            className="w-full h-10 rounded-2xl bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background pl-10 pr-9 text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Category Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
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
      </header>

      {/* ─── Featured Student Deals Banner Strip ─── */}
      {deals.length > 0 && selectedCategory === "all" && !searchQuery && (
        <section className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Percent className="size-3.5 text-emerald-500" />
              <span>Exclusive Student Deals</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {deals.map((deal: any) => (
              <Link
                key={deal.id}
                href={`/app/marketplace/store/${deal.storeId}`}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500/40 shrink-0 w-72 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="size-11 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/40">
                  <img src={deal.storeLogo} alt={deal.storeName} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                    {deal.code ? `CODE: ${deal.code}` : "Special Offer"}
                  </span>
                  <h3 className="text-xs font-bold text-foreground truncate group-hover:underline">
                    {deal.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {deal.storeName} · {deal.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── BIKE RENTALS SPECIAL FLEET SECTION (PRD Item 1) ─── */}
      {selectedCategory === "rentals" && rentalBikes.length > 0 && (
        <section className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Bike className="size-4 text-emerald-500" />
              <span>Campus Bike &amp; Scooter Fleet ({rentalBikes.length})</span>
            </h2>
            <span className="text-[11px] text-muted-foreground font-bold">
              Instant Pickup
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {rentalBikes.map((b) => (
              <Link
                key={b.id}
                href={`/app/marketplace/rentals/bikes/${b.id}`}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="group flex flex-col sm:flex-row gap-3.5 p-3.5 rounded-2xl border border-border/40 hover:border-border bg-card hover:bg-muted/[0.04] transition-all cursor-pointer shadow-xs"
              >
                <div className="relative h-36 sm:size-32 rounded-xl overflow-hidden border border-border/30 shrink-0 bg-muted">
                  <img
                    src={b.imageUrl}
                    alt={b.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>{b.rating}</span>
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider">
                    {b.status}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-foreground group-hover:underline flex items-center gap-1.5 truncate">
                        <span>{b.name}</span>
                        <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-rose-500 shrink-0" />
                      <span>{b.pickupLocation} · {b.merchant?.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/30">
                    <div>
                      <p className="text-sm font-black text-foreground">
                        ₹{b.dailyPrice} <span className="text-[10px] font-normal text-muted-foreground">/ day</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        ₹{b.securityDeposit} deposit (refundable)
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Nearby Campus Businesses ─── */}
      <section className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            {selectedCategory === "all" ? "Nearby Campus Businesses" : `${selectedCategory.toUpperCase()} STORES`}
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {stores.length} verified {stores.length === 1 ? "store" : "stores"}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/app/marketplace/store/${store.id}`}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="group flex flex-col sm:flex-row gap-3.5 p-3.5 rounded-2xl border border-border/40 hover:border-border bg-card hover:bg-muted/[0.04] transition-all cursor-pointer shadow-xs"
              >
                {/* Store Cover / Logo */}
                <div className="relative h-32 sm:size-28 rounded-xl overflow-hidden border border-border/30 shrink-0 bg-muted">
                  <img
                    src={store.coverUrl || store.logoUrl}
                    alt={store.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!store.isOpen && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                      Currently Closed
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>{store.rating}</span>
                  </span>
                </div>

                {/* Store Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-foreground group-hover:underline flex items-center gap-1.5">
                        <span>{store.name}</span>
                        <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {store.description}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Meta Info */}
                  <div className="flex items-center flex-wrap gap-2 text-[11px] text-muted-foreground pt-1">
                    {store.locationPin && (
                      <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                        <MapPin className="size-3 text-rose-500" />
                        <span>{store.locationPin}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                      <Clock className="size-3 text-primary" />
                      <span>{store.estimatedPrepTime}</span>
                    </span>

                    {store.isDeliveryEnabled && (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <Truck className="size-3" />
                        <span>Delivery (₹{store.deliveryFee})</span>
                      </span>
                    )}

                    {store.isPickupEnabled && (
                      <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-md">
                        Pickup Available
                      </span>
                    )}
                  </div>

                  {/* Active Offer Tag if any */}
                  {store.offers && store.offers.length > 0 && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Flame className="size-3" />
                        <span>{store.offers[0].title}</span>
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center border border-border/40 text-muted-foreground">
              <Store className="size-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No stores found</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                {searchQuery
                  ? `No stores matching "${searchQuery}". Try different keywords.`
                  : "No businesses listed under this category yet."}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ─── Sticky Cart Bottom Bar (if items in cart) ─── */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-0 right-0 z-40 max-w-lg mx-auto px-4 animate-in slide-in-from-bottom-3 duration-200">
          <Link
            href="/app/marketplace/cart"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-foreground text-background font-black text-xs shadow-2xl hover:opacity-95 active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-background text-foreground text-[10px] font-black">
                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
              </span>
              <span>₹{overallSubtotal.toLocaleString("en-IN")} Subtotal</span>
            </div>
            <div className="flex items-center gap-1">
              <span>View Cart</span>
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>
      )}
    </main>
  );
}
