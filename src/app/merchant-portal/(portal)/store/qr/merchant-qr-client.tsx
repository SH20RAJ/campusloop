"use client";

import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { Copy,Printer,QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export function MerchantQrClient() {
  const [selectedQrType, setSelectedQrType] = useState<"store" | "menu" | "pickup">("store");

  const { data } = useSWR<{ merchant: any }>("/api/merchant/store", fetcher);
  const merchant = data?.merchant;

  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://campusloop.space";

  const targetUrl = merchant
    ? `${baseUrl}/app/marketplace/store/${merchant.id}`
    : `${baseUrl}/app/marketplace`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    targetUrl
  )}`;

  function handleCopyLink() {
    sounds.tap();
    haptics.light();
    navigator.clipboard.writeText(targetUrl);
    toast.success("Store link copied to clipboard! 🚀");
  }

  function handlePrint() {
    sounds.tap();
    haptics.light();
    window.print();
  }

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6 select-none pb-24">
      {/* ─── Printable CSS Injection ─── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-poster, #printable-qr-poster * {
            visibility: visible;
          }
          #printable-qr-poster {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            padding: 40px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <QrCode className="size-5 text-emerald-500" />
          <span>Offline QR Codes &amp; Table Posters</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate high-resolution printable table stands and store checkout counters
        </p>
      </div>

      {/* ─── QR Code Poster Card ─── */}
      <div
        id="printable-qr-poster"
        className="p-8 rounded-3xl bg-card border border-border/40 flex flex-col items-center text-center space-y-5 shadow-lg max-w-sm mx-auto"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
            Verified Campus Partner
          </span>
          <h2 className="text-xl font-black text-foreground pt-1">{merchant?.name || "Campus Store"}</h2>
          <p className="text-xs text-muted-foreground">Scan with any smartphone camera to order</p>
        </div>

        {/* QR Code Canvas */}
        <div className="p-4 rounded-2xl bg-white border-2 border-border shadow-inner">
          <img src={qrImageUrl} alt="Store QR Code" className="size-52 object-contain" />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-xs font-black text-foreground">
            ⚡ Quick Order · Instant Campus Pickup
          </p>
          <p className="text-[10px] text-muted-foreground">
            Powered by CampusLoop Marketplace · campusloop.space
          </p>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="no-print flex items-center gap-2.5 w-full pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-11 rounded-2xl bg-foreground text-background font-black text-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          >
            <Printer className="size-4" />
            <span>Print Poster</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 h-11 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Copy className="size-4" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </main>
  );
}
