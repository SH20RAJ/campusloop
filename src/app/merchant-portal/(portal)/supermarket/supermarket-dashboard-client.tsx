"use client";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  Package,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

export function SupermarketDashboardClient() {
  const [updatingStoreOpen, setUpdatingStoreOpen] = useState(false);
  const [actioningOrderId, setActioningOrderId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{
    merchant: any;
    stats: any;
    incomingOrders: any[];
    recentOrders: any[];
  }>("/api/merchant/dashboard", fetcher, {
    refreshInterval: 6000,
  });

  const { data: productsData, mutate: mutateProducts } = useSWR<{ products: any[] }>(
    "/api/merchant/products",
    fetcher
  );

  const merchant = data?.merchant;
  const stats = data?.stats || {
    todayRevenue: 0,
    todayOrdersCount: 0,
    pendingCount: 0,
    activeCount: 0,
  };
  const incomingOrders = data?.incomingOrders || [];
  const products = productsData?.products || [];

  const outOfStockCount = products.filter((p) => !p.isAvailable).length;

  async function handleToggleStoreOpen() {
    if (!merchant || updatingStoreOpen) return;
    sounds.tap();
    haptics.light();
    setUpdatingStoreOpen(true);

    try {
      const res = await fetch("/api/merchant/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !merchant.isOpen }),
      });
      if (!res.ok) throw new Error();
      mutate();
      toast.success(merchant.isOpen ? "Mart marked as CLOSED" : "Mart is now OPEN for hostel orders! 🛒");
    } catch {
      toast.error("Failed to update store status");
    } finally {
      setUpdatingStoreOpen(false);
    }
  }

  async function handleUpdateOrderStatus(orderId: string, nextStatus: string) {
    sounds.tap();
    haptics.medium();
    setActioningOrderId(orderId);

    try {
      const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error();
      sounds.ting();
      haptics.success();
      mutate();
      toast.success(`Order moved to ${nextStatus.replace(/_/g, " ")}!`);
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setActioningOrderId(null);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6 pb-20 select-none">
      {/* ─── Top Mart Store Status & Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
            <ShoppingBag className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-foreground">{merchant?.name || "Campus Supermarket"}</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-black uppercase">
                Mart Mode
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {merchant?.address || "Hostel Sector Mart"} · Inventory &amp; 15-Min Packing Desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={updatingStoreOpen}
            onClick={handleToggleStoreOpen}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs disabled:opacity-50",
              merchant?.isOpen
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "bg-rose-500 text-white hover:bg-rose-600"
            )}
          >
            <Power className="size-3.5 stroke-3" />
            <span>{merchant?.isOpen ? "MART OPEN" : "MART PAUSED"}</span>
          </button>

          <Link
            href="/merchant-portal/products/new"
            className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity"
          >
            <Plus className="size-3.5 stroke-3" />
            <span>Add Item</span>
          </Link>
        </div>
      </div>

      {/* ─── Metric Highlights ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Today&apos;s Revenue</p>
          <p className="text-2xl font-black text-emerald-500">₹{stats.todayRevenue || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Orders Packed</p>
          <p className="text-2xl font-black text-foreground">{stats.todayOrdersCount || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Mart SKUs</p>
          <p className="text-2xl font-black text-foreground">{products.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Out of Stock</p>
          <p className={cn("text-2xl font-black", outOfStockCount > 0 ? "text-rose-500" : "text-foreground")}>
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* ─── Live Mart Order Fulfillment Flow ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Package className="size-4.5 text-amber-500" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
              Pending Orders for Packing ({incomingOrders.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => mutate()}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
          >
            <RefreshCw className="size-3" />
            <span>Refresh</span>
          </button>
        </div>

        {incomingOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingOrders.map((order) => {
              const isActioning = actioningOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-3xl border border-amber-500/30 bg-card shadow-md space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-foreground">Order #{order.orderNumber}</span>
                      <p className="text-[11px] text-muted-foreground">
                        {order.deliveryAddress?.hostelName ? `${order.deliveryAddress.hostelName} · Room ${order.deliveryAddress.roomNumber}` : "Hostel Delivery"}
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase tracking-wider animate-pulse">
                      {order.status}
                    </span>
                  </div>

                  {/* Item Checklist for Mart Picker */}
                  <div className="bg-muted/40 p-3 rounded-2xl border border-border/60 space-y-1.5 text-xs">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Pick &amp; Bag Checklist:</p>
                    {(order.items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between font-medium">
                        <span>
                          <strong className="font-black text-foreground">{item.quantity}x</strong> {item.name}
                        </span>
                        <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-black text-foreground">Total: ₹{order.total}</span>

                    {/* Step Transitions: PLACED -> PREPARING (PACKING) -> READY -> OUT_FOR_DELIVERY */}
                    <div className="flex items-center gap-2">
                      {order.status === "PLACED" && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 cursor-pointer disabled:opacity-50"
                        >
                          Start Packing
                        </button>
                      )}

                      {order.status === "PREPARING" && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateOrderStatus(order.id, "READY")}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-500 text-white text-xs font-black hover:bg-blue-600 cursor-pointer disabled:opacity-50"
                        >
                          Bag Packed
                        </button>
                      )}

                      {order.status === "READY" && (
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleUpdateOrderStatus(order.id, "OUT_FOR_DELIVERY")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-black hover:bg-emerald-400 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <Truck className="size-3" />
                          <span>Dispatch</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl border border-dashed border-border bg-card/40 text-center space-y-2">
            <Check className="size-8 text-emerald-500 mx-auto" />
            <h3 className="text-xs font-black text-foreground">All Mart Orders Packed!</h3>
            <p className="text-[11px] text-muted-foreground">
              New incoming customer orders will appear here automatically with instant audio alerts.
            </p>
          </div>
        )}
      </div>

      {/* ─── Inventory Matrix Shortcut ─── */}
      <div className="p-5 rounded-3xl border border-border bg-card space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-foreground">Mart Inventory Matrix</h3>
            <p className="text-xs text-muted-foreground">Quickly view or toggle out-of-stock items</p>
          </div>

          <Link
            href="/merchant-portal/products"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Full Inventory</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {products.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl border border-border bg-muted/20 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  ₹{p.price} · {p.categoryName || "General"}
                </p>
              </div>

              <span
                className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-black uppercase",
                  p.isAvailable ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"
                )}
              >
                {p.isAvailable ? "IN STOCK" : "OUT"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
