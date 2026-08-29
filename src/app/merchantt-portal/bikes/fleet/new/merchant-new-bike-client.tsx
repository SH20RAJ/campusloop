"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bike,
  Check,
  Fuel,
  Gauge,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function MerchantNewBikeClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [dailyPrice, setDailyPrice] = useState("350");
  const [hourlyPrice, setHourlyPrice] = useState("50");
  const [securityDeposit, setSecurityDeposit] = useState("1500");
  const [pickupLocation, setPickupLocation] = useState("Campus Gate 1 Stand");
  const [fuelType, setFuelType] = useState<"PETROL" | "ELECTRIC">("PETROL");
  const [mileage, setMileage] = useState("45 kmpl");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    sounds.pop();
    haptics.light();

    try {
      toast.loading("Uploading bike photo...", { id: "upload-bike" });
      const res = await uploadImageToImgBB(files[0]);
      setImageUrl(res.displayUrl || res.url);
      toast.success("Photo attached! 📸", { id: "upload-bike" });
    } catch {
      toast.error("Failed to upload image", { id: "upload-bike" });
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !registrationNumber.trim()) {
      toast.error("Bike name and registration number are required");
      return;
    }

    const numDailyPrice = parseInt(dailyPrice, 10);
    if (isNaN(numDailyPrice) || numDailyPrice <= 0) {
      toast.error("Please enter a valid daily rental price");
      return;
    }

    sounds.send();
    haptics.success();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/merchant/bikes/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          model: model.trim() || name.trim(),
          registrationNumber: registrationNumber.trim().toUpperCase(),
          dailyPrice: numDailyPrice,
          hourlyPrice: parseInt(hourlyPrice, 10) || 50,
          securityDeposit: parseInt(securityDeposit, 10) || 1500,
          pickupLocation: pickupLocation.trim() || "Campus Gate 1 Stand",
          fuelType,
          imageUrl:
            imageUrl ||
            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop",
          specs: {
            mileage: mileage.trim() || "45 kmpl",
            helmetIncluded: true,
          },
          status: "AVAILABLE",
        }),
      });

      if (!res.ok) throw new Error("Failed to add vehicle");

      toast.success("Bike added to fleet! 🛵");
      router.push("/merchantt-portal/bikes/fleet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add bike");
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
            Add Bike to Fleet
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            Register a scooter, motorcycle, or EV for campus rentals
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Vehicle Photo
          </label>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="relative size-24 rounded-2xl overflow-hidden border border-border bg-muted">
                <img src={imageUrl} alt="Preview" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="size-24 rounded-2xl border-2 border-dashed border-border hover:border-foreground/40 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
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

        {/* Basic Vehicle Info */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-3 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            1. Vehicle Details
          </h2>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground">
              Bike / Scooter Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Honda Activa 6G #03"
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">
                Model Name
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Activa 6G / Splendor Plus"
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">
                Registration Plate # *
              </label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. JH-01-AX-4822"
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground outline-none"
              >
                <option value="PETROL">Petrol</option>
                <option value="ELECTRIC">Electric (EV)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">
                Mileage / Range
              </label>
              <input
                type="text"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 45 kmpl or 105 km"
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Pickup Location */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-3 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            2. Rental Pricing &amp; Security Deposit
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">
                Daily Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-black text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">
                Hourly Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={hourlyPrice}
                onChange={(e) => setHourlyPrice(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-black text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">
                Deposit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-black text-foreground outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground">
              Pickup Stand Location
            </label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Campus Gate 1 Stand / Hostel 11 Parking"
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Adding Vehicle...</span>
              </>
            ) : (
              <>
                <Check className="size-4 stroke-[3]" />
                <span>Add Bike to Fleet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
