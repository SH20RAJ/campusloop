"use client";

import { ArrowLeft, ImagePlus, Loader2, Send, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";

export function NewProductClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("Popular Items");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [preparationTime, setPreparationTime] = useState("15 min");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Addons state
  const [addons, setAddons] = useState<Array<{ name: string; price: number }>>([]);
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      toast.success("Image attached! 📸", { id: "upload-prod" });
    } catch {
      toast.error("Failed to upload image", { id: "upload-prod" });
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleAddAddon() {
    if (!addonName.trim() || !addonPrice) return;
    sounds.tap();
    haptics.light();
    setAddons((prev) => [
      ...prev,
      { name: addonName.trim(), price: Math.max(0, parseInt(addonPrice, 10) || 0) },
    ]);
    setAddonName("");
    setAddonPrice("");
  }

  function handleRemoveAddon(index: number) {
    sounds.tap();
    haptics.light();
    setAddons((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const numericPrice = parseInt(price, 10);
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error("Please provide a valid price in Rupees");
      return;
    }

    sounds.send();
    haptics.success();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryName: categoryName.trim(),
          price: numericPrice,
          originalPrice: originalPrice ? parseInt(originalPrice, 10) : undefined,
          preparationTime,
          description: description.trim() || undefined,
          imageUrl,
          addons,
        }),
      });

      if (!res.ok) throw new Error("Failed to add product");

      toast.success("Product added to menu! 🎉");
      router.push("/merchant-portal/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create product");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6 select-none pb-24">
      {/* ─── Header ─── */}
      <header className="flex h-14 items-center gap-3 border-b border-border/30">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4.5" />
        </button>
        <div>
          <h1 className="text-base font-black text-foreground tracking-tight leading-none">
            Add New Product
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            Add a dish, essential, or rental item to your catalog
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Photo */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Product Photo
          </label>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="relative size-24 rounded-2xl overflow-hidden border border-border/50 bg-muted">
                <img src={imageUrl} alt="Preview" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="size-24 rounded-2xl border-2 border-dashed border-border/70 hover:border-foreground/40 bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                {isUploadingImage ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="size-5 mb-1" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Name & Category */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Steamed Chicken Momo (8 pcs)"
              className="w-full h-11 rounded-2xl bg-card border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Menu Category *
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Momos / Rolls / Beverages / Daily Rentals"
              className="w-full h-11 rounded-2xl bg-card border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="90"
              className="w-full h-11 rounded-2xl bg-card border border-border/50 px-3.5 text-xs font-black text-foreground focus:border-foreground outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Original MRP (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="110"
              className="w-full h-11 rounded-2xl bg-card border border-border/50 px-3.5 text-xs font-medium text-foreground focus:border-foreground outline-none"
            />
          </div>
        </div>

        {/* Description & Prep Time */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Preparation Time
            </label>
            <input
              type="text"
              value={preparationTime}
              onChange={(e) => setPreparationTime(e.target.value)}
              placeholder="e.g. 15 min / 24 hrs"
              className="w-full h-11 rounded-2xl bg-card border border-border/50 px-3.5 text-xs font-medium text-foreground focus:border-foreground outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Item Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of taste, ingredients, or accessories included..."
              className="w-full rounded-2xl bg-card border border-border/50 p-3 text-xs font-medium text-foreground focus:border-foreground outline-none resize-none"
            />
          </div>
        </div>

        {/* Add-ons Builder */}
        <div className="space-y-2 pt-2 border-t border-border/30">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Add-ons &amp; Extras (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={addonName}
              onChange={(e) => setAddonName(e.target.value)}
              placeholder="Add-on Name (e.g. Extra Chutney)"
              className="flex-1 h-10 rounded-2xl bg-card border border-border/50 px-3 text-xs font-medium text-foreground outline-none"
            />
            <input
              type="number"
              value={addonPrice}
              onChange={(e) => setAddonPrice(e.target.value)}
              placeholder="₹10"
              className="w-20 h-10 rounded-2xl bg-card border border-border/50 px-3 text-xs font-bold text-foreground outline-none"
            />
            <button
              type="button"
              onClick={handleAddAddon}
              className="px-3.5 h-10 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs cursor-pointer"
            >
              + Add
            </button>
          </div>

          {addons.length > 0 && (
            <div className="space-y-1 pt-1">
              {addons.map((a, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs font-semibold"
                >
                  <span>{a.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-500">+₹{a.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Publishing Product...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Save &amp; Publish to Store</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
