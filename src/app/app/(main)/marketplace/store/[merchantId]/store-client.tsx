"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Flame,
  Info,
  Loader2,
  MapPin,
  Minus,
  Percent,
  Phone,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface StoreClientProps {
  merchantId: string;
  profileId: string;
}

export function StoreClient({ merchantId, profileId }: StoreClientProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedAddons, setSelectedAddons] = useState<Array<{ name: string; price: number }>>([]);
  const [quantity, setQuantity] = useState(1);
  const [searchMenuQuery, setSearchMenuQuery] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");

  const { addItem, items, merchantGroups, totalItemsCount } = useMarketplaceCart();

  const { data, isLoading, error } = useSWR<{ store: any }>(
    `/api/marketplace/store/${merchantId}`,
    fetcher,
    { dedupingInterval: 15000 }
  );

  const store = data?.store;
  const products = store?.products || [];
  const offers = store?.offers || [];
  const reviews = store?.reviews || [];

  // Extract unique category names from products
  const productCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p: any) => {
      if (p.categoryName) cats.add(p.categoryName);
    });
    return Array.from(cats);
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      if (activeCategoryTab !== "all" && p.categoryName !== activeCategoryTab) {
        return false;
      }
      if (searchMenuQuery.trim()) {
        const q = searchMenuQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [products, activeCategoryTab, searchMenuQuery]);

  // Current store items in cart
  const currentStoreGroup = merchantGroups.find((g) => g.merchantId === merchantId);

  function handleOpenProductModal(product: any) {
    if (!store?.isOpen) {
      toast.error("This store is currently closed.");
      return;
    }
    sounds.tap();
    haptics.light();
    setSelectedProduct(product);
    setQuantity(1);

    // Set default options if any
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

    toast.success(`Added ${selectedProduct.name} to Cart! 🛒`);
    setSelectedProduct(null);
  }

  function handleShareStore() {
    sounds.tap();
    haptics.light();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: store?.name, url }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(url);
    toast.success("Store link copied to clipboard!");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center px-4 space-y-3">
        <p className="text-base font-bold text-foreground">Store not found</p>
        <button
          type="button"
          onClick={() => router.push("/app/marketplace")}
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28">
      {/* ─── Top Store Cover & Header ─── */}
      <div className="relative h-44 sm:h-52 w-full bg-muted overflow-hidden">
        <img
          src={store.coverUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop"}
          alt={store.name}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              router.back();
            }}
            className="flex size-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>

          <button
            type="button"
            onClick={handleShareStore}
            className="flex size-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-xs transition-colors cursor-pointer"
          >
            <Share2 className="size-4" />
          </button>
        </div>

        {/* Store Logo & Title in Overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3 z-10">
          <div className="size-16 rounded-2xl overflow-hidden border-2 border-background bg-card shrink-0 shadow-lg">
            <img src={store.logoUrl} alt={store.name} className="size-full object-cover" />
          </div>

          <div className="min-w-0 flex-1 text-white">
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5 truncate">
              <span>{store.name}</span>
              <ShieldCheck className="size-4 text-blue-400 shrink-0" />
            </h1>
            <p className="text-xs text-white/80 line-clamp-1">{store.address}</p>
          </div>
        </div>
      </div>

      {/* ─── Store Quick Info Strip ─── */}
      <div className="p-4 bg-card border-b border-border/30 space-y-2.5">
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span>{store.rating} ({store.reviewCount} reviews)</span>
          </span>

          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-xs font-bold border",
              store.isOpen
                ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                : "bg-rose-500/15 text-rose-500 border-rose-500/30"
            )}
          >
            {store.isOpen ? "🟢 Open Now" : "🔴 Closed"}
          </span>

          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">
            <Clock className="size-3 text-primary" />
            <span>{store.estimatedPrepTime}</span>
          </span>

          {store.locationPin && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40">
              <MapPin className="size-3 text-rose-500" />
              <span>{store.locationPin}</span>
            </span>
          )}
        </div>

        {/* Active Offers */}
        {offers.length > 0 && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Percent className="size-4 shrink-0" />
              <span className="font-bold">{offers[0].title}</span>
            </div>
            {offers[0].code && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 font-black text-[10px] uppercase">
                {offers[0].code}
              </span>
            )}
          </div>
        )}

        {/* Menu Search */}
        <div className="relative pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchMenuQuery}
            onChange={(e) => setSearchMenuQuery(e.target.value)}
            placeholder={`Search menu inside ${store.name}...`}
            className="w-full h-9 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background pl-9 pr-8 text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
          />
        </div>

        {/* Category Filter Tabs */}
        {productCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveCategoryTab("all");
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer",
                activeCategoryTab === "all"
                  ? "bg-foreground text-background font-black"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              )}
            >
              All Items ({products.length})
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
                  "px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer",
                  activeCategoryTab === cat
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Menu / Products List ─── */}
      <div className="p-4 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          {activeCategoryTab === "all" ? "Full Menu & Items" : activeCategoryTab}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map((prod: any) => (
            <div
              key={prod.id}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/30 bg-card hover:bg-muted/[0.04] transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="text-sm font-bold text-foreground leading-snug">
                  {prod.name}
                </h3>
                {prod.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                )}
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-sm font-black text-foreground">
                    ₹{prod.price.toLocaleString("en-IN")}
                  </span>
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="text-xs text-muted-foreground/60 line-through">
                      ₹{prod.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  {prod.preparationTime && (
                    <span className="text-[10px] text-muted-foreground/80 flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      <span>{prod.preparationTime}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Product Thumbnail & Add Button */}
              <div className="relative flex flex-col items-center shrink-0">
                {prod.imageUrl && (
                  <div className="size-20 rounded-xl overflow-hidden bg-muted border border-border/30 mb-2">
                    <img src={prod.imageUrl} alt={prod.name} className="size-full object-cover" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenProductModal(prod)}
                  className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                >
                  <Plus className="size-3.5 stroke-[3]" />
                  <span>ADD</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Product Customization Modal ─── */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/50 p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-foreground">
                  {selectedProduct.name}
                </h3>
                <p className="text-sm font-black text-emerald-500 mt-0.5">
                  ₹{selectedProduct.price.toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {selectedProduct.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedProduct.description}
              </p>
            )}

            {/* Options (e.g. Spice level, Size) */}
            {(selectedProduct.options || []).map((opt: any) => (
              <div key={opt.name} className="space-y-1.5 pt-2 border-t border-border/30">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {opt.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(opt.choices || []).map((choice: string) => {
                    const isSelected = selectedOptions[opt.name] === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          haptics.light();
                          setSelectedOptions((prev) => ({ ...prev, [opt.name]: choice }));
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background font-black shadow-xs"
                            : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40"
                        )}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Add-ons */}
            {(selectedProduct.addons || []).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/30">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Add-ons &amp; Extras
                </label>
                <div className="space-y-1.5">
                  {selectedProduct.addons.map((addon: any) => {
                    const isChecked = selectedAddons.some((a) => a.name === addon.name);
                    return (
                      <button
                        key={addon.name}
                        type="button"
                        onClick={() => handleAddonToggle(addon)}
                        className={cn(
                          "flex items-center justify-between w-full p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer",
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/30 text-foreground font-bold"
                            : "bg-muted/40 border-border/30 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "size-4 rounded flex items-center justify-center border",
                              isChecked
                                ? "bg-emerald-500 border-emerald-500 text-black"
                                : "border-border/60"
                            )}
                          >
                            {isChecked && <Check className="size-3 stroke-[3]" />}
                          </div>
                          <span>{addon.name}</span>
                        </div>
                        <span className="text-emerald-500 font-bold">+₹{addon.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add Button */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-3 bg-muted/60 px-3 py-1.5 rounded-full border border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="text-xs font-black text-foreground min-w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setQuantity((q) => q + 1);
                  }}
                  className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Add to Cart</span>
                <span>·</span>
                <span>
                  ₹
                  {(
                    (selectedProduct.price +
                      selectedAddons.reduce((sum, a) => sum + a.price, 0)) *
                    quantity
                  ).toLocaleString("en-IN")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Sticky Cart Bottom Bar ─── */}
      {currentStoreGroup && currentStoreGroup.items.length > 0 && (
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
                {currentStoreGroup.items.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
              <span>₹{currentStoreGroup.subtotal.toLocaleString("en-IN")} from this store</span>
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
