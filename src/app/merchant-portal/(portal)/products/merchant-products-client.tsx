"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
Plus,
Search,
Trash2,
UtensilsCrossed
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export function MerchantProductsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<{ products: any[]; merchant: any }>(
    "/api/merchant/products",
    fetcher,
    { dedupingInterval: 10000 }
  );

  const products = data?.products || [];

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q);
  });

  async function handleToggleAvailable(id: string, currentAvailable: boolean) {
    sounds.tap();
    haptics.light();
    setUpdatingId(id);

    try {
      const res = await fetch("/api/merchant/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isAvailable: !currentAvailable }),
      });

      if (!res.ok) throw new Error();
      mutate();
      toast.success(
        !currentAvailable ? "Item marked as AVAILABLE ✅" : "Item marked as OUT OF STOCK 🔴"
      );
    } catch {
      toast.error("Failed to update availability");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    sounds.tap();
    haptics.light();

    try {
      const res = await fetch(`/api/merchant/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate();
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight">Products &amp; Menu</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your store items, pricing, and stock availability
          </p>
        </div>

        <Link
          href="/merchant-portal/products/new"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity shadow-xs cursor-pointer w-fit"
        >
          <Plus className="size-3.5 stroke-3" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name or category..."
          className="w-full h-10 rounded-2xl bg-card border border-border/40 pl-10 pr-4 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-border"
        />
      </div>

      {/* ─── Products Table / Cards ─── */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border/40 text-xs shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {p.imageUrl ? (
                  <div className="size-14 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/30">
                    <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                  </div>
                ) : (
                  <div className="size-14 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <UtensilsCrossed className="size-5" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground truncate">{p.name}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {p.categoryName}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-1 text-[11px]">
                    {p.description || "No description provided"}
                  </p>
                  <p className="text-xs font-black text-foreground">
                    ₹{p.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Actions & Stock Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={updatingId === p.id}
                  onClick={() => handleToggleAvailable(p.id, p.isAvailable)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer active:scale-95",
                    p.isAvailable
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-rose-500/15 text-rose-500 border-rose-500/30 hover:bg-rose-500/25"
                  )}
                >
                  {p.isAvailable ? "In Stock" : "Out of Stock"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProduct(p.id)}
                  className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-2">
          <UtensilsCrossed className="size-10 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-bold text-foreground">No products found</p>
          <p className="text-xs text-muted-foreground">Add your first menu item to start selling.</p>
        </div>
      )}
    </main>
  );
}
