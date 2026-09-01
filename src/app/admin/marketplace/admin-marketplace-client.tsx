"use client";

import {
  Bike,
  ChevronDown,
  Droplet,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Package,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  Share2,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Store,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All Verticals", icon: Store, color: "text-primary", bg: "bg-primary/10" },
  {
    id: "food",
    label: "Food & Canteens",
    icon: UtensilsCrossed,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    id: "supermarket",
    label: "Supermarket & Mart",
    icon: ShoppingBag,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: "rentals",
    label: "Bike & Vehicle Rentals",
    icon: Bike,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  { id: "barber", label: "Barber & Salon", icon: Scissors, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "laundry", label: "Laundry & Wash", icon: Shirt, color: "text-purple-500", bg: "bg-purple-500/10" },
  {
    id: "water",
    label: "20L Water Can Delivery",
    icon: Droplet,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
] as const;

export function AdminMarketplaceClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

  // Quick credentials modal state
  const [credentialModalStore, setCredentialModalStore] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Held in memory only, for the one render after a rotate. Never persisted.
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  // Quick product modal state
  const [productModalStore, setProductModalStore] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodIsVeg, setProdIsVeg] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const { data, isLoading, mutate } = useSWR<{ merchants: any[] }>(
    "/api/admin/marketplace/merchants",
    fetcher,
    { dedupingInterval: 6000 }
  );

  const merchants = data?.merchants || [];
  const totalProducts = merchants.reduce((sum, m) => sum + (m.products?.length || 0), 0);
  const totalOrders = merchants.reduce((sum, m) => sum + (m.orders?.length || 0), 0);

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const cat = m.categorySlug === "essentials" ? "supermarket" : m.categorySlug || "food";
      if (selectedCategory !== "all" && cat !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name?.toLowerCase().includes(q) ||
          m.address?.toLowerCase().includes(q) ||
          m.categorySlug?.toLowerCase().includes(q) ||
          m.loginUsername?.toLowerCase().includes(q) ||
          m.institution?.name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [merchants, selectedCategory, searchQuery]);

  // Group stores by category for Tier 1 hierarchy
  const categorizedMerchants = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const m of filteredMerchants) {
      const cat = m.categorySlug === "essentials" ? "supermarket" : m.categorySlug || "food";
      if (!map[cat]) map[cat] = [];
      map[cat].push(m);
    }
    return map;
  }, [filteredMerchants]);

  // Rotate credentials directly
  async function handleRotateCredentials(merchantId: string) {
    sounds.tap();
    haptics.medium();
    setIsRotating(true);

    try {
      // The server generates and hashes it, then echoes the plaintext exactly
      // once in the response.
      const res = await fetch(`/api/admin/marketplace/merchants/${merchantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotatePassword: true }),
      });

      if (!res.ok) throw new Error();
      const data = (await res.json()) as { temporaryPassword?: string | null };
      if (!data.temporaryPassword) throw new Error();

      sounds.ting();
      haptics.success();
      toast.success("New password issued — copy it now, it cannot be shown again. 🔑");
      mutate();
      setRevealedPassword(data.temporaryPassword);
      setShowPassword(true);
    } catch {
      toast.error("Failed to rotate password");
    } finally {
      setIsRotating(false);
    }
  }

  // Copy WhatsApp Invitation text.
  //
  // Only ever includes a password that was issued a moment ago in this session.
  // Stored passwords are hashed, so there is nothing to read back — if the
  // admin has not just reset the account, they are told to reset it first.
  function handleCopyWhatsApp(merchant: any) {
    sounds.tap();
    haptics.medium();

    if (!revealedPassword) {
      toast.info("Reset the password first — stored passwords are hashed and cannot be read back.");
      return;
    }

    const text = `*CampusLoop Merchant Portal Credentials*\n\nStore: ${merchant.name}\nCampus: ${merchant.institution?.name || "Campus Hub"}\n\nLogin URL: https://campusloop.space/merchant-portal/login\nUsername: ${merchant.loginUsername || merchant.slug}\nPassword: ${revealedPassword}\n\nPlease login and manage your store menu, pricing, and live customer orders!`;
    navigator.clipboard.writeText(text);
    toast.success("Copied WhatsApp invitation message! 📲");
  }

  // Save product in store modal
  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!productModalStore || !prodName.trim() || !prodPrice.trim()) return;

    setIsSavingProduct(true);
    sounds.tap();
    haptics.light();

    try {
      if (editingProduct) {
        // Edit product
        const res = await fetch("/api/admin/marketplace/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            name: prodName.trim(),
            price: parseInt(prodPrice, 10) || 0,
            originalPrice: prodOriginalPrice ? parseInt(prodOriginalPrice, 10) : null,
            categoryName: prodCategory.trim() || "General",
            isVeg: prodIsVeg,
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Product updated! ✨");
      } else {
        // Add new product
        const res = await fetch("/api/admin/marketplace/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId: productModalStore.id,
            name: prodName.trim(),
            price: parseInt(prodPrice, 10) || 0,
            originalPrice: prodOriginalPrice ? parseInt(prodOriginalPrice, 10) : null,
            categoryName: prodCategory.trim() || "General",
            isVeg: prodIsVeg,
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("Product added to catalog! 🛒");
      }

      setProductModalStore(null);
      setEditingProduct(null);
      mutate();
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsSavingProduct(false);
    }
  }

  // 1-Click Store Open / Close status toggle
  async function handleToggleStoreStatus(store: any) {
    sounds.tap();
    haptics.medium();
    const nextIsOpen = !store.isOpen;
    try {
      const res = await fetch(`/api/admin/marketplace/merchants/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: nextIsOpen }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${store.name} is now ${nextIsOpen ? "OPEN 🟢" : "CLOSED 🔴"}`);
      mutate();
    } catch {
      toast.error("Failed to update store status");
    }
  }

  // 1-Click Product In-Stock / Out-of-Stock toggle
  async function handleToggleProductAvailability(prodId: string, currentAvailable: boolean) {
    sounds.tap();
    haptics.light();
    try {
      const res = await fetch("/api/admin/marketplace/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prodId, isAvailable: !currentAvailable }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Product marked ${!currentAvailable ? "In Stock 🟢" : "Out of Stock 🔴"}`);
      mutate();
    } catch {
      toast.error("Failed to update product stock");
    }
  }

  // Delete product
  async function handleDeleteProduct(prodId: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    sounds.tap();
    try {
      const res = await fetch(`/api/admin/marketplace/products?id=${prodId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Product removed");
      mutate();
    } catch {
      toast.error("Failed to delete product");
    }
  }

  return (
    <div className="space-y-6 select-none pb-20">
      {/* ─── Header & Top Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Store className="size-6 text-primary" />
            <span>Marketplace Executive Console</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            3-Tier Management: Categories ➔ Stores ➔ Products with Plaintext Merchant Credential Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/marketplace/merchants/new"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="size-3.5 stroke-3" />
            <span>Onboard Merchant</span>
          </Link>
        </div>
      </div>

      {/* ─── Top Metrics Strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Stores
          </p>
          <p className="text-2xl font-black text-foreground">{merchants.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Catalog Items
          </p>
          <p className="text-2xl font-black text-foreground">{totalProducts}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Live Orders</p>
          <p className="text-2xl font-black text-foreground">{totalOrders}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Est. Campus GMV
          </p>
          <p className="text-2xl font-black text-emerald-500">₹1,85,000</p>
        </div>
      </div>

      {/* ─── Search & Category Pill Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores, canteens, usernames or campus..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-xs font-medium text-foreground outline-none focus:border-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setSelectedCategory(c.id);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                  isActive
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3-Tier Hierarchy Listing: Category ➔ Stores ➔ Products ─── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : Object.keys(categorizedMerchants).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(categorizedMerchants).map(([catSlug, storeList]) => {
            const categoryMeta = CATEGORIES.find((c) => c.id === catSlug) || {
              label: catSlug.toUpperCase(),
              icon: Store,
              color: "text-primary",
              bg: "bg-primary/10",
            };
            const CatIcon = categoryMeta.icon;

            return (
              <div
                key={catSlug}
                className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs"
              >
                {/* ── Tier 1: Category Header ── */}
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center font-black",
                        categoryMeta.bg,
                        categoryMeta.color
                      )}
                    >
                      <CatIcon className="size-4.5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-foreground capitalize flex items-center gap-2">
                        <span>{categoryMeta.label}</span>
                        <span className="text-[11px] font-bold text-muted-foreground">
                          ({storeList.length} stores)
                        </span>
                      </h2>
                    </div>
                  </div>

                  <Link
                    href={`/app/marketplace/${catSlug === "essentials" ? "supermarket" : catSlug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <span>View Student Storefront</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                {/* ── Tier 2: Stores Under Category ── */}
                <div className="divide-y divide-border">
                  {storeList.map((store) => {
                    const isExpanded = expandedStoreId === store.id;
                    const storeProducts = store.products || [];

                    return (
                      <div key={store.id} className="p-4 space-y-3 hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Store Info */}
                          <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl bg-muted border border-border overflow-hidden shrink-0">
                              <img
                                src={store.logoUrl || store.coverUrl}
                                alt={store.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-foreground">{store.name}</h3>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStoreStatus(store)}
                                  className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase transition-all cursor-pointer hover:scale-105 active:scale-95",
                                    store.isOpen
                                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
                                      : "bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25"
                                  )}
                                  title={`Click to ${store.isOpen ? "Close" : "Open"} store`}
                                >
                                  {store.isOpen ? "🟢 OPEN" : "🔴 CLOSED"}
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {store.institution?.name?.split(",")[0] || "BIT Mesra"} · {store.address}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                                  User: @{store.loginUsername || store.slug}
                                </span>
                                <span className="text-[11px] font-bold text-emerald-500">
                                  ⭐ {store.rating || "4.7"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Admin Actions for this Store */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                sounds.tap();
                                haptics.light();
                                setCredentialModalStore(store);
                                setRevealedPassword(null);
                                setShowPassword(false);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <KeyRound className="size-3.5" />
                              <span>Login &amp; Password</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyWhatsApp(store)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Copy WhatsApp invite message"
                            >
                              <Share2 className="size-3.5" />
                              <span>WhatsApp</span>
                            </button>

                            <Link
                              href={`/admin/marketplace/merchants/${store.id}`}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity"
                            >
                              <Edit2 className="size-3" />
                              <span>Manage</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                sounds.tap();
                                haptics.light();
                                setExpandedStoreId(isExpanded ? null : store.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground cursor-pointer hover:bg-muted"
                            >
                              <Package className="size-3.5" />
                              <span>Products ({storeProducts.length})</span>
                              <ChevronDown
                                className={cn("size-3.5 transition-transform", isExpanded && "rotate-180")}
                              />
                            </button>
                          </div>
                        </div>

                        {/* ── Tier 3: Products Under this Store ── */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-border/60 space-y-3 bg-muted/20 -mx-4 -mb-4 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                Product Catalog &amp; Pricing
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  sounds.tap();
                                  setProductModalStore(store);
                                  setEditingProduct(null);
                                  setProdName("");
                                  setProdPrice("");
                                  setProdOriginalPrice("");
                                  setProdCategory("General");
                                  setProdIsVeg(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                <Plus className="size-3" />
                                <span>Add Product</span>
                              </button>
                            </div>

                            {storeProducts.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {storeProducts.map((p: any) => (
                                  <div
                                    key={p.id}
                                    className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-2 shadow-2xs"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                                      <p className="text-[11px] text-muted-foreground">
                                        <span className="font-black text-foreground">₹{p.price}</span>
                                        {p.originalPrice && (
                                          <span className="line-through ml-1 text-[10px]">
                                            ₹{p.originalPrice}
                                          </span>
                                        )}{" "}
                                        · {p.categoryName || "General"}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleToggleProductAvailability(p.id, p.isAvailable ?? true)
                                        }
                                        className={cn(
                                          "px-2 py-0.5 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer",
                                          p.isAvailable !== false
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                                        )}
                                        title={`Click to mark ${p.isAvailable !== false ? "Out of Stock" : "In Stock"}`}
                                      >
                                        {p.isAvailable !== false ? "In Stock" : "Sold Out"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          sounds.tap();
                                          setProductModalStore(store);
                                          setEditingProduct(p);
                                          setProdName(p.name);
                                          setProdPrice(String(p.price));
                                          setProdOriginalPrice(
                                            p.originalPrice ? String(p.originalPrice) : ""
                                          );
                                          setProdCategory(p.categoryName || "General");
                                          setProdIsVeg(p.isVeg ?? true);
                                        }}
                                        className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                                      >
                                        <Edit2 className="size-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteProduct(p.id)}
                                        className="size-7 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-rose-500 cursor-pointer"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic py-2">
                                No products in catalog yet. Tap &quot;Add Product&quot; to seed items.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
          <Store className="size-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No merchants found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No stores match &quot;{searchQuery}&quot;. Click &quot;Onboard Merchant&quot; above to add a new
            stall or canteens.
          </p>
        </div>
      )}

      {/* ─── MODAL 1: Plaintext Credentials & Password Rotation ─── */}
      {credentialModalStore && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-emerald-500" />
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Merchant Access Credentials
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCredentialModalStore(null);
                  setRevealedPassword(null);
                  setShowPassword(false);
                }}
                className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Store Name</p>
                <p className="text-sm font-black text-foreground">{credentialModalStore.name}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Login Username</p>
                <p className="text-xs font-mono font-bold text-foreground select-all">
                  {credentialModalStore.loginUsername || credentialModalStore.slug}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Password</p>
                {revealedPassword ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 select-all">
                      {showPassword ? revealedPassword : "••••••••••••"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Stored as a hash and cannot be read back. Use{" "}
                    <span className="font-bold text-foreground">Rotate password</span> to issue a new one — it
                    is shown here once, then never again.
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Portal URL</p>
                <p className="text-xs font-mono text-muted-foreground truncate select-all">
                  https://campusloop.space/merchant-portal/login
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isRotating}
                onClick={() => handleRotateCredentials(credentialModalStore.id)}
                className="flex-1 h-10 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={cn("size-3.5", isRotating && "animate-spin")} />
                <span>Rotate Password</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyWhatsApp(credentialModalStore)}
                className="flex-1 h-10 rounded-xl bg-foreground text-background text-xs font-black flex items-center justify-center gap-1.5 hover:opacity-90 cursor-pointer"
              >
                <Share2 className="size-3.5" />
                <span>WhatsApp Invite</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Add / Edit Product Under Store ─── */}
      {productModalStore && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setProductModalStore(null)}
                className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Store: <strong className="text-foreground font-bold">{productModalStore.name}</strong>
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Product Name *</span>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Butter Paneer Roll or Classmate Notebook"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">Price (₹) *</span>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="90"
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">Original MRP (₹)</span>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    placeholder="120"
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Subcategory / Shelf</span>
                <input
                  type="text"
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  placeholder="e.g. Rolls, Snacks, Dairy, Stationery"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-foreground">Dietary: Vegetarian?</span>
                <button
                  type="button"
                  onClick={() => setProdIsVeg((v) => !v)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer",
                    prodIsVeg ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                  )}
                >
                  {prodIsVeg ? "Veg 🥦" : "Non-Veg 🍗"}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalStore(null)}
                  className="flex-1 h-10 rounded-xl border border-border hover:bg-muted text-xs font-bold text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="flex-1 h-10 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProduct ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
