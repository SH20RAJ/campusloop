"use client";

import { Check, Copy, Download, Share2, Sparkles, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export interface BrandedQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badgeText?: string;
  shortUrl: string;
  category?: "event" | "profile" | "article" | "community" | "store" | "general";
  avatarUrl?: string | null;
}

export function BrandedQrModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badgeText = "Verified Student Network",
  shortUrl,
  category = "general",
  avatarUrl,
}: BrandedQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Generate crisp QR code data URL
  useEffect(() => {
    if (!isOpen || !shortUrl) return;

    QRCode.toDataURL(shortUrl, {
      width: 720,
      margin: 2,
      color: {
        dark: "#09090b",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [isOpen, shortUrl]);

  const displayUrl = useMemo(() => {
    return shortUrl.replace(/^https?:\/\//, "");
  }, [shortUrl]);

  const handleCopyLink = async () => {
    try {
      sounds.ting();
      haptics.light();
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadCard = async () => {
    if (!qrDataUrl) return;
    setIsGeneratingImage(true);

    try {
      sounds.tap();
      haptics.medium();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const width = 800;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;

      // Dark minimalist background
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      // Subtle gradient header
      const grad = ctx.createLinearGradient(0, 0, width, 300);
      grad.addColorStop(0, "rgba(59, 130, 246, 0.15)");
      grad.addColorStop(1, "rgba(9, 9, 11, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, 300);

      // Draw CampusLoop Logo text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CampusLoop", width / 2, 80);

      // Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      const badgeW = 260;
      const badgeH = 34;
      const badgeX = (width - badgeW) / 2;
      const badgeY = 110;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 14px system-ui, sans-serif";
      ctx.fillText(badgeText.toUpperCase(), width / 2, 132);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px system-ui, sans-serif";
      const truncatedTitle = title.length > 32 ? `${title.slice(0, 30)}...` : title;
      ctx.fillText(truncatedTitle, width / 2, 200);

      // Subtitle
      if (subtitle) {
        ctx.fillStyle = "#71717a";
        ctx.font = "500 20px system-ui, sans-serif";
        const truncatedSub = subtitle.length > 44 ? `${subtitle.slice(0, 42)}...` : subtitle;
        ctx.fillText(truncatedSub, width / 2, 240);
      }

      // QR Code Container Box
      const qrBoxSize = 440;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = 300;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
      ctx.fill();

      // Draw QR Image
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = qrDataUrl;
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
      });

      const qrPadding = 30;
      ctx.drawImage(
        qrImg,
        qrBoxX + qrPadding,
        qrBoxY + qrPadding,
        qrBoxSize - qrPadding * 2,
        qrBoxSize - qrPadding * 2
      );

      // URL Pill Box
      const pillW = 440;
      const pillH = 54;
      const pillX = (width - pillW) / 2;
      const pillY = 780;
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 27);
      ctx.fill();

      ctx.fillStyle = "#e4e4e7";
      ctx.font = "bold 18px monospace";
      ctx.fillText(displayUrl, width / 2, pillY + 34);

      // Footer
      ctx.fillStyle = "#52525b";
      ctx.font = "500 16px system-ui, sans-serif";
      ctx.fillText("Scan with phone camera · campusloop.space", width / 2, 890);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 1.0)
      );
      if (!blob) throw new Error("Could not create image blob");

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const fileSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24);
      a.download = `campusloop-${fileSlug}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success("QR card saved to downloads");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR card");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} on CampusLoop`,
          url: shortUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[380px] p-0 overflow-hidden border-0 bg-card/95 shadow-2xl rounded-3xl backdrop-blur-2xl">
        <DialogTitle className="sr-only">Share {title} via QR Code</DialogTitle>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-xs">
                QR
              </span>
              <div>
                <h3 className="text-sm font-black text-foreground">Share via QR</h3>
                <p className="text-[11px] text-muted-foreground">Scan with any phone camera</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-7 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Minimalist QR Card */}
          <div className="rounded-2xl bg-muted/30 p-4 text-center space-y-3">
            {avatarUrl && (
              <div className="flex justify-center">
                <img
                  src={avatarUrl}
                  alt={title}
                  className="size-14 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
                />
              </div>
            )}

            <div className="space-y-0.5 px-2">
              <h4 className="text-sm font-black text-foreground truncate">{title}</h4>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>

            {/* QR code canvas */}
            <div className="flex justify-center py-1">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`${title} QR Code`}
                    className="size-44 object-contain rounded-lg"
                  />
                ) : (
                  <div className="size-44 animate-pulse rounded-lg bg-slate-100 flex items-center justify-center text-xs text-muted-foreground font-bold">
                    Generating...
                  </div>
                )}
              </div>
            </div>

            {/* Tap to copy short link pill */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Click to copy link"
              className="w-full flex items-center justify-between rounded-xl bg-card/80 hover:bg-card px-3 py-2 text-left transition-colors cursor-pointer shadow-2xs group"
            >
              <span className="text-xs font-mono font-bold text-foreground truncate max-w-[240px]">
                {displayUrl}
              </span>
              <span className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors ml-2">
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isGeneratingImage || !qrDataUrl}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <Download className="size-3.5" />
              <span>{isGeneratingImage ? "Saving..." : "Save Image"}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-muted/60 hover:bg-muted text-foreground text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <Share2 className="size-3.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
