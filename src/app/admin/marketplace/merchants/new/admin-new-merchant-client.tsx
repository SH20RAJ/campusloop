"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { ArrowLeft, Loader2, Send, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function AdminNewMerchantClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState("food");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [locationPin, setLocationPin] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("20");
  const [minOrderValue, setMinOrderValue] = useState("80");
  const [estimatedPrepTime, setEstimatedPrepTime] = useState("15–20 min");
  const [institutionId, setInstitutionId] = useState("inst_35df75700bb23dd30311ef5f"); // BIT Mesra default
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      toast.error("Please provide a business name and campus address");
      return;
    }

    sounds.send();
    haptics.success();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/marketplace/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categorySlug,
          description: description.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim(),
          locationPin: locationPin.trim() || undefined,
          deliveryFee: parseInt(deliveryFee, 10) || 0,
          minOrderValue: parseInt(minOrderValue, 10) || 0,
          estimatedPrepTime: estimatedPrepTime.trim(),
          institutionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to onboard merchant");

      toast.success("Merchant Onboarded Successfully! 🎉");
      router.push("/admin/marketplace");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create merchant");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link
          href="/admin/marketplace"
          className="flex size-9 items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4.5" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Onboard New Campus Merchant
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Register a verified local business to sell on the student marketplace
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            1. Business Information
          </h2>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Business / Store Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Canteen Corner / Chai Point / SpeedWheel Rentals"
              className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Business Category *</span>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              >
                <option value="food">Food &amp; Canteens</option>
                <option value="essentials">Essentials &amp; Groceries</option>
                <option value="services">Local Services (Laundry, Repairs)</option>
                <option value="rentals">Vehicle &amp; Gear Rentals</option>
                <option value="activities">Activities &amp; Outings</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Target Campus *</span>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              >
                <option value="inst_35df75700bb23dd30311ef5f">Birla Institute of Technology, Mesra</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Store Description</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specialties, cuisine type, or rental equipment..."
              className="w-full rounded-xl bg-muted/40 border border-border p-3 text-xs font-medium text-foreground outline-none resize-none"
            />
          </div>
        </div>

        {/* Location & Fulfillment */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            2. Campus Location &amp; Fulfillment
          </h2>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Campus Address *</span>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Gate Market Complex, Shop No. 4"
              className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Location Pin (e.g. 200m from Gate)</span>
              <input
                type="text"
                value={locationPin}
                onChange={(e) => setLocationPin(e.target.value)}
                placeholder="e.g. 200m from Inner Circle"
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Delivery Fee (₹)</span>
              <input
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-black text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Onboarding Merchant...</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span>Publish &amp; Activate Merchant</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
