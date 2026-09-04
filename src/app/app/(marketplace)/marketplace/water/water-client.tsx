"use client";

import { CheckCircle2, Clock, Droplet, Flame, Home, MapPin, Minus, Plus, ShieldCheck, Zap, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { InstagramIcon } from "@/components/ui/social-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface WaterMarketplaceClientProps {
  profileId: string;
  collegeName?: string;
}

export function WaterMarketplaceClient({
  profileId,
  collegeName = "Campus Hub",
}: WaterMarketplaceClientProps) {
  const [selectedCan, setSelectedCan] = useState<any | null>(null);
  const [canCount, setCanCount] = useState(1);
  const [hostelName, setHostelName] = useState("Hostel 7");
  const [roomNumber, setRoomNumber] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: storesData, isLoading } = useSWR<{ stores: any[] }>(
    `/api/marketplace/stores?category=water`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const { data: productsData } = useSWR<{ products: any[] }>(
    `/api/marketplace/products?category=water&limit=20`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const waterStores = storesData?.stores || [];
  const products = productsData?.products || [];
  const primarySupplier = waterStores[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none">
      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Droplet className="size-3.5 fill-cyan-300 text-cyan-300" />
            <span>Pure RO Chilled Drinking Water</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            20L Water Can Delivery to Hostel Rooms
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            Never lug heavy 20-litre water jars up hostel stairs again. 1-tap room floor delivery in 20–25
            mins across {collegeName}.
          </p>
        </div>

        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none">
          <Droplet className="size-48" />
        </div>
      </div>

      {/* ─── 1-Tap Quick Order Box ─── */}
      <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Droplet className="size-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-foreground">Express 20L Jar Delivery</h3>
            <p className="text-xs text-muted-foreground">
              Delivered directly outside your room door on your hostel floor.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.tap();
            haptics.medium();
            setSelectedCan(products[0] || { name: "20L Chilled RO Water Jar", price: 30 });
            setShowOrderModal(true);
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          Deliver to My Room 💧
        </button>
      </div>

      {/* ─── Water Can Options & Passes ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Water Cans &amp; Semester Passes ({products.length || 4})
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Delivered to All Hostel Floors</span>
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
            {products.map((prod) => (
              <div
                key={prod.id}
                className="group rounded-2xl border border-border bg-card hover:border-cyan-500/40 hover:shadow-md transition-all p-4 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-foreground group-hover:text-cyan-500 transition-colors truncate">
                      {prod.name}
                    </h4>
                    {prod.isPopular && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase shrink-0">
                        Bestseller
                      </span>
                    )}
                  </div>
                  {prod.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-foreground">₹{prod.price}</span>
                    {prod.originalPrice && prod.originalPrice > prod.price && (
                      <span className="text-xs text-muted-foreground line-through font-medium">
                        ₹{prod.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setSelectedCan(prod);
                    setShowOrderModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-muted/80 hover:bg-cyan-600 hover:text-white text-foreground text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 shadow-2xs"
                >
                  Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Room Delivery Booking Modal ─── */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowOrderModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500">
                  Hostel Room Delivery
                </span>
                <h3 className="text-base font-black text-foreground">
                  {selectedCan?.name || "20L Chilled RO Water Jar"}
                </h3>
                <p className="text-xs text-muted-foreground font-bold">
                  ₹{selectedCan?.price || 30} each · Cash/UPI on Delivery
                </p>
              </div>
              <div className="size-10 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center font-black">
                <Droplet className="size-5" />
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/40">
              <span className="text-xs font-bold text-foreground">Number of Jars</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCanCount((prev) => Math.max(1, prev - 1))}
                  className="size-7 rounded-lg bg-card border border-border flex items-center justify-center font-black cursor-pointer hover:bg-muted"
                >
                  <Minus className="size-3" />
                </button>
                <span className="text-sm font-black min-w-[20px] text-center">{canCount}</span>
                <button
                  type="button"
                  onClick={() => setCanCount((prev) => Math.min(5, prev + 1))}
                  className="size-7 rounded-lg bg-card border border-border flex items-center justify-center font-black cursor-pointer hover:bg-muted"
                >
                  <Plus className="size-3" />
                </button>
              </div>
            </div>

            {/* Hostel Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Select Hostel</label>
              <select
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-muted/50 text-xs font-medium outline-none focus:border-cyan-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((h) => (
                  <option key={h} value={`Hostel ${h}`}>
                    Hostel {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Number & Floor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Room Number &amp; Floor</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Room 204, 2nd Floor"
                className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-medium outline-none focus:border-cyan-500"
              />
            </div>

            {/* Total Fare Calculation */}
            <div className="p-3 rounded-2xl bg-muted/60 border border-border/40 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Total Price ({canCount} × ₹{selectedCan?.price || 30})
                </span>
                <span className="font-black text-foreground">₹{canCount * (selectedCan?.price || 30)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery Time</span>
                <span className="font-bold text-emerald-500">~20–25 Mins to Room</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
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
                    setShowOrderModal(false);
                    alert(
                      `Order Placed! 💧\n${canCount} Jar(s) arriving at ${hostelName}, ${roomNumber} in ~20 mins.`
                    );
                  }, 700);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                {isSubmitting ? "Dispatching..." : "Confirm Delivery 💧"}
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
              Bring 20L Water Delivery to Your College Hostels
            </h4>
            <p className="text-[11px] text-muted-foreground max-w-md">
              We connect campus water plants and delivery agents directly to hostel students. Contact us on
              Instagram!
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
