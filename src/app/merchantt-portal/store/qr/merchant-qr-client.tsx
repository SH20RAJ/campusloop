"use client";

import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { Copy, Download, Printer, QrCode, Share2, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export function MerchantQrClient() {
  const [selectedQrType, setSelectedQrType] = useState<"store" | "menu" | "pickup">("store");

  const { data } = useSWR<{ merchant: any }>("/api/merchant/store", fetcher);
  const merchant = data?.merchant;

  const storeUrl = typeof window !== "undefined" && merchant
    ? `${window.location.origin}/app/marketplace/store/${merchant.id}`
    : "https://campusloop.space/app/marketplace";

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    storeUrl
  )}`;

  function handleCopyLink() {
    sounds.tap();
    haptics.light();
    navigator.clipboard.writeText(storeUrl);
    toast.success("Store link copied to clipboard! 🚀");
  }

  function handlePrint() {
    sounds.tap();
    window.print();
  }

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6 select-none pb-24">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight">Offline QR Codes &amp; Posters</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate printable QR stickers to place on your dining tables and store counter
        </p>
      </div>

      {/* ─── QR Code Poster Card ─── */}
      <div className="p-6 rounded-3xl bg-card border border-border/40 flex flex-col items-center text-center space-y-4 shadow-md max-w-sm mx-auto">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            CampusLoop Verified Partner
          </span>
          <h2 className="text-lg font-black text-foreground">{merchant?.name || "Campus Store"}</h2>
          <p className="text-xs text-muted-foreground">Scan with any phone camera to order</p>
        </div>

        {/* QR Code Canvas */}
        <div className="p-4 rounded-2xl bg-white border-2 border-border shadow-inner">
          <img src={qrImageUrl} alt="Store QR Code" className="size-48 object-contain" />
        </div>

        <p className="text-[11px] font-semibold text-muted-foreground">
          {selectedQrType === "store"
            ? "Scan to view our store & daily specials"
            : selectedQrType === "menu"
            ? "Scan to browse full menu & customize items"
            : "Scan to order pickup & skip the counter line"}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-10 rounded-2xl bg-foreground text-background font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Printer className="size-3.5" />
            <span>Print Poster</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 h-10 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Copy className="size-3.5" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </main>
  );
}
