"use client";

import { Check, Copy, Download, QrCode, Share2, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
   * Generates a pixel-perfect 1200 x 1440 image matching the template using /logo.png
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

      const radGrad2 = ctx.createRadialGradient(
        width - 150,
        height - 150,
        20,
        width - 150,
        height - 150,
        550
      );
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

      // 3. Header: CampusLoop /logo.png + Brand Name
      ctx.save();
      const brandY = cardY + 115;
      const brandLogoX = cardX + cardW / 2 - 170;

      // Load and draw official /logo.png
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = "/logo.png";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        ctx.drawImage(logoImg, brandLogoX - 36, brandY - 36, 72, 72);
      } catch {
        // Fallback
        const logoGrad = ctx.createLinearGradient(brandLogoX - 32, brandY - 32, brandLogoX + 32, brandY + 32);
        logoGrad.addColorStop(0, "#7c3aed");
        logoGrad.addColorStop(1, "#3b82f6");
        ctx.fillStyle = logoGrad;
        ctx.beginPath();
        ctx.arc(brandLogoX, brandY, 36, 0, Math.PI * 2);
        ctx.fill();
      }

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

      // Draw Center Logo on QR Code
      try {
        const centerLogo = new Image();
        centerLogo.crossOrigin = "anonymous";
        centerLogo.src = "/logo.png";
        await new Promise((resolve) => {
          centerLogo.onload = resolve;
          centerLogo.onerror = resolve;
        });
        const centerLogoSize = 80;
        const centerLogoX = qrX + (qrSize - centerLogoSize) / 2;
        const centerLogoY = qrY + (qrSize - centerLogoSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(qrX + qrSize / 2, qrY + qrSize / 2, centerLogoSize / 2 + 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.drawImage(centerLogo, centerLogoX, centerLogoY, centerLogoSize, centerLogoSize);
      } catch {}

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
      const safeSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 24);
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

        {/* Modal Top Nav */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <QrCode className="size-4" />
            </div>
            <span className="text-sm font-black text-foreground tracking-tight">Share QR Code</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Visual Card Preview matching the pastel light card template */}
        <div className="p-4 sm:p-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ece5ff] via-[#e9e3fe] to-[#ddf1ff] p-4 sm:p-5 shadow-lg select-none">
            {/* Inner White Card */}
            <div className="relative rounded-2xl bg-white p-5 text-center shadow-xl border border-black/5 space-y-3">
              {/* Brand Header with /logo.png */}
              <div className="flex items-center justify-center gap-2.5">
                <img src="/logo.png" alt="CampusLoop" className="size-8 object-contain shrink-0" />
                <span className="text-xl font-black tracking-tight text-[#0f172a]">
                  Campus<span className="text-[#2563eb]">Loop</span>
                </span>
              </div>

              {/* Badge Pill */}
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe]">
                  ✓ {badgeText.toUpperCase()}
                </span>
              </div>

              {/* Avatar */}
              {avatarUrl && (
                <div className="flex justify-center pt-1">
                  <img
                    src={avatarUrl}
                    alt={title}
                    className="size-18 rounded-full border-3 border-[#3b82f6] object-cover shadow-md"
                  />
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="space-y-0.5 pt-1">
                <h3 className="text-base sm:text-lg font-black text-[#0f172a] tracking-tight line-clamp-1">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] font-semibold text-[#64748b] line-clamp-1">{subtitle}</p>
                )}
              </div>

              {/* QR Code Graphic Frame with /logo.png Center Watermark */}
              <div className="my-2 flex justify-center">
                <div className="relative rounded-2xl bg-white p-2.5 shadow-sm border border-slate-200">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`${title} QR Code`}
                      className="size-40 sm:size-44 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="size-40 sm:size-44 animate-pulse rounded-lg bg-slate-100 flex items-center justify-center text-xs text-muted-foreground font-bold">
                      Generating QR...
                    </div>
                  )}

                  {/* Center /logo.png badge */}
                  <div className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 pointer-events-none p-0.5">
                    <img src="/logo.png" alt="" className="size-full object-contain" />
                  </div>
                </div>
              </div>

              {/* Short Link Display Pill */}
              <div className="mt-2 flex items-center justify-between rounded-xl bg-[#eff6ff] px-3.5 py-2 border border-[#dbeafe]">
                <span className="text-xs font-bold text-[#2563eb] font-mono truncate max-w-[240px]">
                  {shortUrl.replace(/^https?:\/\//, "")}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[#2563eb] hover:opacity-80 transition-opacity cursor-pointer ml-2"
                  title="Copy short link"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>

              {/* Card Footer Microcopy */}
              <p className="text-[10px] text-[#94a3b8] font-bold">
                📷 Scan with any camera app • campusloop.space
              </p>
            </div>
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
