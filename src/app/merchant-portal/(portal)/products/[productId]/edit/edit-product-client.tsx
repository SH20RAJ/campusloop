"use client";

import { ArrowLeft, Check, ImagePlus, Loader2, Package, Plus, Save, Zap, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface EditProductClientProps {
  productId: string;
}

interface ProductAddon {
  id?: string;
  name: string;
  price: number;
}

const COMMON_SECTIONS = [
  "Popular Items",
  "Maggi & Noodles",
  "Rolls & Wraps",
  "Burgers & Sandwiches",
  "Combos & Meals",
  "Beverages & Shakes",
  "Parathas & Breads",
  "Snacks & Starters",
  "Daily Specials",
];

const SUGGESTED_ADDONS: ProductAddon[] = [
  { name: "Extra Cheese", price: 20 },
  { name: "Extra Chicken", price: 30 },
  { name: "Extra Egg", price: 15 },
  { name: "Peri-Peri Seasoning", price: 10 },
  { name: "Schezwan Dip", price: 15 },
  { name: "Spicy Mayo Drizzle", price: 15 },
  { name: "Butter Tossed", price: 15 },
];

export function EditProductClient({ productId }: EditProductClientProps) {
  const router = useRouter();

  const { data, isLoading, mutate } = useSWR<{ product: any }>(
    `/api/merchant/products/${productId}`,
    fetcher,
    { dedupingInterval: 5000 }
  );

  const product = data?.product;

  // Form states
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("Popular Items");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preparationTime, setPreparationTime] = useState("15 min");
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [addons, setAddons] = useState<ProductAddon[]>([]);

  // New addon input state
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (product && !formInitialized) {
      setName(product.name || "");
      setCategoryName(product.categoryName || "Popular Items");
      setPrice(String(product.price ?? ""));
      setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
      setDescription(product.description || "");
      setImageUrl(product.imageUrl || "");
      setPreparationTime(product.preparationTime || "15 min");
      setIsVeg(product.isVeg !== false);
      setIsAvailable(product.isAvailable !== false);
      setAddons(Array.isArray(product.addons) ? product.addons : []);
      setFormInitialized(true);
    }
  }, [product, formInitialized]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    sounds.pop();
    haptics.light();

    try {
      toast.loading("Uploading product image...", { id: "upload-prod" });
      const res = await uploadImageToImgBB(files[0]);
      setImageUrl(res.displayUrl || res.url);
      toast.success("Image uploaded successfully! 📸", { id: "upload-prod" });
    } catch {
      toast.error("Failed to upload image", { id: "upload-prod" });
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleAddAddon(customAddon?: ProductAddon) {
    const targetName = customAddon ? customAddon.name : newAddonName.trim();
    const targetPrice = customAddon ? customAddon.price : parseInt(newAddonPrice, 10);

    if (!targetName || isNaN(targetPrice) || targetPrice < 0) {
      toast.error("Please enter a valid add-on name and price");
      return;
    }

    if (addons.some((a) => a.name.toLowerCase() === targetName.toLowerCase())) {
      toast.error("This add-on already exists for this item");
      return;
    }

    sounds.tap();
    haptics.light();
    setAddons((prev) => [...prev, { name: targetName, price: targetPrice }]);
    if (!customAddon) {
      setNewAddonName("");
      setNewAddonPrice("");
    }
  }

  function handleRemoveAddon(index: number) {
    sounds.tap();
    haptics.light();
    setAddons((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const numericPrice = parseInt(price, 10);
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error("Please enter a valid price in Rupees");
      return;
    }

    setIsSaving(true);
    sounds.send();
    haptics.medium();

    try {
      const res = await fetch(`/api/merchant/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryName: categoryName.trim() || "Popular Items",
          price: numericPrice,
          originalPrice: originalPrice ? parseInt(originalPrice, 10) : null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          preparationTime: preparationTime.trim() || "15 min",
          isVeg,
          isNonVeg: !isVeg,
          isAvailable,
          addons,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to update product");
      }

      sounds.ting();
      haptics.success();
      toast.success("Product updated successfully! 🎉");
      mutate();
      router.push("/merchant-portal/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProduct() {
    if (!confirm(`Are you sure you want to delete "${name || "this item"}"?`)) return;

    setIsDeleting(true);
    sounds.pop();
    haptics.heavy();

    try {
      const res = await fetch(`/api/merchant/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      toast.success("Product deleted from catalog");
      router.push("/merchant-portal/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20 pt-4 px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-2xl" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 pt-2 px-4 select-none">
      {/* ─── Top Navigation Header ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/merchant-portal/products"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Products</span>
        </Link>

        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDeleteProduct}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          <span>Delete Item</span>
        </button>
      </div>

      <form onSubmit={handleSaveProduct} className="space-y-5">
        {/* ─── Card 1: Product Photo & Live Visuals ─── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Item Photo &amp; Visual Preview
              </h2>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">High Quality 1:1</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative size-28 sm:size-32 rounded-2xl border-2 border-border overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center group shadow-xs">
              {imageUrl ? (
                <img src={imageUrl} alt="Product Preview" className="size-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                  <ImagePlus className="size-6 mb-1 opacity-50" />
                  <span className="text-[9px] font-bold">No Image</span>
                </div>
              )}
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-1 right-1 size-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-10 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Uploading Photo...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-3.5" />
                    <span>Upload New Photo</span>
                  </>
                )}
              </button>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL (Unsplash, ImgBB, etc.)"
                className="w-full h-10 rounded-xl bg-muted/30 border border-border px-3 text-xs font-medium text-foreground outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ─── Card 2: Core Details & Pricing ─── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Basic Information &amp; Pricing
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">Item Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cheese Masala Maggi"
                className="w-full h-11 rounded-2xl bg-muted/30 border border-border px-3.5 text-xs font-bold text-foreground outline-none focus:border-foreground transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="55"
                  className="w-full h-11 rounded-2xl bg-muted/30 border border-border px-3.5 text-xs font-bold text-foreground outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-muted-foreground">
                  Original Price (₹) <span className="opacity-60">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="70"
                  className="w-full h-11 rounded-2xl bg-muted/30 border border-border px-3.5 text-xs font-medium text-foreground outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">Menu Category / Section</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Maggi & Noodles"
                className="w-full h-11 rounded-2xl bg-muted/30 border border-border px-3.5 text-xs font-bold text-foreground outline-none focus:border-foreground transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_SECTIONS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      setCategoryName(sec);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                      categoryName === sec
                        ? "bg-foreground text-background font-black"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">
                Description / Ingredients <span className="opacity-60">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Double masala Maggi topped with melted mozzarella and fried onions."
                className="w-full rounded-2xl bg-muted/30 border border-border p-3 text-xs font-medium text-foreground outline-none resize-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ─── Card 3: Food Attributes & Availability ─── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Item Attributes &amp; Stock Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* In-Stock Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">Live Availability</p>
                <p className="text-[10px] text-muted-foreground">
                  {isAvailable ? "Item is in stock & orderable" : "Item marked as Sold Out"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setIsAvailable((prev) => !prev);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer",
                  isAvailable
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                )}
              >
                {isAvailable ? "In Stock" : "Sold Out"}
              </button>
            </div>

            {/* Veg / Non-Veg Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-border">
              <div>
                <p className="text-xs font-bold text-foreground">Dietary Classification</p>
                <p className="text-[10px] text-muted-foreground">
                  {isVeg ? "Pure Vegetarian item" : "Contains Egg or Meat"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setIsVeg((prev) => !prev);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer border",
                  isVeg
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                )}
              >
                <div className={cn("size-2 rounded-full", isVeg ? "bg-emerald-500" : "bg-amber-500")} />
                <span>{isVeg ? "Veg" : "Non-Veg"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Card 4: Dynamic Add-ons & Customizations ─── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Item Add-ons &amp; Customizations
              </h2>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{addons.length} configured</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure popular add-ons students can select when ordering (e.g. Extra Cheese +₹20, Double Egg
            +₹15).
          </p>

          {/* Current Add-ons List */}
          {addons.length > 0 ? (
            <div className="space-y-2 pt-1">
              {addons.map((addon, index) => (
                <div
                  key={`${addon.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-500 stroke-3" />
                    <span className="text-foreground">{addon.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                      +₹{addon.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(index)}
                      className="size-6 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center cursor-pointer transition-colors"
                      title="Remove add-on"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/20 border border-dashed border-border text-center text-xs text-muted-foreground">
              No add-ons configured for this item. Add custom options below or click suggested chips.
            </div>
          )}

          {/* Add Custom Add-on Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newAddonName}
              onChange={(e) => setNewAddonName(e.target.value)}
              placeholder="Add-on Name (e.g. Extra Mayo)"
              className="flex-1 h-10 rounded-xl bg-muted/30 border border-border px-3 text-xs font-bold text-foreground outline-none focus:border-foreground transition-colors"
            />
            <div className="relative w-24">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                +₹
              </span>
              <input
                type="number"
                min="0"
                value={newAddonPrice}
                onChange={(e) => setNewAddonPrice(e.target.value)}
                placeholder="15"
                className="w-full h-10 rounded-xl bg-muted/30 border border-border pl-8 pr-2 text-xs font-bold text-foreground outline-none focus:border-foreground transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddAddon()}
              className="h-10 px-3.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="size-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Quick Preset Suggested Addon Chips */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_ADDONS.map((sug) => {
                const isAdded = addons.some((a) => a.name.toLowerCase() === sug.name.toLowerCase());
                return (
                  <button
                    key={sug.name}
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddAddon(sug)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer",
                      isAdded
                        ? "bg-muted/40 text-muted-foreground/50 border border-transparent cursor-not-allowed"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50"
                    )}
                  >
                    <span>+ {sug.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">(₹{sug.price})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Sticky Save Button ─── */}
        <div className="sticky bottom-4 z-20 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-xs hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Product Changes...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Product Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
