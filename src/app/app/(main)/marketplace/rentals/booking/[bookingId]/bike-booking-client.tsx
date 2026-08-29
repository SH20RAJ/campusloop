"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo } from "@/lib/utils";
import {
ArrowLeft,
CheckCircle2,
MapPin,
Phone,
ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface BikeBookingClientProps {
  bookingId: string;
}

const RENTAL_TIMELINE_STEPS = [
  { key: "REQUESTED", label: "Booking Requested", desc: "Submitted to merchant for approval" },
  { key: "CONFIRMED", label: "Merchant Confirmed", desc: "Vehicle reserved for your trip" },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup", desc: "Vehicle prepared at pickup spot" },
  { key: "ACTIVE", label: "Active Rental", desc: "Keys handed over · Safe riding!" },
  { key: "RETURNED", label: "Returned & Inspected", desc: "Vehicle condition checked" },
  { key: "COMPLETED", label: "Completed & Settled", desc: "Deposit refund initiated" },
];

export function BikeBookingClient({ bookingId }: BikeBookingClientProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const { data, isLoading, mutate } = useSWR<{ booking: any }>(
    `/api/marketplace/rentals/bookings/${bookingId}`,
    fetcher,
    { refreshInterval: 5000 } // Live polling
  );

  const booking = data?.booking;

  async function handleCancelBooking() {
    if (!confirm("Are you sure you want to cancel this bike reservation?")) return;
    sounds.tap();
    haptics.light();
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/marketplace/rentals/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL", reason: "Student requested cancellation" }),
      });

      if (!res.ok) throw new Error("Failed to cancel reservation");
      mutate();
      toast.success("Booking Cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center px-4 space-y-3">
        <p className="text-base font-bold text-foreground">Booking not found</p>
        <button
          type="button"
          onClick={() => router.push("/app/marketplace")}
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold"
        >
          Explore Marketplace
        </button>
      </div>
    );
  }

  const isCancelled =
    booking.status === "CANCELLED" ||
    booking.status === "REJECTED" ||
    booking.status === "DISPUTED";

  const currentStepIndex = RENTAL_TIMELINE_STEPS.findIndex((s) => s.key === booking.status);
  const activeStepNum = currentStepIndex !== -1 ? currentStepIndex : 0;

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
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/app/marketplace")}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">
              Booking #{booking.bookingNumber}
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {booking.bike?.name} · {formatTimeAgo(booking.createdAt)}
            </p>
          </div>
        </div>

        {(booking.status === "REQUESTED" || booking.status === "CONFIRMED") && (
          <button
            type="button"
            disabled={isCancelling}
            onClick={handleCancelBooking}
            className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
          >
            Cancel
          </button>
        )}
      </header>

      <div className="p-4 space-y-4">
        {/* ─── Status Hero Card ─── */}
        <div
          className={cn(
            "p-5 rounded-3xl border space-y-3.5 shadow-xs",
            isCancelled
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
              : booking.status === "COMPLETED"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-card border-border/40 text-foreground"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-black uppercase tracking-wider block">
                {booking.status === "REQUESTED" && "🟡 Awaiting Merchant Confirmation"}
                {booking.status === "CONFIRMED" && "🟢 Booking Confirmed"}
                {booking.status === "READY_FOR_PICKUP" && "🔑 Ready for Pickup"}
                {booking.status === "ACTIVE" && "🛵 Trip in Progress"}
                {booking.status === "RETURNED" && "🔍 Return Inspected"}
                {booking.status === "COMPLETED" && "🎉 Trip Completed"}
                {booking.status === "CANCELLED" && "Cancelled"}
                {booking.status === "REJECTED" && "Rejected by Merchant"}
                {booking.status === "DISPUTED" && "⚠️ Deposit Under Dispute"}
              </span>
              <p className="text-xs text-muted-foreground">
                Reg: {booking.bike?.registrationNumber} · {booking.bike?.model}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-muted font-black text-xs">
              {booking.paymentMethod}
            </span>
          </div>

          {booking.cancellationReason && (
            <p className="text-xs font-semibold text-rose-500 bg-rose-500/15 p-2.5 rounded-xl">
              Reason: {booking.cancellationReason}
            </p>
          )}

          {/* Step Timeline */}
          {!isCancelled && (
            <div className="space-y-4 pt-3 border-t border-border/25">
              {RENTAL_TIMELINE_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepNum;
                const isCurrent = idx === activeStepNum;

                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {idx < RENTAL_TIMELINE_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-3 top-6 w-0.5 h-7",
                          idx < activeStepNum ? "bg-emerald-500" : "bg-border/50"
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        "size-6 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold transition-all",
                        isCurrent
                          ? "bg-emerald-500 text-black ring-4 ring-emerald-500/20 animate-pulse"
                          : isPassed
                          ? "bg-emerald-500 text-black"
                          : "bg-muted text-muted-foreground border border-border/50"
                      )}
                    >
                      {isPassed ? <CheckCircle2 className="size-3.5" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-bold leading-none",
                          isCurrent
                            ? "text-foreground font-black"
                            : isPassed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Schedule & Pickup Point Card ─── */}
        <div className="p-4 rounded-3xl bg-card border border-border/40 space-y-3 text-xs shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Rental Schedule &amp; Pickup
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Pickup Time</p>
              <p className="font-bold text-foreground">{startDateStr}</p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Expected Return</p>
              <p className="font-bold text-foreground">{endDateStr}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-rose-500" />
              <div>
                <p className="font-bold text-foreground">Pickup Location</p>
                <p className="text-[11px] text-muted-foreground">{booking.bike?.pickupLocation}</p>
              </div>
            </div>

            {booking.merchant?.phone && (
              <a
                href={`tel:${booking.merchant.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold text-xs hover:bg-emerald-500/25 transition-colors"
              >
                <Phone className="size-3.5" />
                <span>Call Store</span>
              </a>
            )}
          </div>
        </div>

        {/* ─── Payment & Deposit Breakdown ─── */}
        <div className="p-4 rounded-3xl bg-card border border-border/40 space-y-2.5 text-xs shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Payment &amp; Deposit Summary
          </h3>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>Rental Amount</span>
            <span className="text-foreground font-bold">
              ₹{booking.rentalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-blue-400" />
              <span>Refundable Security Deposit</span>
            </div>
            <span className="text-foreground font-bold">
              ₹{booking.depositAmount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="pt-2 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
            <span>Total Paid / Payable</span>
            <span className="text-base text-emerald-500">
              ₹{booking.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Deposit Status Badge */}
          <div className="pt-2 border-t border-border/30 flex items-center justify-between">
            <span className="text-muted-foreground">Deposit Refund Status:</span>
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                booking.depositRefundStatus === "REFUNDED"
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  : booking.depositRefundStatus === "DISPUTED"
                  ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                  : "bg-blue-500/15 text-blue-400 border-blue-500/30"
              )}
            >
              {booking.depositRefundStatus}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
