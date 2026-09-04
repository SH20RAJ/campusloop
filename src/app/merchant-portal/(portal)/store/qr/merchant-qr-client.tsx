"use client";

import { Copy, Download, Printer, QrCode, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { CampusQrCode, generateBrandedQrDataUrl } from "@/components/common/campus-qr-code";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

export function MerchantQrClient() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { data } = useSWR<{ merchant: any }>("/api/merchant/store", fetcher);
  const merchant = data?.merchant;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";

  const targetUrl = merchant
    ? `${baseUrl}/app/marketplace/store/${merchant.id}`
    : `${baseUrl}/app/marketplace`;

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

  async function handleDownloadQr() {
    sounds.tap();
    haptics.success();
    setIsDownloading(true);
    try {
      const dataUrl = await generateBrandedQrDataUrl({
        value: targetUrl,
        size: 1080,
        logoUrl: "/logo.png",
        darkColor: "#0f172a",
        lightColor: "#ffffff",
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${(merchant?.name || "campus-store").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("High-res QR Code PNG downloaded! 🖼️");
    } catch {
      toast.error("Failed to generate QR download");
    } finally {
      setIsDownloading(false);
    }
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
          <QrCode className="size-5 text-primary" />
          <span>Offline QR Codes &amp; Table Posters</span>
          <Zap className="size-4 text-primary animate-pulse" />
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Print ultra high-resolution table standees and counter checkout posters with embedded CampusLoop
          crest
        </p>
      </div>

      {/* ─── QR Code Poster Card ─── */}
      <div
        id="printable-qr-poster"
        className="p-8 rounded-3xl bg-card border border-border flex flex-col items-center text-center space-y-5 shadow-xl max-w-sm mx-auto transition-all"
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2 pb-0.5">
            <img src="/logo.png" alt="CampusLoop" className="size-5 object-contain" />
            <span className="text-xs font-black tracking-tight text-foreground">
              Campus<span className="text-primary">Loop</span>
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 inline-block">
            Verified Campus Partner
          </span>
          <h2 className="text-xl font-black text-foreground pt-1">{merchant?.name || "Campus Store"}</h2>
          <p className="text-xs text-muted-foreground font-medium">
            Scan with camera to view live menu &amp; order
          </p>
        </div>

        {/* Dynamic High-Res Branded QR Code */}
        <div className="p-3 rounded-2xl bg-white border border-border shadow-inner">
          <CampusQrCode
            value={targetUrl}
            size={220}
            logoUrl="/logo.png"
            bordered={false}
            darkColor="#0f172a"
          />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-xs font-black text-foreground">
            ⚡ Quick Order · Instant Campus Delivery &amp; Pickup
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">
            Powered by CampusLoop Marketplace · campusloop.space
          </p>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="no-print flex flex-col gap-2 w-full pt-2">
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 h-11 rounded-2xl bg-foreground text-background font-black text-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm active:scale-95"
            >
              <Printer className="size-4" />
              <span>Print Poster</span>
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadQr}
              className="flex-1 h-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 font-black text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="size-4" />
              <span>Download PNG</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full h-10 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Copy className="size-3.5" />
            <span>Copy Store Link</span>
          </button>
        </div>
      </div>
    </main>
  );
}
