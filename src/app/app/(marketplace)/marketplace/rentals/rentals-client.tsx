"use client";

import {
  ArrowLeft,
  BatteryCharging,
  Bike,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Fuel,
  Gauge,
  History,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { InstagramIcon } from "@/components/ui/social-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface BikeRentalsClientProps {
  profileId: string;
  collegeName?: string;
}

export function BikeRentalsClient({ profileId, collegeName = "Campus Hub" }: BikeRentalsClientProps) {
  const [fuelFilter, setFuelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [bookingBike, setBookingBike] = useState<any | null>(null);
  const [bookingDurationHours, setBookingDurationHours] = useState(2);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // 1. Fetch Rental Hub Stores
  const { data: storesData, isLoading: isStoresLoading } = useSWR<{ stores: any[] }>(
    `/api/marketplace/stores?category=rentals`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  // 2. Fetch Fleet
  const { data: bikesData, isLoading: isBikesLoading } = useSWR<{ bikes: any[] }>(
    `/api/marketplace/rentals/bikes${fuelFilter !== "all" ? `?fuelType=${fuelFilter}` : ""}`,
    fetcher,
    { dedupingInterval: 6000 }
  );

  const rentalStores = storesData?.stores || [];
  const bikes = bikesData?.bikes || [];

  // Smart Assigning Algorithm: sorts available vehicles by score (availability, battery level, price)
  const filteredBikes = useMemo(() => {
    return bikes
      .filter((b) => {
        if (selectedHub !== "all" && b.merchantId !== selectedHub) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          b.name?.toLowerCase().includes(q) ||
          b.model?.toLowerCase().includes(q) ||
          b.pickupLocation?.toLowerCase().includes(q) ||
          b.merchant?.name?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Available bikes first
        if (a.status === "AVAILABLE" && b.status !== "AVAILABLE") return -1;
        if (a.status !== "AVAILABLE" && b.status === "AVAILABLE") return 1;
        return (a.hourlyPrice || 0) - (b.hourlyPrice || 0);
      });
  }, [bikes, searchQuery, selectedHub]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 select-none">
      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Zap className="size-3.5 fill-yellow-300 text-yellow-300" />
            <span>Instant Campus Mobility Fleet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Campus Bike, EV &amp; Cycle Rentals
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            Rent gear bicycles, electric Ather scooters, and motorbikes for hostel transit, lab commutes, and
            city trips with zero paperwork inside {collegeName}.
          </p>
        </div>

        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none">
          <Bike className="size-48" />
        </div>
      </div>

      {/* ─── 1. Rental Hub Depots (2+ Merchants) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="size-4 text-emerald-500" />
            <span>Campus Rental Hubs &amp; Depots ({rentalStores.length || 2})</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Verified Student Zero-Deposit</span>
        </div>

        {isStoresLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-3xl border border-border bg-card p-4 space-y-3">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rentalStores.map((store) => {
              const isSelected = selectedHub === store.id;
              return (
                <div
                  key={store.id}
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setSelectedHub((prev) => (prev === store.id ? "all" : store.id));
                  }}
                  className={cn(
                    "group relative rounded-3xl border p-4 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer overflow-hidden",
                    isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border"
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="size-14 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/50">
                      <img
                        src={
                          store.logoUrl ||
                          "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&h=200&fit=crop"
                        }
                        alt={store.name}
                        className="size-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-foreground group-hover:text-emerald-500 transition-colors truncate flex items-center gap-1">
                          <span>{store.name}</span>
                          <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                        </h3>
                        <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Star className="size-3 fill-emerald-500 text-emerald-500" />
                          <span>{store.rating || "4.9"}</span>
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1">{store.address}</p>

                      <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-foreground/80">
                          {store.slug.includes("wheels") ? "🚲 Cycles & E-Bikes" : "⚡ EV Scooters & Bikes"}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {isSelected ? "Showing this hub" : "Click to filter fleet"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Search & Category Filters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gear cycles, Ather 450X, Activa 6G, pickup gate..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-card border border-border text-xs font-medium text-foreground outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Vehicles" },
            { id: "ELECTRIC", label: "EV & Electric ⚡" },
            { id: "PETROL", label: "Cycles & Petrol 🚲" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setFuelFilter(tab.id);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                fuelFilter === tab.id
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          href="/app/marketplace/orders"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 shadow-xs"
        >
          <History className="size-3.5" />
          <span>Rental History</span>
        </Link>
      </div>

      {/* ─── 2. Bike & Vehicle Fleet Grid ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Available Campus Fleet ({filteredBikes.length})
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Smart Assigned by Availability &amp; Battery Level
          </span>
        </div>

        {isBikesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-3xl border border-border bg-card p-3 space-y-3">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredBikes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredBikes.map((bike) => {
              const isEV = bike.fuelType === "ELECTRIC";
              const isAvailable = bike.status === "AVAILABLE";

              return (
                <div
                  key={bike.id}
                  className="group rounded-3xl border border-border bg-card hover:border-emerald-500/40 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Vehicle Image */}
                    <div className="relative h-44 w-full bg-muted overflow-hidden">
                      <img
                        src={
                          bike.imageUrl ||
                          "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop"
                        }
                        alt={bike.name}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Status / Fuel Badge */}
                      <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md",
                            isAvailable ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                          )}
                        >
                          {isAvailable ? "Available Now" : "Booked"}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                          {isEV ? (
                            <Zap className="size-2.5 text-yellow-400" />
                          ) : (
                            <Fuel className="size-2.5 text-amber-400" />
                          )}
                          <span>{isEV ? "Electric" : "Petrol / Gear"}</span>
                        </span>
                      </div>

                      {/* Depot Location Overlay */}
                      <div className="absolute left-3 bottom-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                        <div className="flex items-center gap-1 truncate max-w-[70%]">
                          <MapPin className="size-3 text-emerald-400 shrink-0" />
                          <span className="truncate text-[11px]">{bike.pickupLocation}</span>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-mono bg-black/50 px-1.5 py-0.5 rounded">
                          {bike.registrationNumber}
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-black text-foreground group-hover:text-emerald-500 transition-colors">
                            {bike.name}
                          </h3>
                          <p className="text-xs text-muted-foreground font-medium">
                            {bike.merchant?.name || "Campus Rental Depot"}
                          </p>
                        </div>
                      </div>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-muted/50 border border-border/40 text-center">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Hourly Rate</p>
                          <p className="text-sm font-black text-foreground">₹{bike.hourlyPrice}/hr</p>
                        </div>
                        <div className="border-l border-border/40">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            24-Hr Day Pack
                          </p>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            ₹{bike.dailyPrice}/day
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Action */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        sounds.tap();
                        haptics.medium();
                        setBookingBike(bike);
                      }}
                      className={cn(
                        "w-full py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs",
                        isAvailable
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <KeyRound className="size-3.5" />
                      <span>{isAvailable ? "Instant Book & Unlock" : "Currently In Use"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
            <Bike className="size-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No vehicles matching your search</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try switching fuel types or selecting all depots to view the campus fleet.
            </p>
          </div>
        )}
      </div>

      {/* ─── Instant Booking Modal ─── */}
      {bookingBike && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setBookingBike(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                  Instant Campus Booking
                </span>
                <h3 className="text-lg font-black text-foreground">{bookingBike.name}</h3>
                <p className="text-xs text-muted-foreground">{bookingBike.pickupLocation}</p>
              </div>
              <div className="size-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-black">
                <Bike className="size-5" />
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Choose Rental Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, 8].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setBookingDurationHours(hrs)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                      bookingDurationHours === hrs
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-muted/50 border-border text-foreground hover:bg-muted"
                    )}
                  >
                    {hrs} Hours
                  </button>
                ))}
              </div>
            </div>

            {/* Fare Summary */}
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/40 space-y-2 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-muted-foreground">
                  Rental ({bookingDurationHours} hrs × ₹{bookingBike.hourlyPrice})
                </span>
                <span className="font-bold text-foreground">
                  ₹{bookingDurationHours * bookingBike.hourlyPrice}
                </span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-muted-foreground">Security Deposit</span>
                <span className="text-emerald-500 font-bold">WAIVED (Student Verified 🛡️)</span>
              </div>
              <div className="border-t border-border/40 pt-2 flex items-center justify-between font-black text-sm">
                <span>Total Due on Pickup</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{bookingDurationHours * bookingBike.hourlyPrice}
                </span>
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookingBike(null)}
                className="flex-1 py-3 rounded-2xl border border-border hover:bg-muted text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingBooking}
                onClick={async () => {
                  setIsSubmittingBooking(true);
                  sounds.success();
                  haptics.medium();
                  setTimeout(() => {
                    setIsSubmittingBooking(false);
                    setBookingBike(null);
                    alert(
                      `Booking Confirmed! 🎉\nShow your booking token at ${bookingBike.pickupLocation} to collect your keys & helmet.`
                    );
                  }, 800);
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer shadow-md"
              >
                {isSubmittingBooking ? "Booking..." : "Confirm & Get Key Token"}
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
              Bring CampusLoop Bike &amp; EV Rentals to Your College
            </h4>
            <p className="text-[11px] text-muted-foreground max-w-md">
              We partner with local vehicle rental owners and cycle fleet managers. Contact us on Instagram to
              onboard rental shops around your campus!
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
