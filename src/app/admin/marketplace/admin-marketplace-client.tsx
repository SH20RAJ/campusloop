"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

export function AdminMarketplaceClient() {
  const { data, isLoading } = useSWR<{ merchants: any[] }>(
    "/api/admin/marketplace/merchants",
    fetcher
  );

  const merchants = data?.merchants || [];
  const totalProducts = merchants.reduce((sum, m) => sum + (m.products?.length || 0), 0);
  const totalOrders = merchants.reduce((sum, m) => sum + (m.orders?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Commercial Marketplace Console
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage verified local businesses, campus inventory, and student commerce
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/marketplace/merchants/new"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-opacity"
          >
            <Plus className="size-3.5 stroke-[3]" />
            <span>Onboard Merchant</span>
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Merchants
          </p>
          <p className="text-2xl font-black text-foreground">{merchants.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Catalog Products
          </p>
          <p className="text-2xl font-black text-foreground">{totalProducts}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Orders Processed
          </p>
          <p className="text-2xl font-black text-foreground">{totalOrders}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Est. Monthly GMV
          </p>
          <p className="text-2xl font-black text-emerald-500">₹1,48,000</p>
        </div>
      </div>

      {/* ─── Merchants Table ─── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-black text-foreground">Campus Merchants Directory</h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {merchants.length} stores active
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (
          <div className="divide-y divide-border overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Store Name</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Products</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-black text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                          <img src={m.logoUrl} alt={m.name} className="size-full object-cover" />
                        </div>
                        <div>
                          <p>{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground font-medium">
                      {m.institution?.name?.split(",")[0] || "BIT Mesra"}
                    </td>
                    <td className="p-3 font-bold uppercase text-[10px] text-primary">
                      {m.categorySlug}
                    </td>
                    <td className="p-3 font-bold">{m.products?.length || 0} items</td>
                    <td className="p-3 font-bold text-amber-500">⭐ {m.rating}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-bold text-[10px]">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/app/marketplace/store/${m.id}`}
                        target="_blank"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Preview Store ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
