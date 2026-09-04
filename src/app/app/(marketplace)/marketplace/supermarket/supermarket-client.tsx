"use client";

import { Check, ChevronRight, Clock, History, Minus, Percent, Plus, Search, ShieldCheck, ShoppingBag, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface SupermarketMarketplaceClientProps {
  profileId: string;
  collegeName?: string;
}

const MART_AISLES = [
  { id: "all", label: "All Items 🛒" },
  { id: "snacks", label: "Midnight Snacks 🍟" },
  { id: "beverages", label: "Cold Drinks & Dairy 🥛" },
  { id: "stationery", label: "Stationery & Exam ✍️" },
  { id: "toiletries", label: "Grooming & Soap 🧼" },
  { id: "dorm", label: "Hostel Essentials 🔌" },
] as const;

export function SupermarketMarketplaceClient({
  profileId,
  collegeName = "Campus Hub",
}: SupermarketMarketplaceClientProps) {
  const [selectedAisle, setSelectedAisle] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { items, addItem, updateQuantity, totalItemsCount, overallSubtotal } = useMarketplaceCart();

  // Fetch stores in the essentials / mart category
  const { data, isLoading } = useSWR<{ stores: any[] }>(
    `/api/marketplace/stores?category=essentials&q=${encodeURIComponent(searchQuery)}`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const stores = data?.stores || [];

  // Extract all catalog products across mart merchants
  const allProducts = stores.flatMap((s) =>
    (s.products || []).map((p: any) => ({
      ...p,
      merchantId: s.id,
      merchantName: s.name,
      deliveryFee: s.deliveryFee,
      estimatedPrepTime: s.estimatedPrepTime,
    }))
  );

  const filteredProducts = allProducts.filter((p) => {
    if (selectedAisle === "all") return true;
    const q = selectedAisle.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* ─── Flipkart/Blinkit Style Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Zap className="size-3.5 fill-yellow-300 text-yellow-300" />
            <span>15-Min Hostel Flash Delivery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Campus Supermarket &amp; Daily Mart
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            Exam notebooks, pens, midnight Maggi, chilled Amul Kool, laundry detergents &amp; personal care
            delivered to your door.
          </p>
        </div>

        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none">
          <ShoppingBag className="size-48" />
        </div>
      </div>

      {/* ─── Search & Order History Links ─── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notebooks, snacks, detergents, shampoo..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-card border border-border text-xs font-medium text-foreground outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <Link
          href="/app/marketplace/supermarket/orders"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="flex items-center gap-1.5 h-11 px-4 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 shadow-xs"
        >
          <History className="size-3.5" />
          <span>Mart Orders</span>
        </Link>
      </div>

      {/* ─── Department Aisles Pills ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {MART_AISLES.map((aisle) => {
          const isActive = selectedAisle === aisle.id;
          return (
            <button
              key={aisle.id}
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setSelectedAisle(aisle.id);
              }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border",
                isActive
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              )}
            >
              {aisle.label}
            </button>
          );
        })}
      </div>

      {/* ─── Supermarket Mart Stores Shelf ─── */}
      {stores.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
              Hostel Partner Marts ({stores.length})
            </h2>
            <span className="text-xs text-muted-foreground font-medium">Inside Campus Perimeter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stores.map((s) => (
              <Link
                key={s.id}
                href={`/app/marketplace/store/${s.id}`}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:border-amber-500/40 transition-all shadow-xs group"
              >
                <div className="size-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                  <img src={s.logoUrl || s.coverUrl} alt={s.name} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-black text-foreground truncate group-hover:text-amber-500 transition-colors">
                    {s.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">{s.address}</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-0.5">
                    ⚡ {s.estimatedPrepTime || "15 mins"} delivery
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Flipkart-Style Product Grid ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Daily Products &amp; Groceries ({filteredProducts.length})
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Instant Cart Add</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-2xl border border-border bg-card p-3 space-y-2">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              const inCartItem = items.find((ci) => ci.productId === p.id);
              const currentQty = inCartItem?.quantity || 0;

              const hasDiscount = p.originalPrice && p.originalPrice > p.price;
              const discountPercent = hasDiscount
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-border bg-card p-3 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-md transition-all group"
                >
                  {/* Product Image & Discount Tag */}
                  <div className="relative h-28 sm:h-32 w-full rounded-xl bg-muted/40 overflow-hidden flex items-center justify-center p-2 mb-2">
                    <img
                      src={
                        p.imageUrl ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop"
                      }
                      alt={p.name}
                      className="size-full object-contain group-hover:scale-105 transition-transform"
                    />
                    {hasDiscount && (
                      <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Meta */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                      {p.categoryName || "Essentials"}
                    </p>
                    <h3 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{p.name}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{p.merchantName}</p>
                  </div>

                  {/* Pricing and Add to Cart Stepper */}
                  <div className="flex items-center justify-between gap-1 pt-3 mt-auto">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-foreground">₹{p.price}</span>
                        {hasDiscount && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            ₹{p.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    {currentQty > 0 ? (
                      <div className="flex items-center rounded-xl border border-primary bg-primary/10 text-primary h-7 px-1">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                            updateQuantity(p.id, currentQty - 1);
                          }}
                          className="size-5 flex items-center justify-center hover:bg-primary/20 rounded-md transition-colors"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black">{currentQty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                            updateQuantity(p.id, currentQty + 1);
                          }}
                          className="size-5 flex items-center justify-center hover:bg-primary/20 rounded-md transition-colors"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          sounds.ting();
                          haptics.medium();
                          addItem({
                            productId: p.id,
                            merchantId: p.merchantId,
                            merchantName: p.merchantName,
                            merchantSlug: p.merchantSlug || p.merchantId,
                            productName: p.name,
                            price: p.price,
                            imageUrl: p.imageUrl,
                            deliveryFee: p.deliveryFee || 15,
                            quantity: 1,
                          });
                          toast.success(`Added ${p.name} to cart 🛒`);
                        }}
                        className="h-7 px-3 rounded-xl bg-foreground text-background hover:opacity-90 active:scale-95 text-xs font-black transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="size-3 stroke-3" />
                        <span>ADD</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
            <ShoppingBag className="size-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No supermarket products found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No mart items matching &quot;{searchQuery}&quot;. Check back as campus stores restock.
            </p>
          </div>
        )}
      </div>

      {/* ─── Sticky Cart Bottom Bar if Items in Cart ─── */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-4 right-4 max-w-lg mx-auto z-50">
          <Link
            href="/app/marketplace/checkout"
            onClick={() => {
              sounds.ting();
              haptics.medium();
            }}
            className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-foreground text-background shadow-xl hover:opacity-95 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">
                {totalItemsCount}
              </div>
              <div>
                <p className="text-xs font-black">₹{overallSubtotal}</p>
                <p className="text-[10px] opacity-80">Tap to place instant order</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black">
              <span>View Cart &amp; Pay</span>
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
