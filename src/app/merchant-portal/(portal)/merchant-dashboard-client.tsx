"use client";

import { Bell, Check, Copy, ExternalLink, Loader2, Power, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { MerchantPWAInstallBanner } from "@/components/merchant/merchant-pwa-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

export function MerchantDashboardClient() {
  const [updatingStoreOpen, setUpdatingStoreOpen] = useState(false);
  const [actioningOrderId, setActioningOrderId] = useState<string | null>(null);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const prevIncomingCountRef = useRef<number>(0);

  const { data, isLoading, mutate } = useSWR<{
    merchant: any;
    stats: any;
    incomingOrders: any[];
    recentOrders: any[];
  }>("/api/merchant/dashboard", fetcher, {
    refreshInterval: 5000, // Poll every 5s for real-time incoming orders
  });

  const merchant = data?.merchant;
  const stats = data?.stats || {
    todayRevenue: 0,
    todayOrdersCount: 0,
    pendingCount: 0,
    activeCount: 0,
    avgOrderValue: 0,
    totalProductsCount: 0,
  };
  const incomingOrders = data?.incomingOrders || [];
  const recentOrders = data?.recentOrders || [];

  // Play audio alert on new incoming order
  useEffect(() => {
    if (incomingOrders.length > prevIncomingCountRef.current && audioAlertsEnabled) {
      try {
        sounds.ring();
        haptics.success();
      } catch {
        // Audio playback restricted
      }
    }
    prevIncomingCountRef.current = incomingOrders.length;
  }, [incomingOrders.length, audioAlertsEnabled]);

  async function handleToggleStoreOpen() {
    if (!merchant || updatingStoreOpen) return;
    sounds.tap();
    haptics.light();
    setUpdatingStoreOpen(true);

    try {
      const nextState = !merchant.isOpen;
      const res = await fetch("/api/merchant/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: nextState }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success(nextState ? "🟢 Store is now OPEN for orders!" : "🔴 Store marked as CLOSED");
    } catch {
      toast.error("Could not update store status");
    } finally {
      setUpdatingStoreOpen(false);
    }
  }

  async function handleOrderStatus(orderId: string, nextStatus: string, rejectionReason?: string) {
    sounds.send();
    haptics.success();
    setActioningOrderId(orderId);

    try {
      const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, rejectionReason }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success(`Order status updated to ${nextStatus}! 🎉`);
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setActioningOrderId(null);
    }
  }

  function handleCopyStoreLink() {
    if (!merchant) return;
    sounds.tap();
    haptics.light();
    navigator.clipboard.writeText(`https://campusloop.space/app/marketplace/store/${merchant.id}`);
    toast.success("Public store link copied to clipboard! 📋");
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <MerchantPWAInstallBanner />

      {/* ─── Top Header & Store Open/Closed Toggle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/40 p-5 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <span>Good afternoon, {merchant?.name || "Partner"} 👋</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {merchant?.address} · Campus Partner Dashboard
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {merchant?.id && (
            <>
              <Link
                href={`/app/marketplace/store/${merchant.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors"
                title="View live public store page as students see it"
              >
                <ExternalLink className="size-3.5 text-primary" />
                <span>Open Store ↗</span>
              </Link>
              <button
                type="button"
                onClick={handleCopyStoreLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors cursor-pointer"
                title="Copy public store link"
              >
                <Copy className="size-3.5" />
                <span>Copy Link</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setAudioAlertsEnabled(!audioAlertsEnabled);
              toast.info(
                !audioAlertsEnabled ? "🔊 Order sound alerts enabled" : "🔇 Order sound alerts muted"
              );
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border",
              audioAlertsEnabled
                ? "bg-muted border-border/60 text-foreground"
                : "bg-muted/40 border-dashed border-border/40 text-muted-foreground"
            )}
            title={audioAlertsEnabled ? "Mute order sound alerts" : "Unmute order sound alerts"}
          >
            {audioAlertsEnabled ? (
              <Volume2 className="size-3.5 text-primary" />
            ) : (
              <VolumeX className="size-3.5" />
            )}
            <span className="hidden sm:inline">{audioAlertsEnabled ? "Sound ON" : "Muted"}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleStoreOpen}
            disabled={updatingStoreOpen}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95",
              merchant?.isOpen
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25"
            )}
          >
            <Power className="size-3.5" />
            <span>{merchant?.isOpen ? "🟢 Store Open" : "🔴 Store Closed"}</span>
          </button>
        </div>
      </div>

      {/* ─── Quick Stats Grid ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Today's Revenue
          </p>
          <p className="text-xl font-black text-foreground">₹{stats.todayRevenue.toLocaleString("en-IN")}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Today's Orders
          </p>
          <p className="text-xl font-black text-foreground">{stats.todayOrdersCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Pending Action
          </p>
          <p
            className={cn(
              "text-xl font-black",
              stats.pendingCount > 0 ? "text-amber-500 animate-pulse" : "text-foreground"
            )}
          >
            {stats.pendingCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Avg. Order</p>
          <p className="text-xl font-black text-foreground">₹{stats.avgOrderValue}</p>
        </div>
      </div>

      {/* ─── PROMINENT INCOMING ORDERS BOARD (PRD Item 22) ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Bell className="size-4 text-amber-500 animate-bounce" />
            <span>Incoming Live Orders ({incomingOrders.length})</span>
          </h2>
          {incomingOrders.length > 0 && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Needs Instant Action
            </span>
          )}
        </div>

        {incomingOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5">
            {incomingOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-3xl border-2 border-amber-500/40 bg-amber-500/[0.04] space-y-4 shadow-lg animate-in slide-in-from-top-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-foreground">
                      🔔 NEW ORDER #{order.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      · {formatTimeAgo(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-muted font-bold text-xs">
                      {order.fulfillmentType}
                    </span>
                    <span className="text-base font-black text-emerald-500">
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Items in the Order */}
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Order Items:
                  </p>
                  <div className="space-y-1">
                    {(order.items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-xs font-semibold">
                        <span>
                          {item.quantity} × {item.productNameSnapshot}
                        </span>
                        <span className="text-muted-foreground font-bold">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery / Pickup address notes */}
                {order.deliveryAddress && (
                  <div className="p-3 rounded-2xl bg-muted/40 text-xs text-muted-foreground space-y-1">
                    {order.deliveryAddress.hostelName && (
                      <p className="font-bold text-foreground">
                        📍 Deliver to: {order.deliveryAddress.hostelName}, Room{" "}
                        {order.deliveryAddress.roomNumber}
                      </p>
                    )}
                    {order.deliveryAddress.phone && <p>📞 Phone: {order.deliveryAddress.phone}</p>}
                    {order.customerNote && <p className="italic">Note: "{order.customerNote}"</p>}
                  </div>
                )}

                {/* Prominent Action Buttons: Accept / Reject */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={actioningOrderId === order.id}
                    onClick={() => handleOrderStatus(order.id, "ACCEPTED")}
                    className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {actioningOrderId === order.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="size-4 stroke-3" />
                        <span>ACCEPT ORDER</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={actioningOrderId === order.id}
                    onClick={() => {
                      const reason = prompt("Enter reason for rejection (e.g. Item out of stock):");
                      if (reason) handleOrderStatus(order.id, "REJECTED", reason);
                    }}
                    className="px-5 h-12 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-card border border-border/40 text-center space-y-1">
            <p className="text-sm font-bold text-foreground">No pending incoming orders</p>
            <p className="text-xs text-muted-foreground">
              When students place new orders, they will appear here with an alert sound.
            </p>
          </div>
        )}
      </section>

      {/* ─── Recent Active Orders Summary ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Recent Orders ({recentOrders.length})
          </h2>
          <Link href="/merchant-portal/orders" className="text-xs font-bold text-primary hover:underline">
            Manage Order Pipeline →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {recentOrders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/40 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-foreground">#{order.orderNumber}</span>
                  <span className="text-muted-foreground">· {formatTimeAgo(order.createdAt)}</span>
                </div>
                <p className="text-muted-foreground truncate mt-0.5">
                  {(order.items || []).map((i: any) => `${i.quantity}× ${i.productNameSnapshot}`).join(", ")}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-black text-foreground">₹{order.total.toLocaleString("en-IN")}</span>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    order.status === "DELIVERED"
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                      : order.status === "REJECTED"
                        ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                        : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                  )}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
