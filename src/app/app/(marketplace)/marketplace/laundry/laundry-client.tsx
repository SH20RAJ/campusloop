"use client";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Truck,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { InstagramIcon } from "@/components/ui/social-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface LaundryMarketplaceClientProps {
  profileId: string;
  collegeName?: string;
}

export function LaundryMarketplaceClient({ profileId, collegeName = "Campus Hub" }: LaundryMarketplaceClientProps) {
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [hostelName, setHostelName] = useState("Hostel 7");
  const [roomNumber, setRoomNumber] = useState("");
  const [clothesWeightKg, setClothesWeightKg] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: storesData, isLoading } = useSWR<{ stores: any[] }>(
    `/api/marketplace/stores?category=laundry`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const { data: productsData } = useSWR<{ products: any[] }>(
    `/api/marketplace/products?category=laundry&limit=20`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const laundryStores = storesData?.stores || [];
  const packages = productsData?.products || [];
  const primaryLaundry = laundryStores[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Truck className="size-3.5" />
            <span>Hostel Doorstep Pickup &amp; Drop</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Hostel Laundry Express &amp; Steam Press
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            Tired of hand washing clothes? Get wash &amp; fold, steam pressing, and dry cleaning picked up directly from your hostel wing in {collegeName}.
          </p>
        </div>

        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none">
          <Shirt className="size-48" />
        </div>
      </div>

      {/* ─── Doorstep Pickup Quick Banner ─── */}
      <div className="rounded-3xl border border-blue-500/30 bg-blue-500/5 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Package className="size-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-foreground">
              Schedule Hostel Doorstep Pickup
            </h3>
            <p className="text-xs text-muted-foreground">
              Our campus dhobi will collect your laundry bag from your room door in 30 mins.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.tap();
            haptics.medium();
            setShowPickupModal(true);
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          Book Pickup Now 🧺
        </button>
      </div>

      {/* ─── Laundry Service Packages ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Laundry Rates &amp; Packages ({packages.length || 5})
          </h2>
          <span className="text-xs text-muted-foreground font-medium">24-Hr Express Delivery</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl border border-border bg-card p-4 space-y-2">
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group rounded-2xl border border-border bg-card hover:border-blue-500/40 hover:shadow-md transition-all p-4 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-foreground group-hover:text-blue-500 transition-colors truncate">
                      {pkg.name}
                    </h4>
                    {pkg.isPopular && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase shrink-0">
                        Popular
                      </span>
                    )}
                  </div>
                  {pkg.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-foreground">₹{pkg.price}</span>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-muted-foreground line-through font-medium">
                        ₹{pkg.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setSelectedPackage(pkg);
                    setShowPickupModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-muted/80 hover:bg-blue-600 hover:text-white text-foreground text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 shadow-2xs"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Hostel Doorstep Pickup Modal ─── */}
      {showPickupModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowPickupModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                  Hostel Doorstep Pickup
                </span>
                <h3 className="text-base font-black text-foreground">
                  {selectedPackage?.name || "Laundry Wash & Fold Pickup"}
                </h3>
                <p className="text-xs text-muted-foreground">Pickup from your room door</p>
              </div>
              <div className="size-10 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-black">
                <Shirt className="size-5" />
              </div>
            </div>

            {/* Hostel Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Select Hostel</label>
              <select
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/50 text-xs font-medium outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((h) => (
                  <option key={h} value={`Hostel ${h}`}>
                    Hostel {h} (Boys/Girls Wing)
                  </option>
                ))}
              </select>
            </div>

            {/* Room Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Room Number &amp; Floor</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 312, 3rd Floor"
                className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-medium outline-none focus:border-blue-500"
              />
            </div>

            {/* Approx Weight */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Approx Load Weight</span>
                <span className="text-blue-500">{clothesWeightKg} KG</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={clothesWeightKg}
                onChange={(e) => setClothesWeightKg(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Fare Calculation */}
            <div className="p-3 rounded-2xl bg-muted/60 border border-border/40 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated Cost (~{clothesWeightKg} KG)</span>
                <span className="font-black text-foreground">₹{clothesWeightKg * 35}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Turnaround Time</span>
                <span className="font-bold text-emerald-500">24 Hours (Next Day Drop)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPickupModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (!roomNumber.trim()) {
                    alert("Please enter your room number & floor");
                    return;
                  }
                  setIsSubmitting(true);
                  sounds.success();
                  haptics.medium();
                  setTimeout(() => {
                    setIsSubmitting(false);
                    setShowPickupModal(false);
                    alert(`Pickup Scheduled! 🧺\nPickup from ${hostelName}, ${roomNumber}. Our laundry partner will arrive in ~25 mins.`);
                  }, 700);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                {isSubmitting ? "Scheduling..." : "Confirm Pickup 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Campus Onboarding & Expansion Banner (Instagram Highlighted) ─── */}
      <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase tracking-wider">
              <span>🚀 Want this at your campus?</span>
            </div>
            <h4 className="text-sm font-black text-foreground">
              Bring CampusLoop Laundry Express to Your College
            </h4>
            <p className="text-[11px] text-muted-foreground max-w-md">
              We partner with local dhobis and industrial laundries for fast hostel pickups. Contact us on Instagram to onboard your campus laundry!
            </p>
          </div>
          <a
            href="https://www.instagram.com/campusloop.space/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-xs font-black shadow-md hover:opacity-95 transition-transform active:scale-95 shrink-0"
          >
            <InstagramIcon className="size-3.5" />
            <span>DM @campusloop.space</span>
          </a>
        </div>
      </div>
    </div>
  );
}
