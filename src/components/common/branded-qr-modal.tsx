"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Check,
  Copy,
  Download,
  QrCode,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";


/**
 * Per-surface accent, so an event card, a profile card and an article card are
 * recognisably different at a glance while staying on the CampusLoop palette.
 */
const CATEGORY_THEMES = {
  event: { qrDark: "#1e1b4b", accent: "#7c3aed", tint: "#f5f3ff", border: "#ddd6fe" },
  profile: { qrDark: "#172554", accent: "#2563eb", tint: "#eff6ff", border: "#bfdbfe" },
  article: { qrDark: "#3b0764", accent: "#9333ea", tint: "#faf5ff", border: "#e9d5ff" },
  community: { qrDark: "#042f2e", accent: "#0d9488", tint: "#f0fdfa", border: "#99f6e4" },
  general: { qrDark: "#1e1b4b", accent: "#6366f1", tint: "#eef2ff", border: "#c7d2fe" },
} as const;

export interface BrandedQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badgeText?: string;
  shortUrl: string;
  category?: "event" | "profile" | "article" | "community" | "general";
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
  const theme = CATEGORY_THEMES[category] ?? CATEGORY_THEMES.general;

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Generate QR code whenever shortUrl changes
  useEffect(() => {
    if (!shortUrl) return;

    QRCode.toDataURL(shortUrl, {
      width: 480,
      margin: 1.5,
      color: {
        dark: theme.qrDark,
        light: "#ffffff",
      },
      // "H" keeps the code scannable despite the logo badge covering the centre.
      errorCorrectionLevel: "H",
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code Generation Error:", err);
      });
  }, [shortUrl, theme.qrDark]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Short link copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} — Check it out on CampusLoop!`,
          url: shortUrl,
        });
      } catch (err) {
        // A user dismissing the share sheet is not a failure worth reporting.
        if ((err as Error)?.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  }

  /**
   * Generates a high-res, styled PNG card matching og-image.png design system
   */
  async function handleDownloadCard() {
    if (!qrDataUrl) return;
    setIsGeneratingImage(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // High-res canvas dimensions (1200 x 1400)
      const width = 1200;
      const height = 1400;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Gradient (Soft modern violet / indigo gradient)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#f8fafc");
      bgGrad.addColorStop(0.5, "#f1f5f9");
      bgGrad.addColorStop(1, "#ede9fe");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Corner Ambient Aura Blobs
      const radGrad1 = ctx.createRadialGradient(100, 100, 10, 100, 100, 450);
      radGrad1.addColorStop(0, "rgba(168, 85, 247, 0.25)");
      radGrad1.addColorStop(1, "rgba(168, 85, 247, 0)");
      ctx.fillStyle = radGrad1;
      ctx.fillRect(0, 0, width, height);

      const radGrad2 = ctx.createRadialGradient(width - 100, height - 100, 10, width - 100, height - 100, 500);
      radGrad2.addColorStop(0, "rgba(99, 102, 241, 0.22)");
      radGrad2.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = radGrad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Central Card Container (Glassmorphic white card)
      const cardX = 90;
      const cardY = 80;
      const cardW = width - 180;
      const cardH = height - 160;
      const radius = 48;

      ctx.save();
      ctx.shadowColor = "rgba(79, 70, 229, 0.15)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fill();
      ctx.restore();

      // Card Border
      ctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Header: CampusLoop Violet Logo + Brand Name
      ctx.save();
      // Draw gradient 'C' logo circle
      const logoX = cardX + cardW / 2 - 130;
      const logoY = cardY + 110;
      const logoGrad = ctx.createLinearGradient(logoX - 35, logoY - 35, logoX + 35, logoY + 35);
      logoGrad.addColorStop(0, "#8b5cf6");
      logoGrad.addColorStop(1, "#6366f1");

      ctx.fillStyle = logoGrad;
      ctx.beginPath();
      ctx.arc(logoX, logoY, 36, 0, Math.PI * 2);
      ctx.fill();

      // Inner C cutout
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(logoX, logoY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = logoGrad;
      ctx.fillRect(logoX + 4, logoY - 14, 28, 28);

      // Brand Text
      ctx.fillStyle = "#09090b";
      ctx.font = "bold 56px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("CampusLoop", logoX + 52, logoY + 18);
      ctx.restore();

      // Vertical baseline for the title; an avatar pushes everything below it down.
      let titleY = 310;

      // 5. Verified Pill Badge
      ctx.save();
      const badgeY = cardY + 200;
      const badgeTextFull = `✓  ${badgeText.toUpperCase()}`;
      ctx.font = "bold 20px Inter, sans-serif";
      const textWidth = ctx.measureText(badgeTextFull).width;
      const badgeW = textWidth + 48;
      const badgeX = cardX + (cardW - badgeW) / 2;

      ctx.fillStyle = theme.tint;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, 42, 21);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = theme.accent;
      ctx.textAlign = "center";
      ctx.fillText(badgeTextFull, cardX + cardW / 2, badgeY + 28);
      ctx.restore();

      // 5b. Optional circular avatar (profile shares)
      if (avatarUrl) {
        try {
          const avatarImg = new Image();
          avatarImg.crossOrigin = "anonymous";
          avatarImg.src = avatarUrl;
          await new Promise((resolve, reject) => {
            avatarImg.onload = resolve;
            avatarImg.onerror = reject;
          });

          const avatarSize = 132;
          const avatarCx = cardX + cardW / 2;
          const avatarCy = cardY + 300;

          ctx.save();
          ctx.beginPath();
          ctx.arc(avatarCx, avatarCy, avatarSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            avatarImg,
            avatarCx - avatarSize / 2,
            avatarCy - avatarSize / 2,
            avatarSize,
            avatarSize
          );
          ctx.restore();

          // Accent ring around the avatar
          ctx.save();
          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(avatarCx, avatarCy, avatarSize / 2 + 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          titleY += 110;
        } catch {
          // A blocked or CORS-restricted avatar must not sink the whole card.
        }
      }

      // 6. Title
      ctx.save();
      ctx.fillStyle = "#09090b";
      ctx.font = "bold 44px Inter, sans-serif";
      ctx.textAlign = "center";
      const truncatedTitle = title.length > 34 ? `${title.slice(0, 32)}...` : title;
      ctx.fillText(truncatedTitle, cardX + cardW / 2, cardY + titleY);

      // Subtitle
      if (subtitle) {
        ctx.fillStyle = "#64748b";
        ctx.font = "500 26px Inter, sans-serif";
        const truncatedSub = subtitle.length > 50 ? `${subtitle.slice(0, 48)}...` : subtitle;
        ctx.fillText(truncatedSub, cardX + cardW / 2, cardY + titleY + 50);
      }
      ctx.restore();

      // 7. QR Code Image in Center
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      const qrSize = 460;
      const qrX = cardX + (cardW - qrSize) / 2;
      const qrY = cardY + titleY + 110;

      // QR Code Container Box with Soft Glow
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(124, 58, 237, 0.12)";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 28);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // 8. Short Link Display Banner
      ctx.save();
      const linkY = qrY + qrSize + 60;
      const displayUrl = shortUrl.replace(/^https?:\/\//, "");
      ctx.fillStyle = "#f8fafc";
      const linkBoxW = cardW - 120;
      const linkBoxX = cardX + 60;
      ctx.beginPath();
      ctx.roundRect(linkBoxX, linkY, linkBoxW, 64, 16);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = theme.accent;
      ctx.font = "bold 28px Inter, monospace";
      ctx.textAlign = "center";
      ctx.fillText(displayUrl, cardX + cardW / 2, linkY + 42);
      ctx.restore();

      // 9. Footer Watermark: "Scan with any Camera app • campusloop.space"
      ctx.save();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📷 Scan with any camera app  •  campusloop.space", cardX + cardW / 2, cardY + cardH - 60);
      ctx.restore();

      // 10. Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      const safeSlug = title.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 24);
      a.download = `campusloop-${safeSlug}-qr.png`;
      a.href = dataUrl;
      a.click();

      toast.success("Branded QR Card downloaded! 🎨");
    } catch (err) {
      console.error("Card export error:", err);
      toast.error("Failed to generate image card");
    } finally {
      setIsGeneratingImage(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-3xl">
        <DialogTitle className="sr-only">{title} QR Code</DialogTitle>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <QrCode className="size-4" />
            </div>
            <span className="text-sm font-black text-foreground tracking-tight">
              Share QR Code
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Branded Visual Card Preview (Og-image design system) */}
        <div className="p-5 pt-1">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-b from-card via-card/90 to-primary/5 p-5 text-center shadow-lg transition-all"
          >
            {/* Top Branding Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-linear-to-br from-primary via-purple-600 to-indigo-600 text-white font-black text-xs shadow-sm">
                  C
                </div>
                <span className="text-xs font-black tracking-tight text-foreground">
                  Campus<span className="text-primary">Loop</span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                <ShieldCheck className="size-3" />
                <span>{badgeText}</span>
              </div>
            </div>

            {/* Optional avatar for profile shares */}
            {avatarUrl && (
              <div className="flex justify-center pt-4">
                <img
                  src={avatarUrl}
                  alt={title}
                  className="size-16 rounded-full border-2 border-primary object-cover shadow-md"
                />
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="pt-4 pb-3">
              <h3 className="text-base font-black text-foreground tracking-tight line-clamp-1">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            {/* QR Code Graphic Frame */}
            <div className="my-2 flex justify-center">
              <div className="relative rounded-2xl bg-white p-3 shadow-inner border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`${title} QR Code`}
                    className="size-48 rounded-lg object-contain"
                  />
                ) : (
                  <div className="size-48 animate-pulse rounded-lg bg-slate-100 flex items-center justify-center text-xs text-muted-foreground font-bold">
                    Generating QR...
                  </div>
                )}
                {/* Center Badge Watermark */}
                <div className="absolute inset-0 m-auto flex size-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-indigo-600 shadow-md border-2 border-white pointer-events-none">
                  <span className="text-white font-black text-xs">C</span>
                </div>
              </div>
            </div>

            {/* Short Link Display Pill */}
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-muted/60 px-3 py-2 border border-border/40">
              <span className="text-xs font-bold text-foreground font-mono truncate max-w-[240px]">
                {shortUrl.replace(/^https?:\/\//, "")}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Copy short link"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>

            {/* Card Footer Microcopy */}
            <p className="mt-2 text-[10px] text-muted-foreground/70 font-medium">
              Scan with any phone camera • Verified on CampusLoop
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isGeneratingImage || !qrDataUrl}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-white hover:opacity-95 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/20"
            >
              <Download className="size-3.5" />
              <span>{isGeneratingImage ? "Saving..." : "Save Image"}</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <Share2 className="size-3.5" />
              <span>Share App</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
