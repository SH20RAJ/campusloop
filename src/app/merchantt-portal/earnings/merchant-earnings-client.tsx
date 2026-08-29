"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Download,
  IndianRupee,
  PackageCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import useSWR from "swr";

export function MerchantEarningsClient() {
  const { data, isLoading } = useSWR<{ orders: any[]; merchant: any }>(
    "/api/merchant/orders?filter=all",
    fetcher
  );

  const orders = data?.orders || [];
  const completedOrders = orders.filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED");

  const totalGrossSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalDeliveryFees = completedOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const upiSales = completedOrders
    .filter((o) => o.paymentMethod === "UPI")
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const cashSales = completedOrders
    .filter((o) => o.paymentMethod === "COD")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6 select-none pb-24">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <DollarSign className="size-5 text-emerald-500" />
          <span>Earnings &amp; Settlements</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Live revenue statements, completed payouts, and UPI settlement logs
        </p>
      </div>

      {/* ─── Revenue Cards Grid ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-1 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Gross Sales
            </p>
            <p className="text-2xl font-black text-emerald-500">
              ₹{totalGrossSales.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold">
              {completedOrders.length} completed orders
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-1 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              UPI Payouts (Direct)
            </p>
            <p className="text-2xl font-black text-foreground">
              ₹{upiSales.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-emerald-500 font-bold">Instant settlement</p>
          </div>

          <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-1 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cash on Delivery (Collected)
            </p>
            <p className="text-2xl font-black text-foreground">
              ₹{cashSales.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold">Self-collected at desk</p>
          </div>
        </div>
      )}

      {/* ─── Settlement Breakdown ─── */}
      <div className="rounded-3xl border border-border/40 bg-card p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Settlement Breakdown
          </h2>
          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            0% Platform Fee (Campus Early Access)
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Gross Campus Sales</span>
            <span className="text-foreground font-bold">
              ₹{totalGrossSales.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>CampusLoop Facilitation Fee</span>
            <span className="text-emerald-500 font-bold">₹0</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Delivery Fees Collected</span>
            <span className="text-foreground font-bold">
              ₹{totalDeliveryFees.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="pt-2 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
            <span>Net Merchant Payout</span>
            <span className="text-base text-emerald-500">
              ₹{(totalGrossSales + totalDeliveryFees).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
