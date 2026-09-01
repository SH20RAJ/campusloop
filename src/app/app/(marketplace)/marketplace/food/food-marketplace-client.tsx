"use client";

import {
  ChevronRight,
  Clock,
  Flame,
  History,
  MapPin,
  Minus,
  Percent,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { InstagramIcon } from "@/components/ui/social-icons";
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
  const [productPage, setProductPage] = useState(1);

  const {
    items: cartItems,
    addItem,
    updateQuantity,
    totalItemsCount,
    overallSubtotal,
  } = useMarketplaceCart();

  // 1. Fetch Stores / Outlets
  const { data: storesData, isLoading: isStoresLoading } = useSWR<{ stores: any[] }>(
    `/api/marketplace/stores?category=food&q=${encodeURIComponent(searchQuery)}`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  // 2. Fetch Paginated Food Products
  const { data: productsData, isLoading: isProductsLoading } = useSWR<{
    products: any[];
    hasMore: boolean;
    page: number;
  }>(
    `/api/marketplace/products?category=food&isVeg=${pureVegOnly ? "true" : "false"}&q=${encodeURIComponent(
      searchQuery
    )}&page=${productPage}&limit=12`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const stores = storesData?.stores || [];
  const productsList = productsData?.products || [];
  const hasMoreProducts = productsData?.hasMore || false;

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (pureVegOnly) {
        const isVegStore =
          store.description?.toLowerCase().includes("pure veg") ||
          store.name?.toLowerCase().includes("veg") ||
          (store.products || []).every((p: any) => p.isVeg);
        if (!isVegStore) return false;
      }

      if (selectedTag === "all") return true;
      const q = selectedTag.toLowerCase();
      const combined =
        `${store.name} ${store.description} ${(store.products || []).map((p: any) => p.name).join(" ")}`.toLowerCase();
      return combined.includes(q);
    });
  }, [stores, pureVegOnly, selectedTag]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
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
            Hot momos, butter paneer rolls, and midnight cold coffee delivered in 15–20 mins inside{" "}
            {collegeName}.
          </p>
        </div>

        <div className="absolute right-3 -bottom-6 opacity-20 sm:opacity-30 pointer-events-none">
          <UtensilsCrossed className="size-48" />
        </div>
      </div>

      {/* ─── Arman's Night Canteen Live Announcement Banner ─── */}
      <div className="rounded-3xl border border-amber-500/35 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 p-4 sm:p-5 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>🔴 LIVE STARTING TODAY · NIGHT CANTEEN</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-1.5">
              <span>🌙 Arman&apos;s Night Canteen is Officially LIVE!</span>
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg font-medium">
              Sizzling Maggi, double egg chicken rolls, burgers, thick shakes &amp; combos delivered to your
              hostel room till 4 AM. Use code <span className="font-bold text-foreground">NIGHTOWL20</span>{" "}
              for 20% OFF!
            </p>
          </div>
          <Link
            href="/app/marketplace/store/merch_armans_night_canteen"
            onClick={() => {
              sounds.tap();
              haptics.success();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-foreground text-background text-xs font-black shadow-md hover:opacity-90 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Order from Arman&apos;s</span>
            <ChevronRight className="size-3.5" />
          </Link>
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

      {/* ─── 1. Campus Canteens & Outlets (Zomato-Style Cards) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Campus Canteens &amp; Outlets ({filteredStores.length})
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Delivered to Hostel Gates</span>
        </div>

        {isStoresLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
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
                      src={
                        store.coverUrl ||
                        store.logoUrl ||
                        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop"
                      }
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

                    {bestOffer && store.isOpen && (
                      <div className="absolute left-3 bottom-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black shadow-md">
                        <Percent className="size-3" />
                        <span>{bestOffer.title || "Special Campus Offer"}</span>
                      </div>
                    )}

                    <div className="absolute right-3 top-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-black shadow-md">
                      <span>{store.rating || "4.8"}</span>
                      <Star className="size-3 fill-white" />
                    </div>

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

                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium border-t border-border/40 pt-2.5">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{store.locationPin || store.address}</span>
                      </div>
                      <span className="shrink-0 font-bold text-foreground">
                        Min ₹{store.minOrderValue || 50}
                      </span>
                    </div>

                    {popularItems.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 overflow-hidden">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">
                          Popular:
                        </span>
                        <div className="flex items-center gap-1 truncate">
                          {popularItems.map((p: any) => (
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
          <div className="p-8 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-2">
            <UtensilsCrossed className="size-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No food spots found</h3>
            <p className="text-xs text-muted-foreground">
              No active canteens matching &quot;{searchQuery}&quot;.
            </p>
          </div>
        )}
      </div>

      {/* ─── 2. All Food Dishes & Quick Bites Grid (Optimized & Paginated) ─── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1 border-t border-border/30 pt-5">
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-4 text-amber-500" />
              <span>All Dishes &amp; Quick Bites</span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Order directly across all campus canteens &amp; outlets
            </p>
          </div>
          {productsList.length > 0 && (
            <span className="text-xs font-bold text-muted-foreground">
              Showing {productsList.length} items
            </span>
          )}
        </div>

        {isProductsLoading && productsList.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-2xl border border-border bg-card p-3 space-y-2">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : productsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {productsList.map((product) => {
              const inCart = cartItems.find((ci) => ci.productId === product.id);
              const qty = inCart ? inCart.quantity : 0;

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-border bg-card hover:border-rose-500/30 hover:shadow-md transition-all p-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Dish Image + Veg Badge */}
                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-muted">
                      <img
                        src={
                          product.imageUrl ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                        }
                        alt={product.name}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span
                          className={cn(
                            "size-4 rounded-xs border-2 flex items-center justify-center bg-card/90 shadow-xs",
                            product.isVeg ? "border-emerald-500" : "border-rose-500"
                          )}
                        >
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              product.isVeg ? "bg-emerald-500" : "bg-rose-500"
                            )}
                          />
                        </span>
                      </div>

                      {product.isPopular && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                          Bestseller
                        </div>
                      )}
                    </div>

                    {/* Dish Info */}
                    <div>
                      <h4 className="text-sm font-black text-foreground line-clamp-1 group-hover:text-rose-500 transition-colors">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Store Tag Badge */}
                    <Link
                      href={`/app/marketplace/store/${product.merchantId}`}
                      onClick={() => {
                        sounds.tap();
                        haptics.light();
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/80 hover:bg-muted text-[10px] font-bold text-foreground/80 hover:text-rose-500 transition-colors border border-border/50 truncate max-w-full"
                    >
                      <MapPin className="size-2.5 text-rose-500 shrink-0" />
                      <span className="truncate">{product.storeName}</span>
                    </Link>
                  </div>

                  {/* Price & Add to Cart Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-foreground">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[11px] text-muted-foreground line-through font-medium">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-1.5 bg-rose-500 text-white rounded-xl px-1.5 py-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                            updateQuantity(inCart!.id, -1);
                          }}
                          className="size-5 rounded-lg flex items-center justify-center hover:bg-white/20 active:scale-95 cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-black min-w-[14px] text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                            updateQuantity(inCart!.id, 1);
                          }}
                          className="size-5 rounded-lg flex items-center justify-center hover:bg-white/20 active:scale-95 cursor-pointer"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          haptics.light();
                          addItem({
                            productId: product.id,
                            merchantId: product.merchantId,
                            merchantName: product.storeName,
                            merchantSlug: product.storeSlug,
                            merchantLogo: product.storeLogo,
                            deliveryFee: 15,
                            productName: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            quantity: 1,
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white text-xs font-black transition-all cursor-pointer active:scale-95 shadow-2xs"
                      >
                        ADD +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-2">
            <p className="text-xs text-muted-foreground">No dishes matching your criteria.</p>
          </div>
        )}

        {/* Load More Pagination Button */}
        {hasMoreProducts && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setProductPage((prev) => prev + 1);
              }}
              className="px-6 py-2.5 rounded-2xl bg-card border border-border hover:bg-muted text-xs font-black text-foreground shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Load More Dishes 🍲
            </button>
          </div>
        )}
      </div>

      {/* ─── Campus Onboarding & Expansion Banner (Instagram Highlighted) ─── */}
      <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-wider">
              <span>🚀 Want this at your campus?</span>
            </div>
            <h4 className="text-sm font-black text-foreground">
              Bring CampusLoop Food Delivery to Your College
            </h4>
            <p className="text-[11px] text-muted-foreground max-w-md">
              We partner directly with campus canteens, night messes, and food trucks. Contact us on Instagram
              to onboard your campus food spots!
            </p>
          </div>
          <a
            href="https://www.instagram.com/campusloop.space/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-xs font-black shadow-md hover:opacity-95 transition-transform active:scale-95 shrink-0"
          >
            <InstagramIcon className="size-3.5" />
            <span>DM @campusloop.space</span>
          </a>
        </div>
      </div>

      {/* ─── Floating Cart Pill Bar ─── */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center">
          <Link
            href="/app/marketplace/checkout"
            className="pointer-events-auto flex items-center justify-between gap-4 w-full max-w-md px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-xl hover:shadow-2xl transition-all active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                {totalItemsCount}
              </div>
              <div>
                <p className="text-xs font-black">View Cart &amp; Checkout</p>
                <p className="text-[10px] text-white/80">Delivered to Hostel Gates</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-black">
              <span>₹{overallSubtotal}</span>
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
