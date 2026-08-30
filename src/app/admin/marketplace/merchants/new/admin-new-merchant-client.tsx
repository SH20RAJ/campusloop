"use client";

import { ArrowLeft, Copy, KeyRound, Loader2, RefreshCw, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

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
  const [logoUrl, setLogoUrl] = useState(
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop"
  );
  const [coverUrl, setCoverUrl] = useState(
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&h=400&fit=crop"
  );

  // Portal Credentials
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(newName: string) {
    setName(newName);
    if (!loginUsername) {
      const suggested = newName.toLowerCase().replace(/[^a-z0-9]/g, "");
      setLoginUsername(suggested);
    }
  }

  function handleGeneratePassword() {
    sounds.pop();
    haptics.light();
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let rand = "";
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `cl_${rand}!`;
    setLoginPassword(generated);
    toast.success("Generated strong merchant password!");
  }

  function handleCopyCredentials() {
    sounds.tap();
    const text = `CampusLoop Merchant Portal Credentials\nStore: ${name}\nURL: https://campusloop.space/merchant-portal/login\nUsername: ${loginUsername}\nPassword: ${loginPassword}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied credentials to clipboard! 📋");
  }

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
          logoUrl: logoUrl.trim(),
          coverUrl: coverUrl.trim(),
          loginUsername: loginUsername.trim() || undefined,
          loginPassword: loginPassword.trim() || undefined,
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
          <h1 className="text-xl font-black tracking-tight text-foreground">Onboard New Campus Merchant</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Register a verified local business and generate direct portal login credentials
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Business Information */}
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
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Momo House / Sharma Ji Canteen / Campus Wheel Rentals"
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
                <option value="rentals">Vehicle &amp; Bike Rentals</option>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Logo / Profile Picture URL</span>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-medium text-foreground outline-none"
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
                placeholder="https://..."
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-medium text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location & Fulfillment */}
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
              <span className="text-[11px] font-bold text-muted-foreground">
                Location Pin (e.g. 200m from Gate)
              </span>
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

        {/* Section 3: Portal Login Credentials */}
        <div className="p-5 rounded-2xl bg-card border border-emerald-500/30 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                3. Merchant Portal Credentials
              </h2>
            </div>
            {loginUsername && loginPassword && (
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] font-bold text-foreground cursor-pointer transition-colors"
              >
                <Copy className="size-3" />
                <span>Copy Credentials</span>
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            The merchant will log in at{" "}
            <code className="text-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              /merchant-portal/login
            </code>{" "}
            with these credentials to manage their menu and live orders.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Login Username</span>
              <div className="relative">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. momohouse"
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-mono font-bold text-foreground outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Password</span>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="size-2.5" />
                  <span>Generate Password</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="e.g. cl_momo982!"
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 pr-9 text-xs font-mono font-bold text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground"
                  title="Generate Password"
                >
                  <KeyRound className="size-4" />
                </button>
              </div>
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
