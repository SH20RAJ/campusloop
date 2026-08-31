"use client";

import {
  ArrowLeft,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Lock,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

interface AdminMerchantEditClientProps {
  merchantId: string;
}

type TabType = "profile" | "credentials" | "products" | "orders" | "reviews" | "qr";

export function AdminMerchantEditClient({ merchantId }: AdminMerchantEditClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const { data, isLoading, mutate } = useSWR<{ merchant: any }>(
    `/api/admin/marketplace/merchants/${merchantId}`,
    fetcher,
    { dedupingInterval: 6000 }
  );

  const { data: reviewsData, mutate: mutateReviews } = useSWR<{
    reviews: any[];
    totalCount: number;
    averageRating: string;
    distribution: Record<number, number>;
  }>(`/api/marketplace/store/${merchantId}/reviews`, fetcher);

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

  // Credentials states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);

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
    setLogoUrl(
      merchant.logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop"
    );
    setCoverUrl(
      merchant.coverUrl ||
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&h=400&fit=crop"
    );
    setDeliveryFee(String(merchant.deliveryFee ?? 20));
    setMinOrderValue(String(merchant.minOrderValue ?? 80));
    setEstimatedPrepTime(merchant.estimatedPrepTime || "15–20 min");
    setIsOpen(Boolean(merchant.isOpen));
    setStatus(merchant.status || "ACTIVE");
    setLoginUsername(merchant.loginUsername || merchant.slug || "");
    setLoginPassword(merchant.loginPassword || "momo@CampusLoop2026");
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
    return prods.filter(
      (p: any) => p.name?.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q)
    );
  }, [merchant?.products, productSearch]);

  function handleGeneratePassword() {
    sounds.pop();
    haptics.light();
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let rand = "";
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setLoginPassword(`cl_${rand}!`);
    toast.success("Generated new password! Click 'Save Credentials' to apply.");
  }

  function handleCopyCredentials() {
    sounds.tap();
    const text = `CampusLoop Merchant Portal Credentials\nStore: ${name}\nLogin URL: https://campusloop.space/merchant-portal/login\nUsername: ${loginUsername}\nPassword: ${loginPassword}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard! 📋");
  }

  async function handleSaveCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      toast.error("Username and password cannot be empty");
      return;
    }

    setIsSavingCredentials(true);
    sounds.tap();
    haptics.medium();

    try {
      const res = await fetch(`/api/admin/marketplace/merchants/${merchantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginUsername: loginUsername.trim().toLowerCase(),
          loginPassword: loginPassword.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to update credentials");

      sounds.ting();
      haptics.success();
      toast.success("Merchant login credentials updated successfully! 🔑");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update credentials");
    } finally {
      setIsSavingCredentials(false);
    }
  }

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
    setProdName(p.name || "");
    setProdDesc(p.description || "");
    setProdPrice(String(p.price ?? ""));
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
    if (!confirm(`Delete "${p.name}" from menu?`)) return;
    sounds.pop();
    haptics.heavy();
    try {
      await fetch(`/api/merchant/products?id=${p.id}`, { method: "DELETE" });
      toast.success("Product removed from menu");
      mutate();
    } catch {
      toast.error("Failed to delete product");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-xl" />
        <div className="h-64 w-full bg-muted rounded-3xl" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <p className="text-sm font-bold text-foreground">Merchant not found</p>
        <Link
          href="/admin/marketplace"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* ─── Top Store Header Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/marketplace"
            className="size-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl border border-border bg-muted overflow-hidden shrink-0">
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
                {merchant.institution?.name?.split(",")[0] || "BIT Mesra"} · {merchant.categorySlug} · ⭐{" "}
                {merchant.rating} ({merchant.reviewCount} reviews)
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
            href="/merchant-portal/login"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
          >
            <KeyRound className="size-3.5" />
            <span>Login as Merchant</span>
          </Link>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: "profile", label: "Store Profile", icon: Store },
          { id: "credentials", label: "Credentials & Auth", icon: KeyRound },
          { id: "products", label: `Catalog (${merchant.products?.length || 0})`, icon: Package },
          { id: "orders", label: `Orders (${merchant.orders?.length || 0})`, icon: ShoppingBag },
          {
            id: "reviews",
            label: `Reviews (${reviewsData?.totalCount || merchant.reviewCount || 0})`,
            icon: Star,
          },
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
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0",
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

      {/* ─── TAB 1: Profile & Details (pfp, bg pic, address, info) ─── */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveMerchant} className="space-y-4">
          {/* Visual Assets Preview Card */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-primary" />
              <span>Visual Branding (Profile Picture &amp; Cover Banner)</span>
            </h2>

            {/* Live Visual Preview */}
            <div className="relative rounded-2xl border border-border overflow-hidden bg-muted/40 h-36 sm:h-44 flex items-end p-4">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover Preview" className="absolute inset-0 size-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

              <div className="relative z-10 flex items-center gap-3">
                <div className="size-16 rounded-2xl border-2 border-background bg-card overflow-hidden shrink-0 shadow-lg">
                  <img src={logoUrl} alt="Logo Preview" className="size-full object-cover" />
                </div>
                <div className="text-white">
                  <h3 className="text-base font-black leading-tight drop-shadow-sm">
                    {name || "Store Name"}
                  </h3>
                  <p className="text-xs text-white/80 font-medium drop-shadow-sm">
                    {categorySlug} · {address || "Campus Location"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Logo / Profile Picture URL
                </span>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Cover / Background Banner URL
                </span>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

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
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Category *</span>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
                >
                  <option value="food">🍔 Food &amp; Canteens</option>
                  <option value="rentals">🚲 Bike &amp; Vehicle Rentals</option>
                  <option value="barber">✂️ Barber &amp; Salon</option>
                  <option value="laundry">🧺 Laundry &amp; Wash</option>
                  <option value="water">💧 20L Water Delivery</option>
                  <option value="essentials">🛒 Supermarket &amp; Mart</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Description</span>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-muted/40 border border-border p-3 text-xs font-medium text-foreground outline-none resize-none"
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
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Location Pin / Landmark</span>
                <input
                  type="text"
                  value={locationPin}
                  onChange={(e) => setLocationPin(e.target.value)}
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Phone</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Merchant UPI ID</span>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="paytm@upi"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-mono font-medium text-foreground outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Delivery Fee (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Min Order Value (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Est. Prep Time</span>
                <input
                  type="text"
                  value={estimatedPrepTime}
                  onChange={(e) => setEstimatedPrepTime(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-xs font-bold text-foreground">Operational Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-lg bg-card border border-border px-2 py-1 text-xs font-black uppercase"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-xs font-bold text-foreground">Store Open Toggle</span>
                <button
                  type="button"
                  onClick={() => setIsOpen((prev) => !prev)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-black uppercase transition-colors cursor-pointer",
                    isOpen
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                  )}
                >
                  {isOpen ? "OPEN NOW" : "CLOSED"}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Store Profile</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ─── TAB 2: Credentials & Portal Login (Username + Password) ─── */}
      {activeTab === "credentials" && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-card border border-emerald-500/30 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Direct Merchant Portal Credentials
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold text-foreground cursor-pointer transition-colors"
              >
                <Copy className="size-3.5" />
                <span>Copy Credentials</span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Give these credentials to the merchant stall owner/staff so they can log in at{" "}
              <code className="text-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                https://campusloop.space/merchant-portal/login
              </code>{" "}
              to update their menu inventory and manage orders.
            </p>

            <form onSubmit={handleSaveCredentials} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <User className="size-3" />
                    <span>Merchant Login Username</span>
                  </span>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-mono font-bold text-foreground outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <Lock className="size-3" />
                      <span>Login Password</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="size-2.5" />
                      <span>Generate Strong Password</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 pr-20 text-xs font-mono font-bold text-foreground outline-none focus:border-foreground"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="size-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/merchant-portal/login"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Open Merchant Login Page</span>
                  <ExternalLink className="size-3" />
                </Link>

                <button
                  type="submit"
                  disabled={isSavingCredentials}
                  className="px-5 py-2.5 rounded-xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSavingCredentials ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="size-3.5" />
                  )}
                  <span>Save Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Products Catalog CRUD ─── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full h-10 rounded-xl bg-card border border-border pl-9 pr-3 text-xs font-bold text-foreground outline-none focus:border-foreground"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="size-3.5 stroke-2" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border/30">
            {productsList.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Package className="size-8 mx-auto text-muted-foreground" />
                <p className="text-xs font-bold text-foreground">No menu items found</p>
                <p className="text-[11px] text-muted-foreground">
                  Add products to make them available to students.
                </p>
              </div>
            ) : (
              productsList.map((p: any) => (
                <div
                  key={p.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-xs">🍽️</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground truncate">{p.name}</span>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {p.categoryName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-black text-foreground">₹{p.price}</span>
                        {p.originalPrice && (
                          <span className="line-through text-[11px]">₹{p.originalPrice}</span>
                        )}
                        <span>· {p.isAvailable ? "🟢 In Stock" : "🔴 Out of Stock"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(p)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                        p.isAvailable
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
                      )}
                    >
                      {p.isAvailable ? "In Stock" : "Out of Stock"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(p)}
                      className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p)}
                      className="size-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 flex items-center justify-center cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: Live Orders ─── */}
      {activeTab === "orders" && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border/30">
          {(merchant.orders || []).length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShoppingBag className="size-8 mx-auto text-muted-foreground" />
              <p className="text-xs font-bold text-foreground">No orders recorded yet</p>
            </div>
          ) : (
            merchant.orders.map((o: any) => (
              <div key={o.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground">
                      #{o.orderNumber || o.id.slice(0, 8)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                      {o.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ₹{o.total} · {o.paymentMethod || "COD"} · {formatTimeAgo(o.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── TAB 5: Ratings & Student Reviews ─── */}
      {activeTab === "reviews" && (
        <div className="space-y-5">
          {/* Summary Card */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center text-amber-500">
                <span className="text-2xl font-black">{reviewsData?.averageRating || merchant.rating}</span>
                <span className="text-[10px] font-bold">/ 5.0</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">Student Store Rating</h3>
                <p className="text-xs text-muted-foreground">
                  Based on {reviewsData?.totalCount || merchant.reviewCount || 0} verified student reviews
                </p>
                <div className="flex items-center gap-1 mt-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-3.5",
                        s <= Math.round(Number(reviewsData?.averageRating || merchant.rating))
                          ? "fill-amber-500 stroke-amber-500"
                          : "fill-transparent stroke-muted-foreground/40"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Link
              href={`/app/marketplace/store/${merchant.id}`}
              target="_blank"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Reviews on Public Storefront</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>

          {/* Reviews List */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border/30">
            {(reviewsData?.reviews || []).length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Star className="size-8 mx-auto text-muted-foreground" />
                <p className="text-xs font-bold text-foreground">No student reviews yet</p>
                <p className="text-[11px] text-muted-foreground">
                  Students can review this store from the store page.
                </p>
              </div>
            ) : (
              reviewsData?.reviews.map((r: any) => (
                <div key={r.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-muted overflow-hidden border border-border">
                        <img
                          src={getAvatarUrl(r.student?.avatarUrl, r.student?.username ?? "student")}
                          alt={r.student?.displayName || "Student"}
                          className="size-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {r.student?.displayName || "Student"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            @{r.student?.username || "student"}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "size-2.5",
                                s <= r.rating
                                  ? "fill-amber-500 stroke-amber-500"
                                  : "fill-transparent stroke-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatTimeAgo(r.createdAt)}</span>
                  </div>

                  {r.comment && (
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium pl-9">{r.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 6: Table QR Stand ─── */}
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
