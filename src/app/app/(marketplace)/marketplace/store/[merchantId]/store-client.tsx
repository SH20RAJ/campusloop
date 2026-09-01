"use client";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Percent,
  Phone,
  Plus,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

interface StoreClientProps {
  merchantId: string;
  profileId: string;
}

export function StoreClient({ merchantId, profileId }: StoreClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"menu" | "deals" | "reviews" | "about">("menu");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<Array<{ name: string; price: number }>>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchMenuQuery, setSearchMenuQuery] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "nonveg">("all");

  const { addItem, items, merchantGroups, totalItemsCount } = useMarketplaceCart();

  const { data, isLoading, error } = useSWR<{ store: any }>(`/api/marketplace/store/${merchantId}`, fetcher, {
    dedupingInterval: 15000,
  });

  const { data: reviewsData, mutate: mutateReviews } = useSWR<{
    reviews: any[];
    totalCount: number;
    averageRating: string;
    distribution: Record<number, number>;
    userReview: any;
  }>(`/api/marketplace/store/${merchantId}/reviews`, fetcher);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const store = data?.store;
  const products = store?.products || [];
  const offers = store?.offers || [];
  const reviews = store?.reviews || [];

  // Extract unique categories from products
  const productCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p: any) => {
      if (p.categoryName) cats.add(p.categoryName);
    });
    return Array.from(cats);
  }, [products]);

  // Filter products by category, search, and diet
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (activeCategoryTab !== "all" && p.categoryName !== activeCategoryTab) {
        return false;
      }
      if (dietFilter === "veg" && !p.isVeg) return false;
      if (dietFilter === "nonveg" && p.isVeg) return false;

      if (searchMenuQuery.trim()) {
        const q = searchMenuQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [products, activeCategoryTab, dietFilter, searchMenuQuery]);

  // Group products by category when showing all categories
  const groupedProducts = useMemo(() => {
    if (activeCategoryTab !== "all" || searchMenuQuery.trim()) {
      return [
        {
          category: activeCategoryTab === "all" ? "Search Results" : activeCategoryTab,
          items: filteredProducts,
        },
      ];
    }

    const groups: Record<string, any[]> = {};
    filteredProducts.forEach((p: any) => {
      const cat = p.categoryName || "Specialties";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });

    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  }, [filteredProducts, activeCategoryTab, searchMenuQuery]);

  // Current store items in cart
  const currentStoreGroup = merchantGroups.find((g) => g.merchantId === merchantId);

  function handleOpenProductModal(product: any) {
    if (!store?.isOpen) {
      toast.error("This store is currently closed.");
      return;
    }
    if (!product.isAvailable) {
      toast.error("This item is currently out of stock.");
      return;
    }

    sounds.tap();
    haptics.light();
    setSelectedProduct(product);
    setQuantity(1);
    setSpecialInstructions("");

    const defaults: Record<string, string> = {};
    (product.options || []).forEach((opt: any) => {
      defaults[opt.name] = opt.defaultChoice || opt.choices?.[0] || "";
    });
    setSelectedOptions(defaults);
    setSelectedAddons([]);
  }

  function handleAddonToggle(addon: { name: string; price: number }) {
    sounds.pop();
    haptics.light();
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      if (exists) return prev.filter((a) => a.name !== addon.name);
      return [...prev, addon];
    });
  }

  function handleAddToCart() {
    if (!selectedProduct || !store) return;
    sounds.ting();
    haptics.success();

    addItem({
      productId: selectedProduct.id,
      merchantId: store.id,
      merchantName: store.name,
      merchantSlug: store.slug,
      merchantLogo: store.logoUrl,
      deliveryFee: store.deliveryFee || 20,
      freeDeliveryAbove: store.freeDeliveryAbove,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      imageUrl: selectedProduct.imageUrl,
      quantity,
      selectedOptions,
      selectedAddons,
    });

    toast.success(`Added ${quantity}x "${selectedProduct.name}" to cart! 🛍️`);
    setSelectedProduct(null);
  }

  function handleShareStore() {
    sounds.tap();
    haptics.light();

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";
    const shareUrl = `${baseUrl}/app/marketplace/store/${merchantId}`;

    if (navigator.share) {
      navigator
        .share({
          title: store?.name || "Campus Store",
          text: `Check out ${store?.name} menu on CampusLoop Marketplace!`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Store link copied to clipboard! 📋");
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!store?.id) return;
    setIsSubmittingReview(true);
    sounds.send();
    haptics.success();

    try {
      const res = await fetch(`/api/marketplace/store/${store.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      toast.success("Thank you for your review! ⭐");
      mutateReviews();
      setIsReviewModalOpen(false);
      setReviewComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  // Calculate modal total
  const modalItemTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    const base = selectedProduct.price;
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return (base + addonsTotal) * quantity;
  }, [selectedProduct, selectedAddons, quantity]);

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen border-x border-border/20 bg-background">
        <Skeleton className="h-44 w-full" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-16 w-16 rounded-full -mt-12" />
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen items-center justify-center p-6 text-center">
        <UtensilsCrossed className="size-12 text-muted-foreground/50 mb-3" />
        <h2 className="text-base font-black text-foreground">Store Unavailable</h2>
        <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
          This store is currently not listed or temporarily offline.
        </p>
        <Link
          href="/app/marketplace"
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold"
        >
          Back to Marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen border-x border-border/20 bg-background text-foreground select-none pb-44 md:pb-32">
      {/* ─── Top Sticky Bar (Twitter/X style) ─── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/30 bg-background/85 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-foreground tracking-tight truncate flex items-center gap-1.5">
              <span>{store.name}</span>
              <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              {products.length} menu items · {store.categorySlug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="size-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors cursor-pointer active:scale-95"
            title="Store QR Card"
          >
            <QrCode className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleShareStore}
            className="size-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Share Store"
          >
            <Share2 className="size-3.5" />
          </button>

          <Link
            href={`/app/marketplace/cart`}
            className="relative size-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="View Cart"
          >
            <ShoppingBag className="size-3.5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-foreground text-background text-[10px] font-black flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* ─── Store Cover Banner ─── */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-muted">
        <img
          src={
            store.coverUrl ||
            "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&h=400&fit=crop"
          }
          alt={store.name}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        {/* Operating status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md border shadow-xs",
              store.isOpen
                ? "bg-emerald-500/80 text-white border-emerald-400/40"
                : "bg-rose-500/80 text-white border-rose-400/40"
            )}
          >
            {store.isOpen ? "🟢 Open Now" : "🔴 Currently Closed"}
          </span>
        </div>
      </div>

      {/* ─── Profile Bio & Header Info ─── */}
      <div className="px-4 pb-3 -mt-10 relative z-10 space-y-3">
        <div className="flex items-end justify-between">
          <div className="size-20 rounded-full border-4 border-background overflow-hidden bg-muted shadow-md">
            <img src={store.logoUrl} alt={store.name} className="size-full object-cover" />
          </div>

          <div className="flex items-center gap-2 pb-1">
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-all shadow-2xs"
              >
                <Phone className="size-3" />
                <span>Call Store</span>
              </a>
            )}

            <Link
              href="/merchant-portal/store/qr"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-all shadow-2xs"
            >
              <QrCode className="size-3" />
              <span>Table QR</span>
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-foreground tracking-tight">{store.name}</h2>
            <ShieldCheck className="size-4 text-blue-500" />
          </div>
          {store.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{store.description}</p>
          )}
        </div>

        {/* Info Strip: Campus, Rating, Delivery */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span>{store.address}</span>
          </span>

          <span className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="size-3.5 fill-amber-500" />
            <span>{store.rating || "4.8"}</span>
            <span className="text-muted-foreground font-normal">({reviews.length} reviews)</span>
          </span>

          <span className="flex items-center gap-1">
            <Clock className="size-3.5 text-sky-500 shrink-0" />
            <span>{store.estimatedPrepTime || "15–20 min"}</span>
          </span>

          <span className="flex items-center gap-1">
            <Truck className="size-3.5 text-emerald-500 shrink-0" />
            <span>₹{store.deliveryFee || 20} Delivery</span>
          </span>
        </div>
      </div>

      {/* ─── Twitter/X Style Tab Bar ─── */}
      <nav className="flex items-center border-b border-border/30 bg-background/95 sticky top-12 z-30 backdrop-blur-md">
        {[
          { id: "menu", label: `Menu (${products.length})` },
          { id: "deals", label: `Deals & Offers (${offers.length})` },
          { id: "reviews", label: `Reviews (${reviews.length})` },
          { id: "about", label: "About & Info" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveTab(tab.id as any);
              }}
              className={cn(
                "flex-1 py-3 text-xs font-bold text-center transition-colors relative cursor-pointer",
                isActive
                  ? "text-foreground font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
              )}
            >
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ─── TAB 1: MENU ─── */}
      {activeTab === "menu" && (
        <section className="space-y-4">
          {/* Menu Search & Diet Filters Bar */}
          <div className="p-4 border-b border-border/20 bg-muted/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchMenuQuery}
                onChange={(e) => setSearchMenuQuery(e.target.value)}
                placeholder="Search menu items (e.g. Steam Momos, Thukpa)..."
                className="w-full h-9 rounded-xl bg-muted/50 border border-transparent focus:border-border/60 pl-9 pr-8 text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
              />
              {searchMenuQuery && (
                <button
                  type="button"
                  onClick={() => setSearchMenuQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4.5 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Category Pills Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setActiveCategoryTab("all");
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer",
                  activeCategoryTab === "all"
                    ? "bg-foreground text-background font-black shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/40"
                )}
              >
                All Items
              </button>

              {productCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    setActiveCategoryTab(cat);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer",
                    activeCategoryTab === cat
                      ? "bg-foreground text-background font-black shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/40"
                  )}
                >
                  {cat}
                </button>
              ))}

              {/* Diet filter separator */}
              <div className="w-px h-4 bg-border/40 shrink-0 mx-1" />

              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setDietFilter(dietFilter === "veg" ? "all" : "veg");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 border transition-all cursor-pointer",
                  dietFilter === "veg"
                    ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40 font-black"
                    : "bg-muted/30 text-muted-foreground border-border/40"
                )}
              >
                <div className="size-2 rounded-full bg-emerald-500" />
                <span>Veg Only</span>
              </button>
            </div>
          </div>

          {/* Grouped Products Listing */}
          <div className="divide-y divide-border/25">
            {groupedProducts.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-4 pt-3 pb-1 bg-muted/5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {group.category} ({group.items.length})
                  </h3>
                </div>

                <div className="divide-y divide-border/15">
                  {group.items.map((product: any) => {
                    const discountPercent =
                      product.originalPrice && product.originalPrice > product.price
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : null;

                    return (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-muted/4 transition-colors flex items-start justify-between gap-4"
                      >
                        {/* Left Details */}
                        <div className="space-y-1 min-w-0 flex-1">
                          {/* Veg / NonVeg Tag */}
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-3.5 rounded-sm border flex items-center justify-center shrink-0",
                                product.isVeg ? "border-emerald-500" : "border-rose-500"
                              )}
                              title={product.isVeg ? "Pure Veg" : "Non-Veg"}
                            >
                              <div
                                className={cn(
                                  "size-1.5 rounded-full",
                                  product.isVeg ? "bg-emerald-500" : "bg-rose-500"
                                )}
                              />
                            </span>
                            {product.rating && (
                              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                                <Star className="size-2.5 fill-amber-500" />
                                <span>{product.rating}</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-foreground leading-snug">{product.name}</h4>

                          {/* Price Row */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-black text-foreground">₹{product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[11px] text-muted-foreground line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                            {discountPercent && (
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-500 text-[10px] font-black">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {product.description && (
                            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed pt-0.5 font-normal">
                              {product.description}
                            </p>
                          )}
                        </div>

                        {/* Right Photo & ADD Button */}
                        <div className="relative shrink-0 flex flex-col items-center">
                          <div className="size-24 rounded-2xl overflow-hidden bg-muted border border-border/40">
                            <img
                              src={
                                product.imageUrl ||
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop"
                              }
                              alt={product.name}
                              className="size-full object-cover"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={!store.isOpen || !product.isAvailable}
                            onClick={() => handleOpenProductModal(product)}
                            className={cn(
                              "mt-[-14px] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95",
                              store.isOpen && product.isAvailable
                                ? "bg-foreground text-background hover:opacity-90"
                                : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                            )}
                          >
                            {!product.isAvailable ? "Sold Out" : "ADD +"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {groupedProducts.length === 0 && (
              <div className="py-16 text-center px-4 space-y-2">
                <UtensilsCrossed className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-bold text-muted-foreground">No menu items match your search.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── TAB 2: DEALS & OFFERS ─── */}
      {activeTab === "deals" && (
        <section className="p-4 space-y-3">
          {offers.length > 0 ? (
            offers.map((offer: any) => (
              <div
                key={offer.id}
                className="p-4 rounded-2xl border border-border/40 bg-card space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    {offer.code}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {offer.discountType === "PERCENTAGE"
                      ? `${offer.discountValue}% OFF`
                      : `₹${offer.discountValue} FLAT OFF`}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground">{offer.title}</h4>
                {offer.description && <p className="text-xs text-muted-foreground">{offer.description}</p>}
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-2">
              <Percent className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-bold text-muted-foreground">No active coupons right now.</p>
            </div>
          )}
        </section>
      )}

      {/* ─── TAB 3: REVIEWS & STUDENT RATINGS ─── */}
      {activeTab === "reviews" && (
        <section className="p-4 space-y-4">
          {/* Rating Summary & Write Review Button */}
          <div className="p-5 rounded-3xl border border-border/40 bg-card space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center text-amber-500 shrink-0">
                  <span className="text-2xl font-black">
                    {reviewsData?.averageRating || store.rating || "4.8"}
                  </span>
                  <span className="text-[10px] font-bold">/ 5.0</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Verified Student Rating</h3>
                  <p className="text-xs text-muted-foreground">
                    Based on {reviewsData?.totalCount || store.reviewCount || 0} student orders
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "size-3.5",
                          s <= Math.round(Number(reviewsData?.averageRating || store.rating || 5))
                            ? "fill-amber-500 stroke-amber-500"
                            : "fill-transparent stroke-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setIsReviewModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-foreground text-background text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Star className="size-3.5 fill-current" />
                <span>{reviewsData?.userReview ? "Update Your Review" : "Rate & Review"}</span>
              </button>
            </div>
          </div>

          {/* Student Reviews Stream */}
          <div className="rounded-3xl border border-border/40 bg-card overflow-hidden divide-y divide-border/20 shadow-xs">
            {(reviewsData?.reviews || reviews || []).length > 0 ? (
              (reviewsData?.reviews || reviews || []).map((rev: any) => {
                const sName = rev.student?.displayName || rev.studentName || "Verified Student";
                const sHandle = rev.student?.username || "student";
                const sAvatar = getAvatarUrl(rev.student?.avatarUrl, sHandle);

                return (
                  <div key={rev.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-muted overflow-hidden border border-border/40">
                          <img src={sAvatar} alt={sName} className="size-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">{sName}</span>
                            <span className="text-[10px] text-muted-foreground">@{sHandle}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={cn(
                                  "size-2.5",
                                  s <= rev.rating
                                    ? "fill-amber-500 stroke-amber-500"
                                    : "fill-transparent stroke-muted-foreground/30"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(rev.createdAt)}
                      </span>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-foreground/90 leading-relaxed font-normal pl-10.5">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center space-y-2">
                <Star className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-bold text-muted-foreground">
                  No reviews yet. Be the first to order and review!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── TAB 4: ABOUT & QR ─── */}
      {activeTab === "about" && (
        <section className="p-4 space-y-4">
          <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-3 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Store Details
            </h3>
            <div className="space-y-2 text-xs text-foreground/90">
              <p>
                <strong>Campus Location:</strong> {store.address}
              </p>
              {store.phone && (
                <p>
                  <strong>Direct Phone:</strong> {store.phone}
                </p>
              )}
              {store.email && (
                <p>
                  <strong>Email:</strong> {store.email}
                </p>
              )}
              <p>
                <strong>Delivery Fee:</strong> ₹{store.deliveryFee} across campus hostels
              </p>
              <p>
                <strong>Min Order:</strong> ₹{store.minOrderValue}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border/40 bg-card text-center space-y-3 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Table QR Stand
            </h3>
            <div className="size-40 mx-auto bg-white p-3 rounded-2xl border border-border">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://campusloop.space/app/marketplace/store/${store.id}`}
                alt="Store QR"
                className="size-full object-contain"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan at dining table for instant contactless ordering
            </p>
          </div>
        </section>
      )}

      {/* ─── Sticky Bottom Floating Cart Bar ─── */}
      {currentStoreGroup && currentStoreGroup.items.length > 0 && (
        <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:bottom-5 left-0 right-0 z-50 px-4 pointer-events-none">
          <div className="mx-auto max-w-2xl pointer-events-auto">
            <Link
              href="/app/marketplace/cart"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-foreground text-background shadow-2xl hover:opacity-95 transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-background text-foreground flex items-center justify-center font-black text-xs">
                  {currentStoreGroup.items.reduce((s, i) => s + i.quantity, 0)}
                </div>
                <div>
                  <p className="text-xs font-black">View Cart</p>
                  <p className="text-[10px] opacity-80">{store.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-black text-sm">
                <span>
                  ₹
                  {currentStoreGroup.items
                    .reduce((s, i) => s + i.price * i.quantity, 0)
                    .toLocaleString("en-IN")}
                </span>
                <ChevronRight className="size-4 stroke-3" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ─── Item Customization Bottom Drawer / Modal ─── */}
      {selectedProduct &&
        (() => {
          const productAddons = (
            Array.isArray(selectedProduct.addons) ? selectedProduct.addons : []
          ) as Array<{
            name: string;
            price: number;
          }>;

          return (
            <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="w-full max-w-lg bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in fade-in-0 slide-in-from-bottom-6 duration-200">
                {/* Fixed Header */}
                <div className="flex items-start justify-between gap-3 border-b border-border/40 p-4 sm:p-5 shrink-0 bg-card">
                  <div>
                    <h3 className="text-base font-black text-foreground">{selectedProduct.name}</h3>
                    <p className="text-xs font-black text-foreground mt-0.5">₹{selectedProduct.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                  {/* Quantity Controller */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/40">
                    <span className="text-xs font-bold text-muted-foreground">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          setQuantity((prev) => Math.max(1, prev - 1));
                        }}
                        className="size-7 rounded-full bg-card border border-border flex items-center justify-center text-foreground font-black hover:bg-muted"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="text-xs font-black tabular-nums">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          setQuantity((prev) => prev + 1);
                        }}
                        className="size-7 rounded-full bg-card border border-border flex items-center justify-center text-foreground font-black hover:bg-muted"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Add-ons (Decided exclusively by Merchant / Admin) */}
                  {productAddons.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Popular Add-ons
                      </span>
                      <div className="space-y-1.5">
                        {productAddons.map((addon) => {
                          const isChecked = selectedAddons.some((a) => a.name === addon.name);
                          return (
                            <button
                              key={addon.name}
                              type="button"
                              onClick={() => handleAddonToggle(addon)}
                              className={cn(
                                "w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer",
                                isChecked
                                  ? "bg-primary/10 border-primary text-foreground font-black"
                                  : "bg-muted/20 border-border/40 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "size-4 rounded-md border flex items-center justify-center",
                                    isChecked
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-border"
                                  )}
                                >
                                  {isChecked && <Check className="size-3 stroke-3" />}
                                </div>
                                <span>{addon.name}</span>
                              </div>
                              <span>+₹{addon.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Special Instructions */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-muted-foreground">
                      Cooking Note / Preferences
                    </span>
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Less spicy, pack extra tissue..."
                      className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                {/* Sticky Guaranteed-Visible Footer */}
                <div className="p-4 sm:p-5 border-t border-border/40 bg-card shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3.5 rounded-2xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-between px-5"
                  >
                    <span>Add to Cart</span>
                    <span>₹{modalItemTotal.toLocaleString("en-IN")}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ─── Rate & Review Store Modal ─── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-black text-foreground">
                  {reviewsData?.userReview ? "Update Review" : `Review ${store.name}`}
                </h3>
                <p className="text-[11px] text-muted-foreground">Share your dining or delivery experience</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2 text-center py-2 bg-muted/20 rounded-2xl border border-border/40">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Select Rating
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        sounds.tap();
                        haptics.light();
                        setReviewRating(star);
                      }}
                      className="p-1 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                    >
                      <Star
                        className={cn(
                          "size-7 transition-colors",
                          star <= reviewRating
                            ? "fill-amber-500 stroke-amber-500"
                            : "fill-transparent stroke-muted-foreground/40"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-amber-500">
                  {reviewRating === 5 && "Outstanding! ⭐⭐⭐⭐⭐"}
                  {reviewRating === 4 && "Great Experience! ⭐⭐⭐⭐"}
                  {reviewRating === 3 && "Average ⭐⭐⭐"}
                  {reviewRating === 2 && "Needs Improvement ⭐⭐"}
                  {reviewRating === 1 && "Poor Experience ⭐"}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Your Review (Optional)</span>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the food quality, packaging, delivery speed, and portion size?"
                  className="w-full p-3 rounded-2xl bg-muted/40 border border-border text-xs font-medium text-foreground outline-none resize-none focus:border-foreground transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview && <Loader2 className="size-3.5 animate-spin" />}
                  <span>{reviewsData?.userReview ? "Update Review" : "Submit Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Cute Branded QR Modal ─── */}
      <BrandedQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={store.name}
        subtitle={`${store.categorySlug || "Campus Canteen"} • ${store.locationPin || "Campus Hub"}`}
        badgeText="Campus Store"
        shortUrl={`https://campusloop.space/app/marketplace/store/${store.id}`}
        avatarUrl={store.logoUrl}
        category="store"
      />
    </main>
  );
}
