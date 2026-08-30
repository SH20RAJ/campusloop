"use client";

import { CheckCircle2, MapPin, Package, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

const PIPELINE_TABS = [
  { id: "new", label: "New Orders" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "delivery", label: "Out for Delivery" },
  { id: "completed", label: "Completed" },
  { id: "all", label: "All" },
] as const;

export function MerchantOrdersClient() {
  const [activeTab, setActiveTab] = useState<string>("new");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{ orders: any[] }>(
    `/api/merchant/orders?status=${activeTab}`,
    fetcher,
    { refreshInterval: 6000 }
  );

  const orders = data?.orders || [];

  async function handleAdvanceStatus(orderId: string, nextStatus: string) {
    sounds.ting();
    haptics.success();
    setUpdatingOrderId(orderId);

    try {
      const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success(`Order moved to ${nextStatus}! 🎉`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-5">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Order Management</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Process incoming student orders from receipt to fulfillment
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

      {/* ─── Orders Grid ─── */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-3xl bg-card border border-border/40 space-y-4 shadow-xs"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-black text-foreground">#{order.orderNumber}</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    · {formatTimeAgo(order.createdAt)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-black uppercase tracking-wider">
                    {order.fulfillmentType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{order.paymentMethod}</span>
                  <span className="text-base font-black text-emerald-500">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                {(order.items || []).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-xs font-semibold">
                    <span>
                      {item.quantity} × {item.productNameSnapshot}
                    </span>
                    <span className="text-muted-foreground font-bold">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Delivery / Address Information */}
              {order.deliveryAddress && (
                <div className="p-3 rounded-2xl bg-muted/40 text-xs text-muted-foreground space-y-1">
                  {order.deliveryAddress.hostelName && (
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-rose-500" />
                      <span>
                        {order.deliveryAddress.hostelName}, Room {order.deliveryAddress.roomNumber}
                      </span>
                    </p>
                  )}
                  {order.deliveryAddress.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-primary" />
                      <span>Customer: {order.deliveryAddress.phone}</span>
                    </p>
                  )}
                  {order.customerNote && <p className="italic">Note: "{order.customerNote}"</p>}
                </div>
              )}

              {/* Status Advance Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/30">
                {order.status === "PLACED" && (
                  <>
                    <button
                      type="button"
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleAdvanceStatus(order.id, "ACCEPTED")}
                      className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Accept Order
                    </button>
                    <button
                      type="button"
                      disabled={updatingOrderId === order.id}
                      onClick={() => handleAdvanceStatus(order.id, "REJECTED")}
                      className="px-4 py-2 rounded-full bg-rose-500/15 text-rose-500 font-bold text-xs hover:bg-rose-500/25 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}

                {order.status === "ACCEPTED" && (
                  <button
                    type="button"
                    disabled={updatingOrderId === order.id}
                    onClick={() => handleAdvanceStatus(order.id, "PREPARING")}
                    className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Mark Preparing 🍳
                  </button>
                )}

                {order.status === "PREPARING" && (
                  <button
                    type="button"
                    disabled={updatingOrderId === order.id}
                    onClick={() =>
                      handleAdvanceStatus(
                        order.id,
                        order.fulfillmentType === "PICKUP" ? "READY_FOR_PICKUP" : "READY"
                      )
                    }
                    className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-black text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Mark Ready 📦
                  </button>
                )}

                {(order.status === "READY" || order.status === "READY_FOR_PICKUP") && (
                  <button
                    type="button"
                    disabled={updatingOrderId === order.id}
                    onClick={() =>
                      handleAdvanceStatus(
                        order.id,
                        order.fulfillmentType === "PICKUP" ? "PICKED_UP" : "OUT_FOR_DELIVERY"
                      )
                    }
                    className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                  >
                    {order.fulfillmentType === "PICKUP" ? "Mark Picked Up 🎉" : "Out for Delivery 🛵"}
                  </button>
                )}

                {order.status === "OUT_FOR_DELIVERY" && (
                  <button
                    type="button"
                    disabled={updatingOrderId === order.id}
                    onClick={() => handleAdvanceStatus(order.id, "DELIVERED")}
                    className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Mark Delivered 🎉
                  </button>
                )}

                {(order.status === "DELIVERED" || order.status === "PICKED_UP") && (
                  <span className="text-xs font-black text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="size-4" />
                    <span>Completed &amp; Paid</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-2">
          <Package className="size-10 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-bold text-foreground">No orders in this stage</p>
          <p className="text-xs text-muted-foreground">Select another filter tab above.</p>
        </div>
      )}
    </main>
  );
}
