"use client";

import {
  ArrowLeft,
  Bike,
  CalendarCheck2,
  ChevronRight,
  Clock,
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
import { useState } from "react";
import useSWR from "swr";
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

  const { data, isLoading } = useSWR<{ bikes: any[] }>(
    `/api/marketplace/rentals/bikes${fuelFilter !== "all" ? `?fuelType=${fuelFilter}` : ""}`,
    fetcher,
    { dedupingInterval: 6000 }
  );

  const bikes = data?.bikes || [];

  const filteredBikes = bikes.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.model?.toLowerCase().includes(q) ||
      b.pickupLocation?.toLowerCase().includes(q) ||
      b.merchant?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 select-none">
      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Zap className="size-3.5 fill-yellow-300 text-yellow-300" />
            <span>Instant Campus Wheels</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Campus Bike &amp; EV Rentals
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium">
            Rent gear bicycles, electric scooters, and motorbikes for hostel transit, lab commutes, and city trips with zero paperwork.
          </p>
        </div>

        <div className="absolute right-4 -bottom-6 opacity-20 pointer-events-none">
          <Bike className="size-48" />
        </div>
      </div>

      {/* ─── Search & Order History Links ─── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gear cycles, Ather scooters, Activa..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-card border border-border text-xs font-medium text-foreground outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border shrink-0">
          {[
            { id: "all", label: "All Vehicles" },
            { id: "ELECTRIC", label: "EV Scooter ⚡" },
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
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
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
          className="flex items-center gap-1.5 h-11 px-4 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 shadow-xs"
        >
          <History className="size-3.5" />
          <span>My Bookings</span>
        </Link>
      </div>

      {/* ─── Bike Fleet Grid ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Available Campus Fleet ({filteredBikes.length})
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Pickup from Security Gate / Bicycle Bay</span>
        </div>

        {isLoading ? (
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
            {filteredBikes.map((b) => (
              <Link
                key={b.id}
                href={`/app/marketplace/rentals/bikes/${b.id}`}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="group block rounded-3xl border border-border bg-card hover:border-emerald-500/40 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <img
                    src={b.imageUrl || "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop"}
                    alt={b.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute left-3 top-3 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                    {b.fuelType === "ELECTRIC" ? "⚡ Electric" : "🚲 Bicycle"}
                  </div>

                  <div className="absolute right-3 top-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-black shadow-md">
                    <span>{b.rating || "4.8"}</span>
                    <Star className="size-3 fill-white" />
                  </div>

                  <div className="absolute left-3 bottom-3 text-white">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">{b.model}</p>
                    <h3 className="text-sm font-black leading-tight drop-shadow-sm">{b.name}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground truncate">
                      <MapPin className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{b.pickupLocation}</span>
                    </div>
                    <span className="font-bold text-foreground shrink-0">
                      Deposit: ₹{b.securityDeposit || 300}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Rental Rate</p>
                      <p className="text-base font-black text-foreground">
                        ₹{b.dailyPrice}
                        <span className="text-xs text-muted-foreground font-normal">/day</span>
                        <span className="text-xs text-muted-foreground font-normal ml-1">
                          (₹{b.hourlyPrice}/hr)
                        </span>
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-foreground text-background text-xs font-black group-hover:opacity-90 transition-opacity">
                      Book Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
            <Bike className="size-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No rental vehicles available</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              All vehicles are currently on the road. Check back shortly for returned rides.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
