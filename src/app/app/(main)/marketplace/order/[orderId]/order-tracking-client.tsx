"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { cn,formatTimeAgo } from "@/lib/utils";
import {
ArrowLeft,
CheckCircle2,
MapPin,
Phone,
Store
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface OrderTrackingClientProps {
  orderId: string;
}

const DELIVERY_STEPS = [
  { key: "PLACED", label: "Order Placed", desc: "Waiting for store confirmation" },
  { key: "ACCEPTED", label: "Merchant Accepted", desc: "Store accepted your order" },
  { key: "PREPARING", label: "Preparing Order", desc: "Chef is cooking your items" },
  { key: "READY", label: "Ready for Delivery", desc: "Packed and assigned for delivery" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Rider on the way to your hostel" },
  { key: "DELIVERED", label: "Delivered", desc: "Order handed over successfully" },
];

const PICKUP_STEPS = [
  { key: "PLACED", label: "Order Placed", desc: "Waiting for store confirmation" },
  { key: "ACCEPTED", label: "Merchant Accepted", desc: "Store accepted your order" },
  { key: "PREPARING", label: "Preparing Order", desc: "Chef is preparing your items" },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup", desc: "Collect from main counter" },
  { key: "PICKED_UP", label: "Picked Up", desc: "Order collected successfully" },
];

export function OrderTrackingClient({ orderId }: OrderTrackingClientProps) {
  const router = useRouter();

  const { data, isLoading } = useSWR<{ order: any }>(
    `/api/marketplace/orders/${orderId}`,
    fetcher,
    { refreshInterval: 5000 } // Auto refresh every 5s for live tracking
  );

  const order = data?.order;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center px-4 space-y-3">
        <p className="text-base font-bold text-foreground">Order not found</p>
        <button
          type="button"
          onClick={() => router.push("/app/marketplace/orders")}
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const isPickup = order.fulfillmentType === "PICKUP";
  const steps = isPickup ? PICKUP_STEPS : DELIVERY_STEPS;
  const isRejected = order.status === "REJECTED" || order.status === "CANCELLED";

  // Find step index
  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const activeStepNum = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/app/marketplace/orders")}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">
              Order {order.orderNumber}
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {order.merchant?.name} · {formatTimeAgo(order.createdAt)}
            </p>
          </div>
        </div>

        <Link
          href={`/app/marketplace/store/${order.merchantId}`}
          className="text-xs font-bold text-primary hover:underline"
        >
          Store Page
        </Link>
      </header>

      <div className="p-4 space-y-4">
        {/* ─── Order Status Card ─── */}
        <div
          className={cn(
            "rounded-3xl border p-5 space-y-3 shadow-xs",
            isRejected
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
              : order.status === "DELIVERED" || order.status === "PICKED_UP"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : "bg-card border-border/40 text-foreground"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider">
                {isRejected
                  ? "Order Cancelled / Rejected"
                  : order.status === "DELIVERED" || order.status === "PICKED_UP"
                  ? "Order Completed 🎉"
                  : "Order in Progress"}
              </span>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {order.fulfillmentType}
            </span>
          </div>

          {order.rejectionReason && (
            <p className="text-xs font-semibold text-rose-500 bg-rose-500/15 p-2.5 rounded-xl">
              Reason: {order.rejectionReason}
            </p>
          )}

          {/* Timeline Visual Steps */}
          {!isRejected && (
            <div className="space-y-4 pt-2">
              {steps.map((step, idx) => {
                const isPassed = idx <= activeStepNum;
                const isCurrent = idx === activeStepNum;

                return (
                  <div key={step.key} className="flex items-start gap-3 relative">
                    {/* Vertical connecting line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-3 top-6 w-0.5 h-7",
                          idx < activeStepNum ? "bg-emerald-500" : "bg-border/50"
                        )}
                      />
                    )}

                    {/* Step Icon / Dot */}
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

                    {/* Step Content */}
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

        {/* ─── Merchant & Contact Info ─── */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Store className="size-5 text-primary" />
              <div>
                <h3 className="text-sm font-black text-foreground">{order.merchant?.name}</h3>
                <p className="text-xs text-muted-foreground">{order.merchant?.address}</p>
              </div>
            </div>

            {order.merchant?.phone && (
              <a
                href={`tel:${order.merchant.phone}`}
                className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                title="Call Merchant"
              >
                <Phone className="size-4" />
              </a>
            )}
          </div>
        </div>

        {/* ─── Ordered Items Breakdown ─── */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-3 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Order Items ({order.items?.length || 0})
          </h3>

          <div className="space-y-2.5 divide-y divide-border/20">
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">
                    {item.quantity} × {item.productNameSnapshot}
                  </p>
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
                      + {item.selectedAddons.map((a: any) => a.name).join(", ")}
                    </p>
                  )}
                </div>
                <span className="font-black text-foreground">
                  ₹{item.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border/30 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-foreground font-bold">₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Fee</span>
              <span className="text-foreground font-bold">₹{order.deliveryFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="pt-1.5 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
              <span>Total ({order.paymentMethod})</span>
              <span className="text-base text-emerald-500">₹{order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* ─── Delivery Details Card ─── */}
        {order.deliveryAddress && (
          <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-2 text-xs shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Fulfillment Details
            </h3>
            {order.deliveryAddress.hostelName && (
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-rose-500" />
                <span>
                  {order.deliveryAddress.hostelName}, Room {order.deliveryAddress.roomNumber}
                </span>
              </p>
            )}
            {order.deliveryAddress.phone && (
              <p className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5 text-primary" />
                <span>Contact: {order.deliveryAddress.phone}</span>
              </p>
            )}
            {order.customerNote && (
              <p className="text-muted-foreground italic mt-1 bg-muted/30 p-2 rounded-xl">
                "{order.customerNote}"
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
