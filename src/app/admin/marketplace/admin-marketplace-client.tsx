"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  Bike,
  DollarSign,
  Edit2,
  ExternalLink,
  Package,
  Plus,
  QrCode,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";

export function AdminMarketplaceClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data, isLoading } = useSWR<{ merchants: any[] }>(
    "/api/admin/marketplace/merchants",
    fetcher,
    { dedupingInterval: 10000 }
  );

  const merchants = data?.merchants || [];
  const totalProducts = merchants.reduce((sum, m) => sum + (m.products?.length || 0), 0);
  const totalOrders = merchants.reduce((sum, m) => sum + (m.orders?.length || 0), 0);

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      if (selectedCategory !== "all" && m.categorySlug !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name?.toLowerCase().includes(q) ||
          m.address?.toLowerCase().includes(q) ||
          m.categorySlug?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [merchants, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 select-none pb-16">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Store className="size-6 text-primary" />
            <span>Marketplace Executive Console</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full control over campus merchants, product catalogs, bike fleets, and live commerce orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/marketplace/products"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shadow-xs"
          >
            <Package className="size-3.5" />
            <span>Products Catalog</span>
          </Link>

          <Link
            href="/admin/marketplace/rentals"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shadow-xs"
          >
            <Bike className="size-3.5" />
            <span>Bike Rentals</span>
          </Link>

          <Link
            href="/admin/marketplace/merchants/new"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-opacity shadow-xs"
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
            Catalog Products
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

      {/* ─── Merchants Table with Search & Filter ─── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-foreground">Campus Merchants Directory</h2>
            <p className="text-[11px] text-muted-foreground">Click Manage to edit menu items, prices, or store details</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store or campus..."
                className="w-48 h-8 rounded-xl bg-muted/40 border border-border pl-8 pr-2.5 text-xs font-medium text-foreground outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-xl bg-muted/40 border border-border px-2 text-xs font-bold text-muted-foreground outline-none"
            >
              <option value="all">All Categories</option>
              <option value="food">Food &amp; Canteens</option>
              <option value="essentials">Essentials</option>
              <option value="services">Services</option>
              <option value="rentals">Rentals</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Store Name</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Catalog</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMerchants.length > 0 ? (
                  filteredMerchants.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-black text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                            <img src={m.logoUrl} alt={m.name} className="size-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground font-normal">{m.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground font-medium">
                        {m.institution?.name?.split(",")[0] || "BIT Mesra"}
                      </td>
                      <td className="p-3">
                        <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {m.categorySlug}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{m.products?.length || 0} products</td>
                      <td className="p-3 font-bold text-amber-500">⭐ {m.rating}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full font-bold text-[10px] uppercase",
                            m.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                          )}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/marketplace/merchants/${m.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity"
                          >
                            <Edit2 className="size-3" />
                            <span>Manage Menu</span>
                          </Link>

                          <Link
                            href={`/app/marketplace/store/${m.id}`}
                            target="_blank"
                            className="size-7 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                            title="Preview Store"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                      No merchants found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
