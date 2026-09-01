"use client";

import { Copy, ExternalLink, Loader2, Save, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

export function MerchantStoreClient() {
  const { data, isLoading, mutate } = useSWR<{ merchant: any; hours: any[] }>(
    "/api/merchant/store",
    fetcher,
    { dedupingInterval: 15000 }
  );

  const merchant = data?.merchant;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [locationPin, setLocationPin] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("20");
  const [minOrderValue, setMinOrderValue] = useState("80");
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState("299");
  const [estimatedPrepTime, setEstimatedPrepTime] = useState("15–25 min");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(true);
  const [isPickupEnabled, setIsPickupEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (merchant) {
      setName(merchant.name || "");
      setDescription(merchant.description || "");
      setPhone(merchant.phone || "");
      setAddress(merchant.address || "");
      setLocationPin(merchant.locationPin || "");
      setDeliveryFee(String(merchant.deliveryFee || 20));
      setMinOrderValue(String(merchant.minOrderValue || 80));
      setFreeDeliveryAbove(merchant.freeDeliveryAbove ? String(merchant.freeDeliveryAbove) : "");
      setEstimatedPrepTime(merchant.estimatedPrepTime || "15–25 min");
      setPickupInstructions(merchant.pickupInstructions || "");
      setIsDeliveryEnabled(merchant.isDeliveryEnabled !== false);
      setIsPickupEnabled(merchant.isPickupEnabled !== false);
    }
  }, [merchant]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    sounds.send();
    haptics.success();
    setIsSaving(true);

    try {
      const res = await fetch("/api/merchant/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          phone: phone.trim(),
          address: address.trim(),
          locationPin: locationPin.trim(),
          deliveryFee: parseInt(deliveryFee, 10) || 0,
          minOrderValue: parseInt(minOrderValue, 10) || 0,
          freeDeliveryAbove: freeDeliveryAbove ? parseInt(freeDeliveryAbove, 10) : null,
          estimatedPrepTime: estimatedPrepTime.trim(),
          pickupInstructions: pickupInstructions.trim(),
          isDeliveryEnabled,
          isPickupEnabled,
        }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success("Store settings updated! 🎉");
    } catch {
      toast.error("Failed to update store settings");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCopyLink() {
    if (!merchant?.id) return;
    sounds.tap();
    haptics.light();
    navigator.clipboard.writeText(`https://campusloop.space/app/marketplace/store/${merchant.id}`);
    toast.success("Store link copied to clipboard! 📋");
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6 select-none pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/40 p-5 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">Store Profile &amp; Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure business details, delivery radius, and prep timing
          </p>
        </div>

        {merchant?.id && (
          <div className="flex items-center gap-2">
            <Link
              href={`/app/marketplace/store/${merchant.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors"
            >
              <ExternalLink className="size-3.5 text-primary" />
              <span>Open Store ↗</span>
            </Link>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors cursor-pointer"
            >
              <Copy className="size-3.5" />
              <span>Copy Link</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic Store Info */}
        <div className="rounded-3xl border border-border/40 bg-card p-5 space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Store className="size-4 text-primary" />
            <span>Store Details</span>
          </h2>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Business Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Store Description</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl bg-muted/40 border border-border/50 p-3 text-xs font-medium text-foreground focus:border-foreground outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Contact Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">
                Location Pin (e.g. 250m from Gate)
              </span>
              <input
                type="text"
                value={locationPin}
                onChange={(e) => setLocationPin(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Campus Address *</span>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
            />
          </div>
        </div>

        {/* Fulfillment & Delivery Rules */}
        <div className="rounded-3xl border border-border/40 bg-card p-5 space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Truck className="size-4 text-emerald-500" />
            <span>Fulfillment &amp; Delivery Rules</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 rounded-2xl border border-border/40 bg-muted/30 cursor-pointer">
              <input
                type="checkbox"
                checked={isDeliveryEnabled}
                onChange={(e) => setIsDeliveryEnabled(e.target.checked)}
                className="size-4 rounded accent-emerald-500"
              />
              <span className="text-xs font-bold">Delivery Enabled</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-2xl border border-border/40 bg-muted/30 cursor-pointer">
              <input
                type="checkbox"
                checked={isPickupEnabled}
                onChange={(e) => setIsPickupEnabled(e.target.checked)}
                className="size-4 rounded accent-emerald-500"
              />
              <span className="text-xs font-bold">Pickup Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Delivery Fee (₹)</span>
              <input
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-black text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Min Order (₹)</span>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-black text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Free Delivery Above (₹)</span>
              <input
                type="number"
                min="0"
                value={freeDeliveryAbove}
                onChange={(e) => setFreeDeliveryAbove(e.target.value)}
                placeholder="299"
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-black text-foreground outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Estimated Prep Timing</span>
            <input
              type="text"
              value={estimatedPrepTime}
              onChange={(e) => setEstimatedPrepTime(e.target.value)}
              placeholder="e.g. 15–20 min"
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">
              Pickup Instructions for Students
            </span>
            <input
              type="text"
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="Collect from main counter by showing your order number"
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-medium text-foreground outline-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Save Store Settings</span>
            </>
          )}
        </button>
      </form>
    </main>
  );
}
