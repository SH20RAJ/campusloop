"use client";

import { ExternalLink, Plus, Search, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

export function AdminMerchantsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data, isLoading, mutate } = useSWR<{ merchants: any[] }>(
    "/api/admin/marketplace/merchants",
    fetcher
  );

  const merchants = data?.merchants || [];

  const filteredMerchants = merchants.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.address?.toLowerCase().includes(q) ||
      m.institution?.name?.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" || m.categorySlug?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 select-none">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Store className="size-6 text-emerald-500" />
            <span>Merchants &amp; Partner Directory</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit registered campus businesses, onboard new canteen vendors, and verify delivery settings
          </p>
        </div>

        <Link
          href="/admin/marketplace/merchants/new"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-opacity shadow-xs w-fit"
        >
          <Plus className="size-3.5 stroke-3" />
          <span>Onboard New Merchant</span>
        </Link>
      </div>

      {/* ─── Search & Category Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores by name, college, or location..."
            className="w-full h-10 rounded-xl bg-card border border-border pl-10 pr-4 text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-foreground"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 rounded-xl bg-card border border-border px-3 text-xs font-bold text-foreground outline-none w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="food">🍔 Food &amp; Canteens</option>
          <option value="rentals">🚲 Bike &amp; Vehicle Rentals</option>
          <option value="barber">✂️ Barber &amp; Salon</option>
          <option value="laundry">🧺 Laundry &amp; Wash</option>
          <option value="water">💧 20L Water Delivery</option>
          <option value="essentials">🛒 Supermarket &amp; Mart</option>
        </select>
      </div>

      {/* ─── Merchants Table ─── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-black text-foreground">Verified Merchants</h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {filteredMerchants.length} stores active
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : filteredMerchants.length > 0 ? (
          <div className="divide-y divide-border overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Store Name</th>
                  <th className="p-3">Campus Hub</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Credentials</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMerchants.map((m) => {
                  const pass = m.loginPassword || `store@${m.slug}`;
                  const user = m.loginUsername || m.slug;
                  return (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-black text-foreground">
                        <Link
                          href={`/admin/marketplace/merchants/${m.id}`}
                          className="flex items-center gap-2.5 group hover:underline"
                        >
                          <div className="size-9 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                            <img src={m.logoUrl} alt={m.name} className="size-full object-cover" />
                          </div>
                          <div>
                            <p className="group-hover:text-primary transition-colors">{m.name}</p>
                            <p className="text-[10px] text-muted-foreground font-normal">{m.address}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-3 text-muted-foreground font-medium">
                        {m.institution?.name?.split(",")[0] || "BIT Mesra"}
                      </td>
                      <td className="p-3 font-bold uppercase text-[10px] text-primary">{m.categorySlug}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                            const creds = `🏪 ${m.name}\n👤 User: ${user}\n🔑 Pass: ${pass}\n🌐 https://campusloop.space/merchant-portal/login`;
                            navigator.clipboard.writeText(creds);
                            toast.success(`Copied credentials for ${m.name}! 📋`);
                          }}
                          className="px-2 py-1 rounded-lg bg-muted/60 hover:bg-muted border border-border font-mono text-[10px] font-bold text-foreground flex items-center gap-1 cursor-pointer"
                          title="Click to copy full WhatsApp message"
                        >
                          <span>@{user}</span>
                          <span className="text-muted-foreground font-normal">({pass})</span>
                        </button>
                      </td>
                      <td className="p-3 text-muted-foreground">{m.phone || "—"}</td>
                      <td className="p-3 font-bold text-amber-500">⭐ {m.rating}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-bold text-[10px]">
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Link
                          href={`/admin/marketplace/merchants/${m.id}`}
                          className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline"
                        >
                          Manage
                        </Link>
                        <Link
                          href={`/app/marketplace/store/${m.id}`}
                          target="_blank"
                          className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>View</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center space-y-2">
            <Store className="size-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-bold text-foreground">No merchants found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
