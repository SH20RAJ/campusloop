"use client";

import { DollarSign, Download, TrendingUp, Wallet } from "lucide-react";

export function MerchantEarningsClient() {
  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6 select-none pb-24">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Earnings &amp; Settlements</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View revenue statements, completed payouts, and UPI settlement logs
        </p>
      </div>

      {/* ─── Revenue Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-1 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Revenue</p>
          <p className="text-2xl font-black text-foreground">₹2,840</p>
          <p className="text-[10px] text-emerald-500 font-bold">+18% vs yesterday</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-1 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">This Week</p>
          <p className="text-2xl font-black text-foreground">₹18,920</p>
          <p className="text-[10px] text-emerald-500 font-bold">42 completed orders</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-1 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">This Month</p>
          <p className="text-2xl font-black text-foreground">₹74,500</p>
          <p className="text-[10px] text-muted-foreground">Direct daily settlements</p>
        </div>
      </div>

      {/* ─── Settlement Breakdown ─── */}
      <div className="rounded-3xl border border-border/40 bg-card p-5 space-y-3 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Settlement Breakdown
        </h2>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Gross Campus Sales</span>
            <span className="text-foreground font-bold">₹74,500</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Platform Facilitation (0%)</span>
            <span className="text-emerald-500 font-bold">₹0 (Free Early Access)</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Delivery Fees Collected</span>
            <span className="text-foreground font-bold">₹3,400</span>
          </div>
          <div className="pt-2 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
            <span>Net Paid to Merchant UPI</span>
            <span className="text-base text-emerald-500">₹77,900</span>
          </div>
        </div>
      </div>
    </main>
  );
}
