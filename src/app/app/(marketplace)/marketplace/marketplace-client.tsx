"use client";

import {
  Bike,
  ChevronRight,
  Droplet,
  Scissors,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Star,
  Store,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { CommunityHubStrip } from "@/components/marketplace/community-hub-strip";
import {
  FilterPills,
  ListRow,
  PageHeader,
  PageList,
  PageShell,
  RowSkeleton,
  SearchField,
} from "@/components/ui/app-shell";
import { InstagramIcon } from "@/components/ui/social-icons";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface MarketplaceClientProps {
  profileId: string;
  collegeName?: string;
}

const CATEGORIES = [
  { id: "all", label: "All Services", icon: Store },
  { id: "food", label: "🍔 Food & Canteens", icon: UtensilsCrossed },
  { id: "rentals", label: "🚲 Bike Rentals", icon: Bike },
  { id: "barber", label: "✂️ Barber & Salon", icon: Scissors },
  { id: "laundry", label: "🧺 Laundry & Wash", icon: Shirt },
  { id: "water", label: "💧 Water Delivery", icon: Droplet },
  { id: "essentials", label: "🛒 Supermarket & Mart", icon: ShoppingBag },
] as const;

const CATEGORY_PILLS = CATEGORIES.map((c) => ({ id: c.id, label: c.label, icon: c.icon }));

export function MarketplaceClient({ profileId, collegeName = "Campus Hub" }: MarketplaceClientProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isBitMesraStudent = useMemo(() => {
    const slug = profile?.institution?.slug?.toLowerCase();
    const name = (profile?.institution?.name || collegeName || "").toLowerCase();
    return (
      slug === "bit-mesra" ||
      slug === "bitmesra" ||
      name.includes("mesra") ||
      name.includes("birla institute of technology, mesra")
    );
  }, [profile, collegeName]);

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

      {/* ─── Dynamic Banner (BIT Mesra vs Other Campuses) ─── */}
      {isBitMesraStudent ? (
        <div className="mx-4 my-2.5 rounded-3xl border border-amber-500/35 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 p-4 sm:p-5 relative overflow-hidden shadow-xs">
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
                Late night Maggi, hot chicken rolls, burgers, thick shakes &amp; combos delivered straight to
                your hostel room till 4 AM. Use code{" "}
                <span className="font-bold text-foreground">NIGHTOWL20</span> for 20% OFF!
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
      ) : (
        <div className="mx-4 my-2.5 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
                <span>🚀 1,000+ STUDENT SIGNUPS REQUIRED TO UNLOCK</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-foreground">
                Want Night Canteens &amp; Store Delivery at {collegeName}?
              </h3>
              <p className="text-xs text-muted-foreground max-w-lg font-medium leading-relaxed">
                CampusLoop Marketplace is currently live at BIT Mesra. To launch night canteens, laundry, and
                bike rentals at your campus, your college must have{" "}
                <span className="font-bold text-foreground">1,000+ verified student signups</span>. Share
                CampusLoop with your batchmates and DM us to unlock!
              </p>
            </div>
            <a
              href="https://www.instagram.com/campusloop.space/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sounds.tap();
                haptics.success();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black shadow-md hover:opacity-90 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <InstagramIcon className="size-4 fill-white" />
              <span>Invite via Instagram DM</span>
            </a>
          </div>
        </div>
      )}

      {/* ─── 6 Campus Marketplace Vertical Hub Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 py-2">
        <Link
          href="/app/marketplace/food"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-rose-600 to-amber-500 p-3.5 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28"
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Zomato Style
            </span>
            <h3 className="text-sm sm:text-base font-black mt-1">Food &amp; Canteens</h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-white/90 flex items-center justify-between font-bold">
            <span>Momos &amp; thalis</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        <Link
          href="/app/marketplace/supermarket"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 p-3.5 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28"
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Flipkart Style
            </span>
            <h3 className="text-sm sm:text-base font-black mt-1">Supermarket Mart</h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-white/90 flex items-center justify-between font-bold">
            <span>Snacks &amp; stationery</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        <Link
          href="/app/marketplace/rentals"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 p-3.5 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28"
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Multi-Depot
            </span>
            <h3 className="text-sm sm:text-base font-black mt-1">Bike &amp; EV Rentals</h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-white/90 flex items-center justify-between font-bold">
            <span>Cycles &amp; scooters</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        <Link
          href="/app/marketplace/barber"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600 to-amber-700 p-3.5 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28"
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Live Queue
            </span>
            <h3 className="text-sm sm:text-base font-black mt-1">Barber &amp; Salon</h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-white/90 flex items-center justify-between font-bold">
            <span>Haircut &amp; beard</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        <Link
          href="/app/marketplace/laundry"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28"
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Doorstep Drop
            </span>
            <h3 className="text-sm sm:text-base font-black mt-1">Laundry &amp; Wash</h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-white/90 flex items-center justify-between font-bold">
            <span>Wash, iron &amp; fold</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        <Link
          href="/app/marketplace/water"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-600 p-3.5 text-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-28"
        >
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Room Delivery
            </span>
            <h3 className="text-sm sm:text-base font-black mt-1">RO Water Supply</h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-white/90 flex items-center justify-between font-bold">
            <span>20L Chilled Cans</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>
      </div>

      {/* ─── Campus Expansion Banner (Only shown to non-BIT Mesra students) ─── */}
      {!isBitMesraStudent && (
        <div className="mx-4 my-2 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 p-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 text-[9px] font-black uppercase tracking-wider">
                <span>🚀 Want this at your campus?</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-foreground">
                Bring CampusLoop Marketplace to Your College
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-md">
                We partner directly with campus canteens, laundries, cycle rentals, and water suppliers.
                Contact us on Instagram to onboard your campus vendors!
              </p>
            </div>
            <a
              href="https://www.instagram.com/campusloop.space/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-xs font-black shadow-sm hover:opacity-95 transition-transform active:scale-95 shrink-0"
            >
              <InstagramIcon className="size-3" />
              <span>DM @campusloop.space</span>
            </a>
          </div>
        </div>
      )}

      {/* ─── Community-Maintained Campus Utility Hubs (6 Dedicated Services) ─── */}
      <CommunityHubStrip />

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
          <div className="mx-4 my-6 p-6 sm:p-8 rounded-3xl bg-card border border-border/60 text-center space-y-4 shadow-xs">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto font-black text-lg">
              <Store className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">
                {isBitMesraStudent
                  ? searchQuery
                    ? `No stores matching "${searchQuery}"`
                    : "No stores currently open"
                  : `Campus Stores Coming Soon to ${collegeName}`}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isBitMesraStudent
                  ? "Check back shortly or browse upcoming listings in other categories."
                  : `CampusLoop Marketplace launches once a college reaches 1,000+ verified student signups. Get your campus batchmates on CampusLoop and DM us on Instagram to prioritize your college!`}
              </p>
            </div>
            {!isBitMesraStudent && (
              <a
                href="https://www.instagram.com/campusloop.space/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  sounds.tap();
                  haptics.success();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <InstagramIcon className="size-3.5 fill-current" />
                <span>Invite Us via Instagram DM (1K+ Students)</span>
              </a>
            )}
          </div>
        )}
      </PageList>

      {/* ─── Cart bar ─── */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-0 right-0 z-50 mx-auto max-w-lg px-4 duration-200 animate-in slide-in-from-bottom-3">
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
