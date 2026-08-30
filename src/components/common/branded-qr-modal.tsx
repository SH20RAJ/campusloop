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
 * Per-surface accent themes
 */
const CATEGORY_THEMES = {
  event: { qrDark: "#1e1b4b", accent: "#2563eb", tint: "#eff6ff", border: "#bfdbfe" },
  profile: { qrDark: "#172554", accent: "#2563eb", tint: "#eff6ff", border: "#bfdbfe" },
  article: { qrDark: "#1e1b4b", accent: "#2563eb", tint: "#eff6ff", border: "#bfdbfe" },
  community: { qrDark: "#042f2e", accent: "#0d9488", tint: "#f0fdfa", border: "#99f6e4" },
  store: { qrDark: "#451a03", accent: "#d97706", tint: "#fffbeb", border: "#fde68a" },
  general: { qrDark: "#1e1b4b", accent: "#2563eb", tint: "#eff6ff", border: "#bfdbfe" },
} as const;

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

  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.general;

  // Generate crisp QR code data URL
  useEffect(() => {
    if (!isOpen || !shortUrl) return;

    QRCode.toDataURL(shortUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: theme.qrDark,
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [isOpen, shortUrl, theme.qrDark]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Short link copied! 📋");
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
          text: subtitle || `Check out ${title} on CampusLoop!`,
          url: shortUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      void handleCopyLink();
    }
  }

  /**
   * Generates a pixel-perfect 1200 x 1440 image matching the template
   */
  async function handleDownloadCard() {
    if (!qrDataUrl) return;
    setIsGeneratingImage(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // High-res canvas dimensions (1200 x 1440)
      const width = 1200;
      const height = 1440;
      canvas.width = width;
      canvas.height = height;

      // 1. Outer Soft Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#ece5ff");
      bgGrad.addColorStop(0.5, "#e9e3fe");
      bgGrad.addColorStop(1, "#ddf1ff");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient corner glow blobs
      const radGrad1 = ctx.createRadialGradient(150, 150, 20, 150, 150, 500);
      radGrad1.addColorStop(0, "rgba(192, 132, 252, 0.35)");
      radGrad1.addColorStop(1, "rgba(192, 132, 252, 0)");
      ctx.fillStyle = radGrad1;
      ctx.fillRect(0, 0, width, height);

      const radGrad2 = ctx.createRadialGradient(width - 150, height - 150, 20, width - 150, height - 150, 550);
      radGrad2.addColorStop(0, "rgba(125, 211, 252, 0.35)");
      radGrad2.addColorStop(1, "rgba(125, 211, 252, 0)");
      ctx.fillStyle = radGrad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Central Floating White Card
      const cardX = 90;
      const cardY = 80;
      const cardW = width - 180;
      const cardH = height - 160;
      const radius = 48;

      ctx.save();
      ctx.shadowColor = "rgba(99, 102, 241, 0.14)";
      ctx.shadowBlur = 48;
      ctx.shadowOffsetY = 24;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fill();
      ctx.restore();

      // Card Border
      ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Header: CampusLoop Violet Logo + Brand Name
      ctx.save();
      const brandY = cardY + 115;
      const brandLogoX = cardX + cardW / 2 - 170;

      // Draw Gradient Crescent Moon Logo Circle
      const logoGrad = ctx.createLinearGradient(brandLogoX - 32, brandY - 32, brandLogoX + 32, brandY + 32);
      logoGrad.addColorStop(0, "#7c3aed");
      logoGrad.addColorStop(1, "#3b82f6");

      ctx.fillStyle = logoGrad;
      ctx.beginPath();
      ctx.arc(brandLogoX, brandY, 36, 0, Math.PI * 2);
      ctx.fill();

      // Inner white cutout crescent
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(brandLogoX + 10, brandY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = logoGrad;
      ctx.beginPath();
      ctx.arc(brandLogoX + 16, brandY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Brand Text
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 62px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("CampusLoop", brandLogoX + 54, brandY + 20);
      ctx.restore();

      // 4. Pill Badge: "✓ VERIFIED STUDENT NETWORK"
      ctx.save();
      const badgeY = cardY + 205;
      const badgeTextFull = `✓  ${badgeText.toUpperCase()}`;
      ctx.font = "bold 22px Inter, sans-serif";
      const textWidth = ctx.measureText(badgeTextFull).width;
      const badgeW = textWidth + 56;
      const badgeX = cardX + (cardW - badgeW) / 2;

      ctx.fillStyle = "#eff6ff";
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, 46, 23);
      ctx.fill();
      ctx.strokeStyle = "#bfdbfe";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#2563eb";
      ctx.textAlign = "center";
      ctx.fillText(badgeTextFull, cardX + cardW / 2, badgeY + 31);
      ctx.restore();

      let dynamicY = badgeY + 80;

      // 5. Optional Circular Avatar
      if (avatarUrl) {
        try {
          const avatarImg = new Image();
          avatarImg.crossOrigin = "anonymous";
          avatarImg.src = avatarUrl;
          await new Promise((resolve, reject) => {
            avatarImg.onload = resolve;
            avatarImg.onerror = reject;
          });

          const avatarSize = 136;
          const avatarCx = cardX + cardW / 2;
          const avatarCy = dynamicY + avatarSize / 2 + 10;

          // Shadow under avatar
          ctx.save();
          ctx.shadowColor = "rgba(37, 99, 235, 0.2)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 8;
          ctx.beginPath();
          ctx.arc(avatarCx, avatarCy, avatarSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.restore();

          // Clip avatar image
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

          // Border ring around avatar
          ctx.save();
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(avatarCx, avatarCy, avatarSize / 2 + 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();

          dynamicY += avatarSize + 30;
        } catch {
          dynamicY += 20;
        }
      } else {
        dynamicY += 30;
      }

      // 6. Title
      ctx.save();
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 48px Inter, sans-serif";
      ctx.textAlign = "center";
      const truncatedTitle = title.length > 32 ? `${title.slice(0, 30)}...` : title;
      ctx.fillText(truncatedTitle, cardX + cardW / 2, dynamicY);

      // Subtitle
      if (subtitle) {
        ctx.fillStyle = "#64748b";
        ctx.font = "600 25px Inter, sans-serif";
        const truncatedSub = subtitle.length > 46 ? `${subtitle.slice(0, 44)}...` : subtitle;
        ctx.fillText(truncatedSub, cardX + cardW / 2, dynamicY + 44);
        dynamicY += 44;
      }
      ctx.restore();

      dynamicY += 30;

      // 7. QR Code Container Card in Center
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      const qrSize = 440;
      const qrX = cardX + (cardW - qrSize) / 2;
      const qrY = dynamicY + 20;

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.roundRect(qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 32);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // 8. Short Link Banner Pill
      ctx.save();
      const linkY = qrY + qrSize + 54;
      const displayUrl = shortUrl.replace(/^https?:\/\//, "");
      const linkBoxW = cardW - 120;
      const linkBoxX = cardX + 60;

      ctx.fillStyle = "#eff6ff";
      ctx.beginPath();
      ctx.roundRect(linkBoxX, linkY, linkBoxW, 64, 20);
      ctx.fill();
      ctx.strokeStyle = "#dbeafe";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#2563eb";
      ctx.font = "bold 28px Inter, monospace";
      ctx.textAlign = "center";
      ctx.fillText(displayUrl, cardX + cardW / 2, linkY + 42);
      ctx.restore();

      // 9. Footer Watermark: "📷 Scan with any camera app • campusloop.space"
      ctx.save();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 21px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📷 Scan with any camera app  •  campusloop.space", cardX + cardW / 2, cardY + cardH - 50);
      ctx.restore();

      // 10. Export Download File
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
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/30">
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

        {/* Branded Visual Card Preview */}
        <div className="p-5 pt-3">
          <div
            className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 p-5 text-center shadow-lg"
          >
            {/* Top Branding Banner */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-blue-600 text-white font-black text-xs shadow-sm">
                  C
                </div>
                <span className="text-sm font-black tracking-tight text-foreground">
                  Campus<span className="text-primary">Loop</span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                <ShieldCheck className="size-3" />
                <span>{badgeText}</span>
              </div>
            </div>

            {/* Optional Avatar */}
            {avatarUrl && (
              <div className="flex justify-center pt-2">
                <img
                  src={avatarUrl}
                  alt={title}
                  className="size-16 rounded-full border-2 border-blue-500 object-cover shadow-md"
                />
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="pt-3 pb-2">
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
              <div className="relative rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`${title} QR Code`}
                    className="size-44 rounded-lg object-contain"
                  />
                ) : (
                  <div className="size-44 animate-pulse rounded-lg bg-slate-100 flex items-center justify-center text-xs text-muted-foreground font-bold">
                    Generating QR...
                  </div>
                )}
                <div className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-blue-600 shadow-md border-2 border-white pointer-events-none">
                  <span className="text-white font-black text-[10px]">C</span>
                </div>
              </div>
            </div>

            {/* Short Link Display Pill */}
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 px-3 py-2 border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono truncate max-w-[240px]">
                {shortUrl.replace(/^https?:\/\//, "")}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity cursor-pointer"
                title="Copy short link"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>

            {/* Card Footer Microcopy */}
            <p className="mt-2 text-[10px] text-muted-foreground/80 font-medium">
              📷 Scan with any camera app • campusloop.space
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
              <span>Share</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
