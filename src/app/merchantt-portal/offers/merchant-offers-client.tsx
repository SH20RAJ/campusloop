"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { Flame, Percent, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export function MerchantOffersClient() {
  const [title, setTitle] = useState("");
  const [discountValue, setDiscountValue] = useState("20");
  const [code, setCode] = useState("STUDENT20");
  const [minOrder, setMinOrder] = useState("150");
  const [isCreating, setIsCreating] = useState(false);

  const { data, isLoading } = useSWR<{ merchant: any }>("/api/merchant/store", fetcher);
  const merchant = data?.merchant;

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6 select-none pb-24">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Offers &amp; Student Deals</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Attract campus students with limited-time discounts and promo codes
        </p>
      </div>

      {/* ─── Active Deals ─── */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Flame className="size-4 text-amber-500" />
          <span>Active Student Promotions</span>
        </h2>

        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-md">
              CODE: MOMO20
            </span>
            <span className="text-xs font-bold text-emerald-500">20% Flat Discount</span>
          </div>
          <h3 className="text-sm font-black text-foreground">Evening Student Craving Deal</h3>
          <p className="text-xs text-muted-foreground">
            Applicable on orders above ₹150 for all verified students on campus.
          </p>
        </div>
      </div>
    </main>
  );
}
