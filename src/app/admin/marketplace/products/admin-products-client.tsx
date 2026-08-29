"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
ExternalLink,
Loader2,
Package,
Search,
UtensilsCrossed
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export function AdminProductsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{ products: any[] }>(
    "/api/admin/marketplace/products",
    fetcher
  );

  const products = data?.products || [];

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.merchant?.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      p.merchant?.categorySlug?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && p.isAvailable) ||
      (stockFilter === "out_of_stock" && !p.isAvailable);

    return matchesSearch && matchesCategory && matchesStock;
  });

  async function handleToggleAvailability(product: any) {
    sounds.tap();
    haptics.light();
    setTogglingId(product.id);

    try {
      const res = await fetch("/api/admin/marketplace/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          isAvailable: !product.isAvailable,
        }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success(
        !product.isAvailable
          ? `${product.name} is now In Stock`
          : `${product.name} marked Out of Stock`
      );
    } catch {
      toast.error("Failed to update product availability");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <UtensilsCrossed className="size-6 text-primary" />
            <span>Campus Catalog &amp; Products</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit menu items, manage inventory availability, and view pricing across all campus stores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/marketplace/merchants"
            className="px-3.5 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
          >
            Stores Directory →
          </Link>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, store, or tag..."
            className="w-full h-10 rounded-xl bg-card border border-border pl-10 pr-4 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="h-10 rounded-xl bg-card border border-border px-3 text-xs font-bold text-foreground outline-none"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">🟢 In Stock Only</option>
            <option value="out_of_stock">🔴 Out of Stock</option>
          </select>
        </div>
      </div>

      {/* ─── Products Catalog Table ─── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-black text-foreground">Catalog Items</h2>
          <span className="text-xs text-muted-foreground font-semibold">
            Showing {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="divide-y divide-border overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Merchant / Store</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Dietary / Specs</th>
                  <th className="p-3">Stock Status</th>
                  <th className="p-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground">
                              <Package className="size-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          {p.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      <Link
                        href={`/app/marketplace/store/${p.merchantId}`}
                        target="_blank"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{p.merchant?.name || "Store"}</span>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-muted font-bold text-[10px] uppercase text-muted-foreground">
                        {p.category || "General"}
                      </span>
                    </td>
                    <td className="p-3 font-black text-foreground text-sm">₹{p.price}</td>
                    <td className="p-3">
                      {p.isVeg === true && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-bold text-[10px]">
                          🟢 VEG
                        </span>
                      )}
                      {p.isVeg === false && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 font-bold text-[10px]">
                          🔴 NON-VEG
                        </span>
                      )}
                      {p.isVeg === null && (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        disabled={togglingId === p.id}
                        onClick={() => handleToggleAvailability(p)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border",
                          p.isAvailable
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-rose-500/15 text-rose-500 border-rose-500/30 hover:bg-rose-500/25"
                        )}
                      >
                        {togglingId === p.id ? (
                          <Loader2 className="size-3 animate-spin mx-auto" />
                        ) : p.isAvailable ? (
                          "🟢 In Stock"
                        ) : (
                          "🔴 Out of Stock"
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          const newPriceStr = prompt(`Update price for ${p.name} (Current: ₹${p.price}):`, String(p.price));
                          if (newPriceStr !== null) {
                            const newPrice = parseInt(newPriceStr, 10);
                            if (!isNaN(newPrice) && newPrice >= 0) {
                              try {
                                await fetch("/api/admin/marketplace/products", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: p.id, price: newPrice }),
                                });
                                mutate();
                                toast.success(`Price updated to ₹${newPrice}`);
                              } catch {
                                toast.error("Failed to update price");
                              }
                            }
                          }
                        }}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Edit Price
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center space-y-2">
            <Package className="size-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-bold text-foreground">No catalog products found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
