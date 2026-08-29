"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bike,
  BookOpen,
  CheckCircle2,
  Compass,
  Home,
  ImagePlus,
  Info,
  Laptop,
  Loader2,
  MapPin,
  Plus,
  Send,
  Shirt,
  ShoppingBag,
  Tag,
  Trash2,
  Wind,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface CreateListingClientProps {
  profileId: string;
}

const CATEGORIES = [
  { id: "Cycles", label: "Cycles & Bikes", icon: Bike, hint: "Gear cycles, city bikes, locks" },
  { id: "Textbooks", label: "Textbooks & Notes", icon: BookOpen, hint: "Semester books, GATE prep" },
  { id: "Coolers", label: "Coolers & Fans", icon: Wind, hint: "Desert coolers, table fans" },
  { id: "Electronics", label: "Electronics", icon: Laptop, hint: "Monitors, keyboards, calculators" },
  { id: "Lab Coats", label: "Drafters & Tools", icon: Compass, hint: "Mini drafters, drawing boards" },
  { id: "Furniture", label: "Mattresses & Furniture", icon: Home, hint: "Hostel mattresses, study tables" },
  { id: "Other", label: "Hostel Essentials", icon: Tag, hint: "Kettles, gym gear, curtains" },
] as const;

const CONDITIONS = [
  { id: "BRAND_NEW", label: "Brand New", desc: "Never opened / unused" },
  { id: "LIKE_NEW", label: "Like New", desc: "Used gently, zero flaws" },
  { id: "GOOD", label: "Good Condition", desc: "Working well, minor wear" },
  { id: "FAIR", label: "Fair / Used", desc: "Visible wear, fully functional" },
] as const;

export function CreateListingClient({ profileId }: CreateListingClientProps) {
  const router = useRouter();

  const [category, setCategory] = useState<string>("Cycles");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [condition, setCondition] = useState<string>("GOOD");
  const [hostelLocation, setHostelLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const discountPercent =
    price && originalPrice && Number(originalPrice) > Number(price)
      ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
      : null;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= 4) {
      toast.warning("Maximum 4 photos per listing");
      return;
    }

    setIsUploadingImage(true);
    sounds.pop();
    haptics.light();

    try {
      toast.loading("Uploading listing photo...", { id: "upload-img" });
      const file = files[0];
      const res = await uploadImageToImgBB(file);
      const url = res.displayUrl || res.url;
      setImages((prev) => [...prev, url]);
      toast.success("Photo attached! 📸", { id: "upload-img" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo", { id: "upload-img" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(index: number) {
    sounds.tap();
    haptics.light();
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please provide an item title");
      return;
    }

    const numericPrice = parseInt(price, 10);
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error("Please specify a valid price in Rupees");
      return;
    }

    if (!hostelLocation.trim()) {
      toast.error("Please add a campus pickup spot (e.g. Hostel 11 or Library)");
      return;
    }

    sounds.send();
    haptics.success();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/communities/hub/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hubType: "marketplace",
          title: title.trim(),
          description: description.trim() || undefined,
          price: numericPrice,
          originalPrice: originalPrice ? parseInt(originalPrice, 10) : undefined,
          condition,
          category,
          hostelLocation: hostelLocation.trim(),
          isNegotiable,
          images: images.length > 0 ? images : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData?.error || "Failed to create listing");
      }

      toast.success("Item listed on Buy & Sell Hub! 🎉");
      mutate((key) => typeof key === "string" && key.includes("/api/communities/feed"));
      router.push("/app/buy-and-sell");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post listing");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              router.back();
            }}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">
              Sell Campus Gear
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              List items for batchmates on your campus
            </p>
          </div>
        </div>
      </header>

      {/* ─── Listing Creation Form ─── */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 1. Category Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            1. Select Item Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setCategory(cat.id);
                  }}
                  className={cn(
                    "flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs active:scale-98",
                    isSelected
                      ? "bg-foreground text-background border-foreground font-black shadow-xs"
                      : "bg-muted/40 text-foreground border-border/40 hover:border-border hover:bg-muted/60"
                  )}
                >
                  <Icon className={cn("size-5 mb-1.5", isSelected ? "text-background" : "text-primary")} />
                  <span className="text-xs font-bold leading-snug">{cat.label}</span>
                  <span className={cn("text-[10px] mt-0.5 line-clamp-1", isSelected ? "text-background/75" : "text-muted-foreground")}>
                    {cat.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Photo Upload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Add Photos ({images.length}/4)
            </label>
            <span className="text-[11px] text-muted-foreground">Optional, but boosts sales 3x</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {images.map((url, i) => (
              <div key={url} className="relative size-20 rounded-2xl overflow-hidden border border-border/50 bg-muted group">
                <img src={url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer hover:bg-black"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            {images.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="size-20 rounded-2xl border-2 border-dashed border-border/70 hover:border-foreground/40 bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
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
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* 3. Item Title & Description */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hero Sprint 21-Speed Gear Cycle / Symphony 35L Cooler"
              maxLength={80}
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:bg-background outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description & Accessories
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Used for 2 semesters, recently serviced, working honeycomb pads, includes heavy duty number lock..."
              maxLength={400}
              className="w-full rounded-2xl bg-muted/40 border border-border/50 p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:bg-background outline-none resize-none transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* 4. Pricing & Negotiation */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            4. Pricing Details
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">Selling Price (₹) *</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500"
                  className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 pl-8 pr-3 text-sm font-black text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:bg-background outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">Original MRP (Optional)</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">₹</span>
                <input
                  type="number"
                  min="0"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="4500"
                  className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 pl-8 pr-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:bg-background outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {discountPercent !== null && discountPercent > 0 && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Great deal! You are offering a {discountPercent}% discount off original MRP.</span>
            </div>
          )}

          {/* Negotiable Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={isNegotiable}
              onChange={(e) => setIsNegotiable(e.target.checked)}
              className="size-4 rounded accent-foreground cursor-pointer"
            />
            <span className="text-xs font-semibold text-foreground">
              Price is negotiable for quick campus pickup
            </span>
          </label>
        </div>

        {/* 5. Condition Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            5. Item Condition
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((cond) => {
              const isSelected = condition === cond.id;
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setCondition(cond.id);
                  }}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs active:scale-98",
                    isSelected
                      ? "bg-foreground text-background border-foreground font-black shadow-xs"
                      : "bg-muted/40 text-foreground border-border/40 hover:border-border hover:bg-muted/60"
                  )}
                >
                  <p className="text-xs font-bold">{cond.label}</p>
                  <p className={cn("text-[10px] mt-0.5", isSelected ? "text-background/75" : "text-muted-foreground")}>
                    {cond.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Campus Pickup Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            6. Campus Pickup Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-rose-500" />
            <input
              type="text"
              required
              value={hostelLocation}
              onChange={(e) => setHostelLocation(e.target.value)}
              placeholder="e.g. Hostel 11 Cycle Stand / Central Library / Day Scholar Gate"
              maxLength={60}
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 pl-10 pr-3.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:bg-background outline-none transition-all"
            />
          </div>
        </div>

        {/* 7. Submit Action Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Post on Buy & Sell Hub</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
