"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
Edit2,
ExternalLink,
Loader2,
Package,
Plus,
QrCode,
Save,
Search,
ShoppingBag,
Store,
Trash2,
X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo,useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface AdminMerchantEditClientProps {
  merchantId: string;
}

export function AdminMerchantEditClient({ merchantId }: AdminMerchantEditClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "products" | "orders" | "qr">("profile");

  const { data, isLoading, mutate } = useSWR<{ merchant: any }>(
    `/api/admin/marketplace/merchants/${merchantId}`,
    fetcher,
    { dedupingInterval: 6000 }
  );

  const merchant = data?.merchant;

  // Form states
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState("food");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [locationPin, setLocationPin] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [upiId, setUpiId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("20");
  const [minOrderValue, setMinOrderValue] = useState("80");
  const [estimatedPrepTime, setEstimatedPrepTime] = useState("15–20 min");
  const [isOpen, setIsOpen] = useState(true);
  const [status, setStatus] = useState("ACTIVE");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when data loads
  const [formInitialized, setFormInitialized] = useState(false);
  if (merchant && !formInitialized) {
    setName(merchant.name || "");
    setCategorySlug(merchant.categorySlug || "food");
    setDescription(merchant.description || "");
    setAddress(merchant.address || "");
    setLocationPin(merchant.locationPin || "");
    setPhone(merchant.phone || "");
    setEmail(merchant.email || "");
    setUpiId(merchant.upiId || "");
    setLogoUrl(merchant.logoUrl || "");
    setCoverUrl(merchant.coverUrl || "");
    setDeliveryFee(String(merchant.deliveryFee ?? 20));
    setMinOrderValue(String(merchant.minOrderValue ?? 80));
    setEstimatedPrepTime(merchant.estimatedPrepTime || "15–20 min");
    setIsOpen(Boolean(merchant.isOpen));
    setStatus(merchant.status || "ACTIVE");
    setFormInitialized(true);
  }

  // Product Add / Edit modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("General");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodIsVeg, setProdIsVeg] = useState(true);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Product search filter
  const [productSearch, setProductSearch] = useState("");

  const productsList = useMemo(() => {
    const prods = merchant?.products || [];
    if (!productSearch.trim()) return prods;
    const q = productSearch.toLowerCase();
    return prods.filter((p: any) => p.name?.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q));
  }, [merchant?.products, productSearch]);

  async function handleSaveMerchant(e: React.FormEvent) {
    e.preventDefault();
    sounds.tap();
    haptics.light();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/marketplace/merchants/${merchantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categorySlug,
          description: description.trim(),
          address: address.trim(),
          locationPin: locationPin.trim(),
          phone: phone.trim(),
          email: email.trim(),
          upiId: upiId.trim(),
          logoUrl: logoUrl.trim(),
          coverUrl: coverUrl.trim(),
          deliveryFee: parseInt(deliveryFee, 10) || 0,
          minOrderValue: parseInt(minOrderValue, 10) || 0,
          estimatedPrepTime: estimatedPrepTime.trim(),
          isOpen,
          status,
        }),
      });

      if (!res.ok) throw new Error("Failed to update merchant");

      sounds.ting();
      haptics.success();
      toast.success("Merchant profile updated successfully! 🎉");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenAddProduct() {
    sounds.tap();
    setEditingProduct(null);
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdOriginalPrice("");
    setProdCategory("General");
    setProdImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop");
    setProdIsVeg(true);
    setIsProductModalOpen(true);
  }

  function handleOpenEditProduct(p: any) {
    sounds.tap();
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description || "");
    setProdPrice(String(p.price));
    setProdOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
    setProdCategory(p.categoryName || "General");
    setProdImageUrl(p.imageUrl || "");
    setProdIsVeg(p.isVeg ?? true);
    setIsProductModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) {
      toast.error("Product name and price are required");
      return;
    }

    setIsSubmittingProduct(true);
    sounds.tap();

    try {
      if (editingProduct) {
        // PATCH
        const res = await fetch("/api/admin/marketplace/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            name: prodName.trim(),
            description: prodDesc.trim(),
            price: parseInt(prodPrice, 10) || 0,
            originalPrice: prodOriginalPrice ? parseInt(prodOriginalPrice, 10) : null,
            categoryName: prodCategory.trim(),
            imageUrl: prodImageUrl.trim(),
            isVeg: prodIsVeg,
          }),
        });

        if (!res.ok) throw new Error("Failed to update product");
        toast.success("Product updated!");
      } else {
        // POST
        const res = await fetch("/api/admin/marketplace/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantId,
            name: prodName.trim(),
            description: prodDesc.trim(),
            price: parseInt(prodPrice, 10) || 0,
            originalPrice: prodOriginalPrice ? parseInt(prodOriginalPrice, 10) : null,
            categoryName: prodCategory.trim(),
            imageUrl: prodImageUrl.trim(),
            isVeg: prodIsVeg,
          }),
        });

        if (!res.ok) throw new Error("Failed to create product");
        toast.success("Product added to menu! 🍽️");
      }

      mutate();
      setIsProductModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  async function handleToggleStock(p: any) {
    sounds.pop();
    haptics.light();
    try {
      await fetch("/api/admin/marketplace/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          isAvailable: !p.isAvailable,
        }),
      });
      toast.success(p.isAvailable ? "Marked Out of Stock" : "Marked In Stock");
      mutate();
    } catch {}
  }

  async function handleDeleteProduct(p: any) {
    if (!confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    sounds.tap();
    try {
      const res = await fetch(`/api/admin/marketplace/products?id=${p.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="text-center py-24 space-y-3">
        <p className="text-sm font-bold text-muted-foreground">Merchant not found</p>
        <Link href="/admin/marketplace" className="text-xs font-bold text-primary hover:underline">
          Return to Marketplace Console
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none pb-20">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/marketplace"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
              <img src={merchant.logoUrl} alt={merchant.name} className="size-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-foreground truncate">{merchant.name}</h1>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                    merchant.status === "ACTIVE"
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                  )}
                >
                  {merchant.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium truncate">
                {merchant.institution?.name?.split(",")[0] || "BIT Mesra"} · {merchant.categorySlug}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/app/marketplace/store/${merchant.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="size-3" />
          </Link>

          <Link
            href={`/merchant-portal/store/qr`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <QrCode className="size-3.5" />
            <span>Table QR</span>
          </Link>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: "profile", label: "Store Profile", icon: Store },
          { id: "products", label: `Catalog (${merchant.products?.length || 0})`, icon: Package },
          { id: "orders", label: `Orders (${merchant.orders?.length || 0})`, icon: ShoppingBag },
          { id: "qr", label: "Table Poster QR", icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
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
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                isActive
                  ? "bg-foreground text-background font-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: Profile & Details ─── */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveMerchant} className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              General Store Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Store Name *</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Category</span>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                >
                  <option value="food">Food &amp; Canteens</option>
                  <option value="essentials">Essentials &amp; Groceries</option>
                  <option value="services">Services &amp; Repairs</option>
                  <option value="rentals">Bike &amp; Gear Rentals</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Store Description</span>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-muted/40 border border-border text-xs font-medium text-foreground outline-none focus:border-foreground resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Campus Address *</span>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Location Pin / Landmark</span>
                <input
                  type="text"
                  value={locationPin}
                  onChange={(e) => setLocationPin(e.target.value)}
                  placeholder="Near ICICI ATM / Main Gate"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Contact &amp; Financials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Phone Number</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Merchant UPI ID</span>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="merchant@okhdfcbank"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Delivery Fee (₹)</span>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Min Order Value (₹)</span>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Prep Time</span>
                <input
                  type="text"
                  value={estimatedPrepTime}
                  onChange={(e) => setEstimatedPrepTime(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Store Status &amp; Storefront Media
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Store Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                >
                  <option value="ACTIVE">🟢 Active</option>
                  <option value="SUSPENDED">🔴 Suspended</option>
                  <option value="PENDING">🟡 Pending Verification</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Operational Status</span>
                <select
                  value={isOpen ? "open" : "closed"}
                  onChange={(e) => setIsOpen(e.target.value === "open")}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                >
                  <option value="open">🟢 Accepting Orders (Open)</option>
                  <option value="closed">🔴 Closed for the day</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Logo URL</span>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Cover Banner URL</span>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              <span>Save Merchant Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── TAB 2: Products & Menu Catalog ─── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full h-9 rounded-xl bg-card border border-border pl-8.5 pr-3 text-xs font-medium text-foreground outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="size-3.5 stroke-3" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Diet</th>
                  <th className="p-3">Stock Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productsList.length > 0 ? (
                  productsList.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                            <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                          </div>
                          <div>
                            <p className="truncate max-w-[180px]">{p.name}</p>
                            {p.description && (
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground font-medium">{p.categoryName || "General"}</td>
                      <td className="p-3 font-black text-foreground">
                        ₹{p.price}
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-muted-foreground line-through ml-1.5">
                            ₹{p.originalPrice}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                            p.isVeg
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                          )}
                        >
                          {p.isVeg ? "Veg" : "Non-Veg"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(p)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            p.isAvailable
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {p.isAvailable ? "🟢 In Stock" : "🔴 Out of Stock"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(p)}
                            className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="size-7 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-muted-foreground hover:text-rose-500 cursor-pointer transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                      No products found. Click "Add Menu Item" to add items to this store.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Orders Stream ─── */}
      {activeTab === "orders" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground">Recent Orders</h2>
            <span className="text-xs text-muted-foreground font-semibold">
              {merchant.orders?.length || 0} total
            </span>
          </div>

          <div className="divide-y divide-border">
            {merchant.orders?.length > 0 ? (
              merchant.orders.map((o: any) => (
                <div key={o.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                  <div>
                    <p className="text-xs font-black text-foreground">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Total ₹{o.total} · {o.paymentMode || "UPI"} · {o.deliveryType || "HOSTEL_DELIVERY"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      o.status === "DELIVERED" || o.status === "COMPLETED"
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    )}
                  >
                    {o.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No orders placed yet for this store.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: Table QR Stand ─── */}
      {activeTab === "qr" && (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 max-w-sm mx-auto shadow-xs">
          <div className="size-48 mx-auto bg-white p-4 rounded-2xl border border-border flex items-center justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://campusloop.space/app/marketplace/store/${merchant.id}`}
              alt={`${merchant.name} QR`}
              className="size-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">{merchant.name}</h3>
            <p className="text-xs text-muted-foreground">Table Ordering QR Code</p>
          </div>
          <Link
            href="/merchant-portal/store/qr"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90"
          >
            <span>Print Official A4 Table Stand</span>
          </Link>
        </div>
      )}

      {/* ─── Add/Edit Product Modal ─── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-black text-foreground">
                {editingProduct ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Item Name *</span>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Steamed Chicken Momos (8 Pcs)"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none focus:border-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">Selling Price (₹) *</span>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="120"
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">MRP / Original (₹)</span>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(e.target.value)}
                    placeholder="150"
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">Category Name</span>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="Momos / Burgers / Beverages"
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground">Diet Preference</span>
                  <select
                    value={prodIsVeg ? "veg" : "nonveg"}
                    onChange={(e) => setProdIsVeg(e.target.value === "veg")}
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="veg">🟢 Pure Veg</option>
                    <option value="nonveg">🔴 Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Image URL</span>
                <input
                  type="url"
                  value={prodImageUrl}
                  onChange={(e) => setProdImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground">Description</span>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Ingredients, spice level, serving size..."
                  className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-xs font-medium text-foreground outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmittingProduct && <Loader2 className="size-3 animate-spin" />}
                  <span>{editingProduct ? "Save Item" : "Add Item"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
