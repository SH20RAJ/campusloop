"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo } from "@/lib/utils";
import {
CalendarCheck2,
CheckCircle2,
ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const PIPELINE_TABS = [
  { id: "pending", label: "Pending Approval" },
  { id: "confirmed", label: "Confirmed" },
  { id: "active", label: "Active Trips" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
] as const;

export function MerchantBikeBookingsClient() {
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{ bookings: any[]; merchant: any }>(
    `/api/merchant/bikes/bookings?filter=${activeTab}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const bookings = data?.bookings || [];

  async function handleAdvanceStatus(bookingId: string, nextStatus: string, rejectionReason?: string) {
    sounds.send();
    haptics.success();
    setActioningId(bookingId);

    try {
      const res = await fetch(`/api/merchant/bikes/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, rejectionReason }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success(`Booking status updated to ${nextStatus}! 🎉`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-5 select-none pb-24">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <CalendarCheck2 className="size-5 text-emerald-500" />
          <span>Bike Reservations Pipeline</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Process student reservations, perform handovers, and settle return deposits
        </p>
      </div>

      {/* ─── Pipeline Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/30">
        {PIPELINE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setActiveTab(tab.id);
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs",
              activeTab === tab.id
                ? "bg-foreground text-background font-black shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Bookings Grid ─── */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => {
            const startDateStr = new Date(booking.startAt).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const endDateStr = new Date(booking.endAt).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={booking.id}
                className="p-5 rounded-3xl bg-card border border-border/40 space-y-4 shadow-xs"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-black text-foreground">
                      #{booking.bookingNumber}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      · {booking.bike?.name} ({booking.bike?.registrationNumber})
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      · {formatTimeAgo(booking.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      Deposit: ₹{booking.depositAmount}
                    </span>
                    <span className="text-base font-black text-emerald-500">
                      ₹{booking.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Timing & Student Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Rental Window</p>
                    <p className="font-bold text-foreground">
                      {startDateStr} → {endDateStr}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Pickup: {booking.bike?.pickupLocation}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Student Customer</p>
                    <p className="font-bold text-foreground">
                      {booking.student?.displayName} (@{booking.student?.username})
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      📞 {booking.customerPhone} · {booking.hostelAddress}
                    </p>
                  </div>
                </div>

                {/* Verification Documents Summary */}
                {booking.documents && (
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                      <ShieldCheck className="size-3.5" />
                      <span>Verified Student</span>
                    </span>
                    <span>·</span>
                    <span>DL: {booking.documents.drivingLicenseNumber}</span>
                    {booking.documents.aadhaarLast4 && (
                      <>
                        <span>·</span>
                        <span>Aadhaar: ****{booking.documents.aadhaarLast4}</span>
                      </>
                    )}
                  </div>
                )}

                {/* ONE OBVIOUS NEXT ACTION (PRD Item 26) */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <Link
                    href={`/merchant-portal/bikes/bookings/${booking.id}`}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View Details &amp; Checklist →
                  </Link>

                  <div className="flex items-center gap-2">
                    {/* REQUESTED -> [Approve] / [Reject] */}
                    {booking.status === "REQUESTED" && (
                      <>
                        <button
                          type="button"
                          disabled={actioningId === booking.id}
                          onClick={() => handleAdvanceStatus(booking.id, "CONFIRMED")}
                          className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                        >
                          Approve Booking
                        </button>
                        <button
                          type="button"
                          disabled={actioningId === booking.id}
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) handleAdvanceStatus(booking.id, "REJECTED", reason);
                          }}
                          className="px-4 py-2 rounded-full bg-rose-500/15 text-rose-500 font-bold text-xs hover:bg-rose-500/25 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* CONFIRMED -> [Mark Ready for Pickup] */}
                    {booking.status === "CONFIRMED" && (
                      <button
                        type="button"
                        disabled={actioningId === booking.id}
                        onClick={() => handleAdvanceStatus(booking.id, "READY_FOR_PICKUP")}
                        className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-black text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Mark Ready for Pickup 🔑
                      </button>
                    )}

                    {/* READY_FOR_PICKUP -> Direct to Handover Inspection on Detail Page */}
                    {booking.status === "READY_FOR_PICKUP" && (
                      <Link
                        href={`/merchant-portal/bikes/bookings/${booking.id}`}
                        className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Start Rental &amp; Handover 🛵
                      </Link>
                    )}

                    {/* ACTIVE -> Direct to Return Inspection on Detail Page */}
                    {booking.status === "ACTIVE" && (
                      <Link
                        href={`/merchant-portal/bikes/bookings/${booking.id}`}
                        className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Mark Returned &amp; Inspect 🔍
                      </Link>
                    )}

                    {/* RETURNED -> [Complete & Settle Deposit] */}
                    {booking.status === "RETURNED" && (
                      <button
                        type="button"
                        disabled={actioningId === booking.id}
                        onClick={() => handleAdvanceStatus(booking.id, "COMPLETED")}
                        className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Complete &amp; Settle Deposit 🎉
                      </button>
                    )}

                    {booking.status === "COMPLETED" && (
                      <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="size-4" />
                        <span>Completed &amp; Deposit Refunded</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center space-y-2">
          <CalendarCheck2 className="size-10 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-bold text-foreground">No bookings in this pipeline stage</p>
          <p className="text-xs text-muted-foreground">Select another tab above to see reservations.</p>
        </div>
      )}
    </main>
  );
}
