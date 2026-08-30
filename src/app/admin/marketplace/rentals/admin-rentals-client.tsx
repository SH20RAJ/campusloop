"use client";

import { Bike } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

export function AdminRentalsClient() {
  const [activeTab, setActiveTab] = useState<"fleet" | "bookings">("bookings");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{
    bikes: any[];
    bookings: any[];
  }>("/api/admin/marketplace/rentals", fetcher);

  const bikes = data?.bikes || [];
  const bookings = data?.bookings || [];

  async function handleResolveDispute(bookingId: string, resolution: "REFUNDED" | "HELD") {
    sounds.tap();
    haptics.light();
    setResolvingId(bookingId);

    try {
      const res = await fetch("/api/admin/marketplace/rentals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          depositRefundStatus: resolution,
          status: "COMPLETED",
        }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success(
        resolution === "REFUNDED" ? "Deposit Refund Released to Student" : "Deposit Held / Paid for Damage"
      );
    } catch {
      toast.error("Failed to update dispute status");
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Bike className="size-6 text-emerald-500" />
            <span>Campus Bike Fleet &amp; Rental Management</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Admin oversight for registered campus vehicles, student reservations, and deposit disputes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setActiveTab("bookings");
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "bookings"
                ? "bg-foreground text-background font-black shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All Bookings ({bookings.length})
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setActiveTab("fleet");
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "fleet"
                ? "bg-foreground text-background font-black shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Fleet Vehicles ({bikes.length})
          </button>
        </div>
      </div>

      {/* ─── Bookings Oversight Table ─── */}
      {activeTab === "bookings" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground">Campus Reservations Log</h2>
            <span className="text-xs text-muted-foreground">{bookings.length} reservations recorded</span>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : (
            <div className="divide-y divide-border overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Booking #</th>
                    <th className="p-3">Bike / Merchant</th>
                    <th className="p-3">Student Customer</th>
                    <th className="p-3">Rental Window</th>
                    <th className="p-3">Payment &amp; Deposit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Dispute Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-black text-foreground">
                        <span>#{b.bookingNumber}</span>
                        <p className="text-[10px] text-muted-foreground">{formatTimeAgo(b.createdAt)}</p>
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        <p>{b.bike?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{b.merchant?.name}</p>
                      </td>
                      <td className="p-3 font-medium">
                        <p className="text-foreground font-bold">{b.student?.displayName}</p>
                        <p className="text-[10px] text-muted-foreground">📞 {b.customerPhone}</p>
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">
                        <p>
                          {new Date(b.startAt).toLocaleDateString()}{" "}
                          {new Date(b.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p>
                          → {new Date(b.endAt).toLocaleDateString()}{" "}
                          {new Date(b.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="font-black text-emerald-500">₹{b.totalAmount}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Deposit: ₹{b.depositAmount} ({b.depositRefundStatus})
                        </p>
                      </td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md font-bold text-[10px] uppercase",
                            b.status === "ACTIVE" || b.status === "CONFIRMED"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : b.status === "DISPUTED"
                                ? "bg-rose-500/15 text-rose-500"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {b.depositRefundStatus === "DISPUTED" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResolveDispute(b.id, "REFUNDED")}
                              className="px-2.5 py-1 rounded-md bg-emerald-500 text-black font-bold text-[10px]"
                            >
                              Refund Student
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveDispute(b.id, "HELD")}
                              className="px-2.5 py-1 rounded-md bg-rose-500 text-white font-bold text-[10px]"
                            >
                              Hold for Damage
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Fleet Oversight Table ─── */}
      {activeTab === "fleet" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-black text-foreground">Registered Campus Fleet</h2>
            <span className="text-xs text-muted-foreground">{bikes.length} vehicles</span>
          </div>

          <div className="divide-y divide-border overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Registration Plate</th>
                  <th className="p-3">Merchant Store</th>
                  <th className="p-3">Pricing</th>
                  <th className="p-3">Deposit</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bikes.map((bike) => (
                  <tr key={bike.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-black text-foreground flex items-center gap-2.5">
                      <div className="size-9 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                        <img src={bike.imageUrl} alt={bike.name} className="size-full object-cover" />
                      </div>
                      <div>
                        <p>{bike.name}</p>
                        <p className="text-[10px] text-muted-foreground">{bike.fuelType}</p>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-foreground uppercase">{bike.registrationNumber}</td>
                    <td className="p-3 text-muted-foreground">{bike.merchant?.name}</td>
                    <td className="p-3 font-black text-foreground">₹{bike.dailyPrice}/day</td>
                    <td className="p-3 font-medium text-muted-foreground">₹{bike.securityDeposit}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-bold text-[10px]">
                        {bike.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
