"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
Bike,
Edit3,
Gauge,
Loader2,
Plus,
Search,
Trash2,
X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "🟢 Available", color: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30" },
  { value: "BOOKED", label: "🔵 Booked (Reserved)", color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
  { value: "RENTED", label: "🟡 Rented Out", color: "text-amber-500 bg-amber-500/15 border-amber-500/30" },
  { value: "MAINTENANCE", label: "🔴 In Maintenance", color: "text-rose-500 bg-rose-500/15 border-rose-500/30" },
];

export function MerchantFleetClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBike, setEditingBike] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState("AVAILABLE");
  const [editDailyPrice, setEditDailyPrice] = useState("");
  const [editHourlyPrice, setEditHourlyPrice] = useState("");
  const [editDeposit, setEditDeposit] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, isLoading, mutate } = useSWR<{ fleet: any[]; merchant: any }>(
    "/api/merchant/bikes/fleet",
    fetcher,
    { dedupingInterval: 6000 }
  );

  const fleet = data?.fleet || [];

  const filteredFleet = fleet.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.model.toLowerCase().includes(q) ||
      b.registrationNumber.toLowerCase().includes(q)
    );
  });

  function handleOpenEdit(b: any) {
    sounds.tap();
    haptics.light();
    setEditingBike(b);
    setEditStatus(b.status);
    setEditDailyPrice(String(b.dailyPrice));
    setEditHourlyPrice(String(b.hourlyPrice));
    setEditDeposit(String(b.securityDeposit));
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBike) return;

    sounds.send();
    haptics.success();
    setIsUpdating(true);

    try {
      const res = await fetch("/api/merchant/bikes/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBike.id,
          status: editStatus,
          dailyPrice: parseInt(editDailyPrice, 10) || editingBike.dailyPrice,
          hourlyPrice: parseInt(editHourlyPrice, 10) || editingBike.hourlyPrice,
          securityDeposit: parseInt(editDeposit, 10) || editingBike.securityDeposit,
        }),
      });

      if (!res.ok) throw new Error("Failed to update bike");
      mutate();
      toast.success("Bike status & pricing updated!");
      setEditingBike(null);
    } catch {
      toast.error("Could not update vehicle");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteBike(id: string) {
    if (!confirm("Are you sure you want to deactivate this bike from your fleet? Historical bookings will be preserved.")) return;
    sounds.tap();
    haptics.light();

    try {
      const res = await fetch(`/api/merchant/bikes/fleet?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate();
      toast.success("Vehicle deactivated from fleet");
    } catch {
      toast.error("Failed to deactivate bike");
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-5 select-none pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Gauge className="size-5 text-primary" />
            <span>Fleet Vehicles</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage operational status, registration numbers, and pricing for your vehicles
          </p>
        </div>

        <Link
          href="/merchantt-portal/bikes/fleet/new"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity shadow-xs cursor-pointer w-fit"
        >
          <Plus className="size-3.5 stroke-[3]" />
          <span>Add New Bike</span>
        </Link>
      </div>

      {/* ─── Search Omnibar ─── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by bike model, name, or registration plate (JH-01-AX...)..."
          className="w-full h-10 rounded-2xl bg-card border border-border/40 pl-10 pr-4 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-border"
        />
      </div>

      {/* ─── Fleet List (PRD Item 8) ─── */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : filteredFleet.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredFleet.map((bike) => {
            const statusConfig =
              STATUS_OPTIONS.find((s) => s.value === bike.status) || STATUS_OPTIONS[0];

            return (
              <div
                key={bike.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/40 text-xs shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="size-16 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/30">
                    <img src={bike.imageUrl} alt={bike.name} className="size-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-sm truncate">{bike.name}</h3>
                      <span className="text-[10px] font-black uppercase bg-muted px-2 py-0.5 rounded-md text-muted-foreground border border-border/40">
                        {bike.registrationNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                      <span>{bike.fuelType}</span>
                      <span>·</span>
                      <span>{bike.specs?.mileage || "45 kmpl"}</span>
                      <span>·</span>
                      <span className="font-bold text-foreground">₹{bike.dailyPrice}/day</span>
                      <span>(₹{bike.hourlyPrice}/hr)</span>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      Pickup: {bike.pickupLocation} · Deposit: ₹{bike.securityDeposit}
                    </p>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs",
                      statusConfig.color
                    )}
                  >
                    {statusConfig.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(bike)}
                    className="size-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Edit Status & Pricing"
                  >
                    <Edit3 className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBike(bike.id)}
                    className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Deactivate Bike"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center space-y-2">
          <Bike className="size-10 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-bold text-foreground">No vehicles found</p>
          <p className="text-xs text-muted-foreground">Add your first scooter or bike to the fleet.</p>
        </div>
      )}

      {/* ─── Edit Bike Modal ─── */}
      {editingBike && (
        <div
          onClick={() => setEditingBike(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/50 p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
              <div>
                <h3 className="text-base font-black text-foreground">{editingBike.name}</h3>
                <p className="text-xs text-muted-foreground">Plate: {editingBike.registrationNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBike(null)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Operational Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                >
                  <option value="AVAILABLE">🟢 Available (Ready for rent)</option>
                  <option value="BOOKED">🔵 Booked (Upcoming reservation)</option>
                  <option value="RENTED">🟡 Rented Out (Currently on trip)</option>
                  <option value="MAINTENANCE">🔴 In Maintenance (Blocked from booking)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Daily Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editDailyPrice}
                    onChange={(e) => setEditDailyPrice(e.target.value)}
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Hourly Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editHourlyPrice}
                    onChange={(e) => setEditHourlyPrice(e.target.value)}
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  value={editDeposit}
                  onChange={(e) => setEditDeposit(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full h-11 rounded-2xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
