"use client";

import { ArrowLeft, Copy, KeyRound, Loader2, RefreshCw, Send, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
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

  // Load institutions list
  const { data: collegesData } = useSWR<{ institutions: any[] }>("/api/colleges?limit=200", fetcher);
  const institutions = collegesData?.institutions || [];

  useEffect(() => {
    if (!loginPassword) {
      handleGeneratePassword();
    }
  }, []);

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
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `store@${rand}`;
    setLoginPassword(generated);
  }

  function handleCopyCredentials() {
    sounds.tap();
    haptics.medium();
    const text = `🏪 CampusLoop Merchant Portal Access\nStore: ${name || "Your Store"}\n🌐 Portal Login: https://campusloop.space/merchant-portal/login\n👤 Username: ${loginUsername}\n🔑 Password: ${loginPassword}\n\nInstall on your phone or open in browser to manage your store!`;
    navigator.clipboard.writeText(text);
    toast.success("Copied credentials to clipboard! 📋 Ready to share via WhatsApp/SMS.");
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
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Store className="size-4 text-emerald-500" />
            <span>1. Business Information &amp; Vertical</span>
          </h2>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Business / Store Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Momo House / Campus Wheel Rentals / Classic Cut Barber / Campus Dhobi"
              className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">
                Business Vertical Category *
              </span>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              >
                <option value="food">🍔 Food &amp; Canteens (Zomato style)</option>
                <option value="rentals">🚲 Bike &amp; Vehicle Rentals (Bounce style)</option>
                <option value="barber">✂️ Barber &amp; Salon Grooming (Urban Company style)</option>
                <option value="laundry">🧺 Laundry &amp; Dhobi Services (Per-Kg Wash)</option>
                <option value="water">💧 20L Water Can Delivery (Instant &amp; Pass)</option>
                <option value="essentials">🛒 Supermarket &amp; Campus Mart (Blinkit style)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Target College Campus *</span>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              >
                {institutions.length > 0 ? (
                  institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))
                ) : (
                  <option value="inst_35df75700bb23dd30311ef5f">Birla Institute of Technology, Mesra</option>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Store Description</span>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specialties, services offered, pricing overview, or operating hours..."
              className="w-full rounded-xl bg-muted/40 border border-border p-3 text-xs font-medium text-foreground outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Logo / DP URL</span>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-medium text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Cover / Banner URL</span>
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

        {/* Section 2: Contact & Fulfillment */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            2. Campus Location &amp; Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Phone Number (WhatsApp)</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-medium text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@domain.com"
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-medium text-foreground outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Physical Campus Address *</span>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Hostel 10 Gate / Student Activity Centre"
              className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Delivery Fee (₹)</span>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Min Order (₹)</span>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Prep / Turnaround</span>
              <input
                type="text"
                value={estimatedPrepTime}
                onChange={(e) => setEstimatedPrepTime(e.target.value)}
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Direct Plaintext Credentials Generator */}
        <div className="p-5 rounded-2xl bg-card border border-primary/30 space-y-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              <span>3. Direct Portal Login Credentials</span>
            </h2>
            <button
              type="button"
              onClick={handleCopyCredentials}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20"
            >
              <Copy className="size-3" />
              <span>Copy for WhatsApp</span>
            </button>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Stored directly as plaintext so you can copy and share them instantly with local shopkeepers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Login Username</span>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="e.g. momohouse"
                className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 text-xs font-mono font-bold text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground">Plaintext Password</span>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="size-2.5" />
                  <span>Regenerate</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="e.g. store@k8f2a"
                  className="w-full h-11 rounded-xl bg-muted/40 border border-border px-3.5 pr-9 text-xs font-mono font-bold text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
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
