"use client";

import { ArrowLeft, Clock, History, MapPin, Package, ShieldCheck, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

export function FoodOrdersClient() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const { data, isLoading } = useSWR<{ orders: any[] }>(
    `/api/marketplace/orders?filter=${filter}&category=food`,
    fetcher,
    { refreshInterval: 6000 }
  );

  const orders = (data?.orders || []).filter(
    (o) => !o.categorySlug || o.categorySlug === "food"
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-20 select-none">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/app/marketplace/food"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="size-4.5 text-rose-500" />
              <span>Food &amp; Canteen Orders</span>
            </h1>
            <p className="text-xs text-muted-foreground">Live kitchen and hostel delivery status</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
          {(["all", "active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setFilter(tab);
              }}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer",
                filter === tab ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Orders List ─── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const isCooking = ["ACCEPTED", "PREPARING"].includes(order.status);
            const isReady = ["READY", "READY_FOR_PICKUP"].includes(order.status);
            const isDispatched = order.status === "OUT_FOR_DELIVERY";
            const isDelivered = ["DELIVERED", "PICKED_UP"].includes(order.status);

            return (
              <Link
                key={order.id}
                href={`/app/marketplace/order/${order.id}`}
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                }}
                className="block p-4 rounded-2xl border border-border bg-card hover:border-rose-500/40 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black">
                      <UtensilsCrossed className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground">{order.merchant?.name || "Canteen"}</h3>
                      <p className="text-[11px] text-muted-foreground">Order #{order.orderNumber}</p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      isCooking && "bg-amber-500/15 text-amber-500 border border-amber-500/30",
                      isReady && "bg-blue-500/15 text-blue-500 border border-blue-500/30",
                      isDispatched && "bg-purple-500/15 text-purple-500 border border-purple-500/30 animate-pulse",
                      isDelivered && "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
                      order.status === "REJECTED" && "bg-rose-500/15 text-rose-500 border border-rose-500/30",
                      order.status === "PLACED" && "bg-muted text-foreground border border-border"
                    )}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-muted-foreground border-y border-border/40 py-2 space-y-0.5">
                  {(order.items || []).map((item: any) => (
                    <p key={item.id} className="truncate">
                      <span className="font-bold text-foreground">{item.quantity}x</span> {item.name}
                    </p>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{formatTimeAgo(new Date(order.createdAt))}</span>
                  <div className="flex items-center gap-1 font-black text-foreground">
                    <span>Total:</span>
                    <span className="text-sm text-rose-500">₹{order.total}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
          <UtensilsCrossed className="size-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No food orders yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Hungry? Head over to campus canteens and get hot meals delivered to your room.
          </p>
          <Link
            href="/app/marketplace/food"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-black"
          >
            <span>Explore Food Stalls</span>
          </Link>
        </div>
      )}
    </div>
  );
}
