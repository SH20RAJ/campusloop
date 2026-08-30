"use client";

import {
  Car,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Ticket,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  EmptyState,
  FilterPills,
  ListRow,
  PageHeader,
  PageList,
  PageShell,
  RowSkeleton,
  SearchField,
} from "@/components/ui/app-shell";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface MarketplaceClientProps {
  profileId: string;
  collegeName?: string;
}

const CATEGORIES = [
  { id: "all", label: "All", icon: Store },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "essentials", label: "Essentials", icon: ShoppingBag },
  { id: "services", label: "Services", icon: Wrench },
  { id: "rentals", label: "Rentals", icon: Car },
  { id: "activities", label: "Activities", icon: Ticket },
  { id: "deals", label: "Deals", icon: Tag },
] as const;

const CATEGORY_PILLS = CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.icon }));

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

  const categoryLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? "Stores";

  return (
    <PageShell>
      <PageHeader
        title="Marketplace"
        subtitle={collegeName}
        action={
          <Link
            href="/app/marketplace/orders"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/60 px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted/50 active:scale-95"
          >
            <ShoppingBag className="size-3.5" />
            <span>Orders</span>
          </Link>
        }
      />

      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search canteens, rentals or services"
      />

      <FilterPills pills={CATEGORY_PILLS} value={selectedCategory} onChange={handleCategorySelect} />

      {/* ─── Student deals ─── */}
      {deals.length > 0 && selectedCategory === "all" && !searchQuery && (
        <section className="border-b border-border/30 px-4 py-3">
          <h2 className="mb-2 text-[13px] font-bold text-foreground">Student deals</h2>
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            {deals.map((deal: any) => (
              <Link
                key={deal.id}
                href={`/app/marketplace/store/${deal.storeId}`}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="flex w-64 shrink-0 items-center gap-2.5 rounded-xl border border-border/40 p-2.5 transition-colors hover:bg-muted/25"
              >
                <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={deal.storeLogo} alt="" className="size-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-foreground">{deal.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {deal.storeName}
                    {deal.code ? ` · ${deal.code}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Bike fleet ─── */}
      {selectedCategory === "rentals" && rentalBikes.length > 0 && (
        <PageList>
          {rentalBikes.map((b) => (
            <ListRow key={b.id} href={`/app/marketplace/rentals/bikes/${b.id}`}>
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img src={b.imageUrl} alt="" className="size-full object-cover" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-[15px] font-bold text-foreground group-hover:text-primary">
                    {b.name}
                  </h3>
                  <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                </div>
                <p className="truncate text-[13px] text-muted-foreground">
                  {b.pickupLocation}
                  {b.merchant?.name ? ` · ${b.merchant.name}` : ""}
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  <span className="font-black text-foreground">₹{b.dailyPrice}</span> / day ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    {b.rating}
                  </span>
                  {b.securityDeposit ? ` · ₹${b.securityDeposit} deposit` : ""}
                </p>
              </div>
            </ListRow>
          ))}
        </PageList>
      )}

      {/* ─── Stores ─── */}
      <PageList>
        {isLoading ? (
          <RowSkeleton count={5} media="thumb" />
        ) : stores.length > 0 ? (
          <>
            <p className="px-4 py-2.5 text-[13px] text-muted-foreground">
              <strong className="font-black text-foreground">{stores.length}</strong>{" "}
              {stores.length === 1 ? "store" : "stores"}
              {selectedCategory !== "all" ? ` in ${categoryLabel}` : " near you"}
            </p>

            {stores.map((store) => (
              <ListRow key={store.id} href={`/app/marketplace/store/${store.id}`}>
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img src={store.coverUrl || store.logoUrl} alt="" className="size-full object-cover" />
                  {!store.isOpen && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/65 text-[11px] font-bold text-white">
                      Closed
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-[15px] font-bold text-foreground group-hover:text-primary">
                      {store.name}
                    </h3>
                    <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                  </div>

                  <p className="truncate text-[13px] text-muted-foreground">{store.description}</p>

                  {/* One plain meta line, rather than five coloured pills. */}
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      {store.rating}
                    </span>
                    {store.estimatedPrepTime && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{store.estimatedPrepTime}</span>
                      </>
                    )}
                    {store.locationPin && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="truncate">{store.locationPin}</span>
                      </>
                    )}
                    {store.isDeliveryEnabled && (
                      <>
                        <span aria-hidden>·</span>
                        <span>Delivery ₹{store.deliveryFee}</span>
                      </>
                    )}
                    {store.isPickupEnabled && (
                      <>
                        <span aria-hidden>·</span>
                        <span>Pickup</span>
                      </>
                    )}
                  </p>

                  {store.offers?.length > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Tag className="size-3 shrink-0" />
                      <span className="truncate">{store.offers[0].title}</span>
                    </p>
                  )}
                </div>
              </ListRow>
            ))}
          </>
        ) : (
          <EmptyState
            icon={Store}
            title="No stores found"
            description={
              searchQuery ? `Nothing matches "${searchQuery}".` : "No businesses listed in this category yet."
            }
          />
        )}
      </PageList>

      {/* ─── Cart bar ─── */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-lg px-4 duration-200 animate-in slide-in-from-bottom-3 sm:bottom-6">
          <Link
            href="/app/marketplace/cart"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex cursor-pointer items-center justify-between rounded-full bg-foreground px-5 py-3.5 text-[13px] font-black text-background shadow-xl transition-opacity hover:opacity-95 active:scale-[0.99]"
          >
            <span>
              {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} · ₹
              {overallSubtotal.toLocaleString("en-IN")}
            </span>
            <span className="flex items-center gap-1">
              View cart
              <ChevronRight className="size-4" />
            </span>
          </Link>
        </div>
      )}
    </PageShell>
  );
}
