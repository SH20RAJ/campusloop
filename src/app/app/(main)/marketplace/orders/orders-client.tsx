"use client";

import { ArrowLeft, ChevronRight, Package, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export function OrdersClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data, isLoading } = useSWR<{ orders: any[] }>(
    `/api/marketplace/orders?filter=${activeTab}`,
    fetcher,
    { dedupingInterval: 10000 }
  );

  const orders = data?.orders || [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
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
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">My Orders</h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Campus marketplace order history &amp; active tracking
            </p>
          </div>
        </div>
      </header>

      {/* ─── Tabs Filter Strip ─── */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
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
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Orders List ─── */}
      <div className="p-4 space-y-3.5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/app/marketplace/order/${order.id}`}
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-border/40 bg-card hover:bg-muted/4 transition-all cursor-pointer group shadow-xs"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="size-12 rounded-xl bg-muted border border-border/40 overflow-hidden shrink-0">
                  {order.merchant?.logoUrl ? (
                    <img
                      src={order.merchant.logoUrl}
                      alt={order.merchant?.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground">
                      <Store className="size-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-foreground group-hover:underline truncate">
                      {order.merchant?.name}
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground">#{order.orderNumber}</span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {(order.items || [])
                      .map((i: any) => `${i.quantity}× ${i.productNameSnapshot}`)
                      .join(", ")}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                    <span className="font-black text-foreground">₹{order.total.toLocaleString("en-IN")}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(order.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Arrow */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs",
                    order.status === "DELIVERED" || order.status === "PICKED_UP"
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                      : order.status === "REJECTED" || order.status === "CANCELLED"
                        ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                        : "bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse"
                  )}
                >
                  {order.status.replace("_", " ")}
                </span>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4 space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center border border-border/40 text-muted-foreground">
              <Package className="size-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No orders yet</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                When you order from canteens or book rentals, your live order cards will appear here.
              </p>
            </div>
            <Link
              href="/app/marketplace"
              className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-black"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
