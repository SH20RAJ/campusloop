"use client";

import { Check, Copy, Download, MessageCircle, Palette, QrCode, Share2, Smartphone, Zap, Square, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

/**
 * 5 Rich Visual Themes for the Branded QR Card
 */
export type QrCardTheme = "aurora" | "midnight" | "sunset" | "emerald" | "studio";
export type QrAspectRatio = "card" | "story"; // 'card' = 4:5, 'story' = 9:16

interface ThemeDefinition {
  id: QrCardTheme;
  name: string;
  emoji: string;
  outerBg: string;
  cardBg: string;
  cardBorder: string;
  brandText: string;
  accent: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  titleColor: string;
  subColor: string;
  qrDark: string;
  qrLight: string;
  linkBg: string;
  linkBorder: string;
  linkText: string;
  tagColor: string;
  watermark: string;
  // Canvas specifics
  canvasBgGradient: [string, string, string];
  canvasCardBg: string;
  canvasCardBorder: string;
  canvasAccent: string;
  canvasBadgeBg: string;
  canvasBadgeBorder: string;
  canvasBadgeText: string;
  canvasTitle: string;
  canvasSub: string;
  canvasLinkBg: string;
  canvasLinkBorder: string;
  canvasLinkText: string;
  canvasWatermark: string;
  canvasGlow1: string;
  canvasGlow2: string;
}

const THEMES: Record<QrCardTheme, ThemeDefinition> = {
  aurora: {
    id: "aurora",
    name: "Aurora",
    emoji: "🌌",
    outerBg: "from-indigo-600/20 via-purple-600/15 to-cyan-500/20",
    cardBg: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
    cardBorder: "border-indigo-200/60 dark:border-indigo-900/50",
    brandText: "text-slate-950 dark:text-white",
    accent: "#6366f1",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/60",
    badgeBorder: "border-indigo-200 dark:border-indigo-800/80",
    badgeText: "text-indigo-600 dark:text-indigo-300",
    titleColor: "text-slate-950 dark:text-white",
    subColor: "text-slate-600 dark:text-slate-300",
    qrDark: "#1e1b4b",
    qrLight: "#FFFFFF",
    linkBg: "bg-indigo-50/90 dark:bg-indigo-950/50",
    linkBorder: "border-indigo-200/80 dark:border-indigo-800/60",
    linkText: "text-indigo-600 dark:text-indigo-300",
    tagColor: "text-indigo-500",
    watermark: "text-slate-400 dark:text-slate-500",
    canvasBgGradient: ["#0f172a", "#1e1b4b", "#0f172a"],
    canvasCardBg: "#ffffff",
    canvasCardBorder: "#e0e7ff",
    canvasAccent: "#4f46e5",
    canvasBadgeBg: "#eef2ff",
    canvasBadgeBorder: "#c7d2fe",
    canvasBadgeText: "#4338ca",
    canvasTitle: "#0f172a",
    canvasSub: "#475569",
    canvasLinkBg: "#f5f3ff",
    canvasLinkBorder: "#ddd6fe",
    canvasLinkText: "#4f46e5",
    canvasWatermark: "#94a3b8",
    canvasGlow1: "rgba(99, 102, 241, 0.4)",
    canvasGlow2: "rgba(168, 85, 247, 0.35)",
  },
  midnight: {
    id: "midnight",
    name: "Cyber",
    emoji: "🌙",
    outerBg: "from-slate-950 via-indigo-950/80 to-slate-900",
    cardBg: "bg-slate-950/95 backdrop-blur-xl",
    cardBorder: "border-cyan-500/30",
    brandText: "text-white",
    accent: "#06b6d4",
    badgeBg: "bg-cyan-950/70",
    badgeBorder: "border-cyan-500/40",
    badgeText: "text-cyan-300",
    titleColor: "text-white",
    subColor: "text-slate-400",
    qrDark: "#020617",
    qrLight: "#FFFFFF",
    linkBg: "bg-cyan-950/50",
    linkBorder: "border-cyan-500/30",
    linkText: "text-cyan-300",
    tagColor: "text-cyan-400",
    watermark: "text-slate-500",
    canvasBgGradient: ["#020617", "#0f172a", "#020617"],
    canvasCardBg: "#090d16",
    canvasCardBorder: "#1e293b",
    canvasAccent: "#06b6d4",
    canvasBadgeBg: "#082f49",
    canvasBadgeBorder: "#0284c7",
    canvasBadgeText: "#38bdf8",
    canvasTitle: "#ffffff",
    canvasSub: "#94a3b8",
    canvasLinkBg: "#0c1322",
    canvasLinkBorder: "#0e7490",
    canvasLinkText: "#38bdf8",
    canvasWatermark: "#64748b",
    canvasGlow1: "rgba(6, 182, 212, 0.35)",
    canvasGlow2: "rgba(99, 102, 241, 0.3)",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    outerBg: "from-orange-500/20 via-rose-500/15 to-amber-500/20",
    cardBg: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
    cardBorder: "border-rose-200/60 dark:border-rose-900/50",
    brandText: "text-slate-950 dark:text-white",
    accent: "#f43f5e",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60",
    badgeBorder: "border-rose-200 dark:border-rose-800/80",
    badgeText: "text-rose-600 dark:text-rose-300",
    titleColor: "text-slate-950 dark:text-white",
    subColor: "text-slate-600 dark:text-slate-300",
    qrDark: "#4c0519",
    qrLight: "#FFFFFF",
    linkBg: "bg-rose-50/90 dark:bg-rose-950/50",
    linkBorder: "border-rose-200/80 dark:border-rose-800/60",
    linkText: "text-rose-600 dark:text-rose-300",
    tagColor: "text-rose-500",
    watermark: "text-slate-400 dark:text-slate-500",
    canvasBgGradient: ["#fff1f2", "#ffe4e6", "#fef3c7"],
    canvasCardBg: "#ffffff",
    canvasCardBorder: "#fecdd3",
    canvasAccent: "#e11d48",
    canvasBadgeBg: "#ffe4e6",
    canvasBadgeBorder: "#fda4af",
    canvasBadgeText: "#be123c",
    canvasTitle: "#1c1917",
    canvasSub: "#57534e",
    canvasLinkBg: "#fff1f2",
    canvasLinkBorder: "#fecdd3",
    canvasLinkText: "#e11d48",
    canvasWatermark: "#a8a29e",
    canvasGlow1: "rgba(244, 63, 94, 0.35)",
    canvasGlow2: "rgba(245, 158, 11, 0.35)",
  },
  emerald: {
    id: "emerald",
    name: "Emerald",
    emoji: "🍀",
    outerBg: "from-emerald-500/20 via-teal-500/15 to-cyan-500/20",
    cardBg: "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
    cardBorder: "border-emerald-200/60 dark:border-emerald-900/50",
    brandText: "text-slate-950 dark:text-white",
    accent: "#10b981",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeBorder: "border-emerald-200 dark:border-emerald-800/80",
    badgeText: "text-emerald-600 dark:text-emerald-300",
    titleColor: "text-slate-950 dark:text-white",
    subColor: "text-slate-600 dark:text-slate-300",
    qrDark: "#022c22",
    qrLight: "#FFFFFF",
    linkBg: "bg-emerald-50/90 dark:bg-emerald-950/50",
    linkBorder: "border-emerald-200/80 dark:border-emerald-800/60",
    linkText: "text-emerald-600 dark:text-emerald-300",
    tagColor: "text-emerald-500",
    watermark: "text-slate-400 dark:text-slate-500",
    canvasBgGradient: ["#022c22", "#064e3b", "#042f2e"],
    canvasCardBg: "#ffffff",
    canvasCardBorder: "#a7f3d0",
    canvasAccent: "#059669",
    canvasBadgeBg: "#ecfdf5",
    canvasBadgeBorder: "#a7f3d0",
    canvasBadgeText: "#047857",
    canvasTitle: "#064e3b",
    canvasSub: "#374151",
    canvasLinkBg: "#ecfdf5",
    canvasLinkBorder: "#a7f3d0",
    canvasLinkText: "#059669",
    canvasWatermark: "#9ca3af",
    canvasGlow1: "rgba(16, 185, 129, 0.4)",
    canvasGlow2: "rgba(20, 184, 166, 0.35)",
  },
  studio: {
    id: "studio",
    name: "Studio",
    emoji: "⚪",
    outerBg: "from-slate-200/60 via-slate-100/50 to-slate-200/60 dark:from-slate-800 dark:to-slate-900",
    cardBg: "bg-white dark:bg-slate-950",
    cardBorder: "border-slate-300/80 dark:border-slate-800",
    brandText: "text-slate-950 dark:text-white",
    accent: "#0f172a",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeBorder: "border-slate-300 dark:border-slate-700",
    badgeText: "text-slate-800 dark:text-slate-200",
    titleColor: "text-slate-950 dark:text-white",
    subColor: "text-slate-600 dark:text-slate-400",
    qrDark: "#0f172a",
    qrLight: "#FFFFFF",
    linkBg: "bg-slate-100/80 dark:bg-slate-900",
    linkBorder: "border-slate-300 dark:border-slate-800",
    linkText: "text-slate-800 dark:text-slate-200",
    tagColor: "text-slate-600",
    watermark: "text-slate-400 dark:text-slate-600",
    canvasBgGradient: ["#f8fafc", "#f1f5f9", "#e2e8f0"],
    canvasCardBg: "#ffffff",
    canvasCardBorder: "#cbd5e1",
    canvasAccent: "#0f172a",
    canvasBadgeBg: "#f1f5f9",
    canvasBadgeBorder: "#cbd5e1",
    canvasBadgeText: "#1e293b",
    canvasTitle: "#0f172a",
    canvasSub: "#475569",
    canvasLinkBg: "#f8fafc",
    canvasLinkBorder: "#e2e8f0",
    canvasLinkText: "#0f172a",
    canvasWatermark: "#94a3b8",
    canvasGlow1: "rgba(148, 163, 184, 0.2)",
    canvasGlow2: "rgba(203, 213, 225, 0.25)",
  },
};

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
  // Pick default theme according to category
  const defaultTheme: QrCardTheme = useMemo(() => {
    switch (category) {
      case "event":
        return "aurora";
      case "profile":
        return "midnight";
      case "community":
        return "emerald";
      case "store":
        return "sunset";
      default:
        return "aurora";
    }
  }, [category]);

  const [activeTheme, setActiveTheme] = useState<QrCardTheme>(defaultTheme);
  const [aspectRatio, setAspectRatio] = useState<QrAspectRatio>("card");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Sync theme when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      setActiveTheme(defaultTheme);
    }
  }, [isOpen, defaultTheme]);

  const currentTheme = THEMES[activeTheme] || THEMES.aurora;

  // Generate crisp QR code data URL
  useEffect(() => {
    if (!isOpen || !shortUrl) return;

    QRCode.toDataURL(shortUrl, {
      width: 720,
      margin: 2,
      color: {
        dark: currentTheme.qrDark,
        light: currentTheme.qrLight,
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [isOpen, shortUrl, currentTheme.qrDark, currentTheme.qrLight]);

  const displayUrl = useMemo(() => {
    return shortUrl.replace(/^https?:\/\//, "");
  }, [shortUrl]);

  const handleCopyLink = async () => {
    try {
      sounds.ting();
      haptics.light();
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Short link copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsAppShare = () => {
    sounds.ting();
    haptics.light();
    const shareMessage = `Check out *${title}* on CampusLoop! 🎓🚀\n\n${subtitle ? `${subtitle}\n\n` : ""}🔗 ${shortUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    haptics.light();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle || `Check out ${title} on CampusLoop!`,
          url: shortUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      void handleCopyLink();
    }
  };

  /**
   * Builds the canvas representation and returns canvas instance
   */
  const buildCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    // Dimensions:
    // Card: 1080 x 1350 (4:5 portrait)
    // Story: 1080 x 1920 (9:16 story)
    const isStory = aspectRatio === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1350;
    canvas.width = width;
    canvas.height = height;

    const t = currentTheme;

    // 1. Outer Rich Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, t.canvasBgGradient[0]);
    bgGrad.addColorStop(0.5, t.canvasBgGradient[1]);
    bgGrad.addColorStop(1, t.canvasBgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Ambient Ambient Radial Blobs
    const glow1 = ctx.createRadialGradient(200, 200, 20, 200, 200, 600);
    glow1.addColorStop(0, t.canvasGlow1);
    glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width - 200, height - 300, 20, width - 200, height - 300, 700);
    glow2.addColorStop(0, t.canvasGlow2);
    glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // 2. Central Floating Card
    const cardMarginX = isStory ? 70 : 80;
    const cardMarginY = isStory ? 140 : 80;
    const cardW = width - cardMarginX * 2;
    const cardH = height - cardMarginY * 2;
    const radius = 44;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 24;
    ctx.fillStyle = t.canvasCardBg;
    ctx.beginPath();
    ctx.roundRect(cardMarginX, cardMarginY, cardW, cardH, radius);
    ctx.fill();
    ctx.restore();

    // Card Border
    ctx.strokeStyle = t.canvasCardBorder;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Helper for multi-line text wrapping
    const wrapText = (text: string, maxWidth: number, font: string): string[] => {
      ctx.font = font;
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine} ${words[i]}`;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    let cursorY = cardMarginY + (isStory ? 80 : 54);

    // 3. Header: CampusLoop /logo.png + Brand Name
    const brandLogoX = cardMarginX + cardW / 2 - 160;
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "/logo.png";
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });
      ctx.drawImage(logoImg, brandLogoX - 32, cursorY - 32, 64, 64);
    } catch {
      // fallback circle
      ctx.fillStyle = t.canvasAccent;
      ctx.beginPath();
      ctx.arc(brandLogoX, cursorY, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = t.canvasTitle;
    ctx.font = "900 54px Inter, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("CampusLoop", brandLogoX + 46, cursorY + 18);

    cursorY += 60;

    // 4. Badge Pill
    const badgeTextFull = `✓  ${badgeText.toUpperCase()}`;
    ctx.font = "bold 20px Inter, sans-serif";
    const badgeTextW = ctx.measureText(badgeTextFull).width;
    const badgeBoxW = badgeTextW + 48;
    const badgeBoxX = cardMarginX + (cardW - badgeBoxW) / 2;

    ctx.fillStyle = t.canvasBadgeBg;
    ctx.beginPath();
    ctx.roundRect(badgeBoxX, cursorY, badgeBoxW, 40, 20);
    ctx.fill();
    ctx.strokeStyle = t.canvasBadgeBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = t.canvasBadgeText;
    ctx.textAlign = "center";
    ctx.fillText(badgeTextFull, cardMarginX + cardW / 2, cursorY + 27);

    cursorY += 75;

    // 5. Optional Avatar
    if (avatarUrl) {
      try {
        const avatarImg = new Image();
        avatarImg.crossOrigin = "anonymous";
        avatarImg.src = avatarUrl;
        await new Promise((resolve, reject) => {
          avatarImg.onload = resolve;
          avatarImg.onerror = reject;
        });

        const avatarSize = isStory ? 150 : 120;
        const avatarCx = cardMarginX + cardW / 2;
        const avatarCy = cursorY + avatarSize / 2;

        // Shadow & Background
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(avatarCx, avatarCy, avatarSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();

        // Clip & Draw Avatar
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

        // Ring
        ctx.strokeStyle = t.canvasAccent;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(avatarCx, avatarCy, avatarSize / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();

        cursorY += avatarSize + 24;
      } catch {
        cursorY += 10;
      }
    }

    // 6. Title (Smart Wrapping - up to 2 lines)
    const titleLines = wrapText(title, cardW - 80, "900 42px Inter, -apple-system, sans-serif").slice(0, 2);
    ctx.fillStyle = t.canvasTitle;
    ctx.font = "900 42px Inter, -apple-system, sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i < titleLines.length; i++) {
      ctx.fillText(titleLines[i], cardMarginX + cardW / 2, cursorY);
      cursorY += 50;
    }

    // Subtitle
    if (subtitle) {
      const subLines = wrapText(subtitle, cardW - 100, "600 24px Inter, sans-serif").slice(0, 2);
      ctx.fillStyle = t.canvasSub;
      ctx.font = "600 24px Inter, sans-serif";
      for (let i = 0; i < subLines.length; i++) {
        ctx.fillText(subLines[i], cardMarginX + cardW / 2, cursorY);
        cursorY += 34;
      }
    }

    cursorY += isStory ? 30 : 15;

    // 7. QR Code Frame & Centered Watermark
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
    });

    const qrSize = isStory ? 480 : 390;
    const qrX = cardMarginX + (cardW - qrSize) / 2;
    const qrY = cursorY;

    // Rounded card background for QR
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 28);
    ctx.fill();
    ctx.strokeStyle = t.canvasCardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Center Logo on QR
    try {
      const centerLogo = new Image();
      centerLogo.crossOrigin = "anonymous";
      centerLogo.src = "/logo.png";
      await new Promise((resolve) => {
        centerLogo.onload = resolve;
        centerLogo.onerror = resolve;
      });

      const logoSize = isStory ? 84 : 72;
      const logoX = qrX + (qrSize - logoSize) / 2;
      const logoY = qrY + (qrSize - logoSize) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(qrX + qrSize / 2, qrY + qrSize / 2, logoSize / 2 + 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.drawImage(centerLogo, logoX, logoY, logoSize, logoSize);
    } catch {}

    cursorY = qrY + qrSize + (isStory ? 48 : 34);

    // 8. Short Link Banner
    const linkBoxW = cardW - 80;
    const linkBoxX = cardMarginX + 40;
    const linkBoxH = 58;

    ctx.fillStyle = t.canvasLinkBg;
    ctx.beginPath();
    ctx.roundRect(linkBoxX, cursorY, linkBoxW, linkBoxH, 18);
    ctx.fill();
    ctx.strokeStyle = t.canvasLinkBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = t.canvasLinkText;
    ctx.font = "bold 26px ui-monospace, Menlo, Monaco, monospace";
    ctx.textAlign = "center";
    ctx.fillText(displayUrl, cardMarginX + cardW / 2, cursorY + 38);

    // 9. Watermark
    ctx.fillStyle = t.canvasWatermark;
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📷 Scan with any phone camera  •  campusloop.space", cardMarginX + cardW / 2, cardMarginY + cardH - 34);

    return canvas;
  };

  /**
   * Save Image as PNG File
   */
  const handleDownloadCard = async () => {
    if (!qrDataUrl) return;
    setIsGeneratingImage(true);
    haptics.light();

    try {
      const canvas = await buildCanvas();
      const dataUrl = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      const safeSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 24);
      a.download = `campusloop-${safeSlug}-${activeTheme}-${aspectRatio}.png`;
      a.href = dataUrl;
      a.click();

      sounds.ting();
      toast.success(
        aspectRatio === "story"
          ? "Story Poster (9:16) downloaded! 🎨"
          : "Branded QR Card downloaded! 🎨"
      );
    } catch (err) {
      console.error("Card export error:", err);
      toast.error("Failed to generate image card");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  /**
   * Copy PNG Image directly to Clipboard for instant pasting
   */
  const handleCopyImageToClipboard = async () => {
    if (!qrDataUrl) return;
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard.write) {
      toast.info("Direct image copying not supported on this browser. Downloading PNG instead!");
      return handleDownloadCard();
    }

    setIsGeneratingImage(true);
    haptics.light();

    try {
      const canvas = await buildCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Could not process image blob");
          setIsGeneratingImage(false);
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          sounds.ting();
          haptics.light();
          setCopiedImage(true);
          toast.success("Card copied as image! Ready to paste in WhatsApp, Slack or Discord 🎨");
          setTimeout(() => setCopiedImage(false), 2400);
        } catch {
          toast.info("Downloaded PNG instead");
          handleDownloadCard();
        } finally {
          setIsGeneratingImage(false);
        }
      }, "image/png");
    } catch (err) {
      console.error("Image copy error:", err);
      toast.error("Failed to copy image");
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto p-0 border-border/40 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-3xl">
        <DialogTitle className="sr-only">{title} QR Code</DialogTitle>

        {/* Modal Top Nav Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40 bg-background/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <QrCode className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground tracking-tight flex items-center gap-1.5">
                Share QR Code
                <Zap className="size-3 text-primary animate-pulse" />
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                High-res scannable badge for campus sharing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Controls Row: Theme Presets & Aspect Ratio Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1">
            {/* Theme Selector Pills */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/50 overflow-x-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 flex items-center gap-1 shrink-0">
                <Palette className="size-3" /> Theme:
              </span>
              {(Object.keys(THEMES) as QrCardTheme[]).map((themeKey) => {
                const item = THEMES[themeKey];
                const isActive = activeTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => {
                      haptics.light();
                      setActiveTheme(themeKey);
                    }}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      isActive
                        ? "bg-card text-foreground shadow-xs scale-105"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{item.emoji}</span>
                    <span className="hidden sm:inline">{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Aspect Ratio Switcher */}
            <div className="flex items-center self-end sm:self-auto gap-1 bg-muted/60 p-1 rounded-2xl border border-border/50 shrink-0">
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setAspectRatio("card");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  aspectRatio === "card"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Square / Card Format"
              >
                <Square className="size-3" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  setAspectRatio("story");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  aspectRatio === "story"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Story Poster (9:16 Instagram/WhatsApp)"
              >
                <Smartphone className="size-3" />
                <span>Story</span>
              </button>
            </div>
          </div>

          {/* Interactive Visual Card Preview */}
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl bg-gradient-to-br p-4 sm:p-5 shadow-xl select-none transition-all duration-300",
              currentTheme.outerBg
            )}
          >
            {/* The Actual QR Poster Card */}
            <div
              className={cn(
                "relative rounded-2xl p-5 text-center shadow-2xl border transition-all duration-300 space-y-3.5",
                currentTheme.cardBg,
                currentTheme.cardBorder,
                aspectRatio === "story" ? "py-8" : "py-5"
              )}
            >
              {/* CampusLoop Crest Header */}
              <div className="flex items-center justify-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="CampusLoop"
                  className="size-7.5 object-contain shrink-0 drop-shadow-sm"
                />
                <span className={cn("text-xl font-black tracking-tight", currentTheme.brandText)}>
                  Campus<span className={cn(currentTheme.tagColor)}>Loop</span>
                </span>
              </div>

              {/* Badge Pill */}
              <div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black border tracking-wide uppercase shadow-2xs",
                    currentTheme.badgeBg,
                    currentTheme.badgeBorder,
                    currentTheme.badgeText
                  )}
                >
                  ✓ {badgeText}
                </span>
              </div>

              {/* Optional Avatar */}
              {avatarUrl && (
                <div className="flex justify-center pt-0.5">
                  <img
                    src={avatarUrl}
                    alt={title}
                    className="size-16 sm:size-18 rounded-full border-3 object-cover shadow-md transition-transform hover:scale-105"
                    style={{ borderColor: currentTheme.accent }}
                  />
                </div>
              )}

              {/* Title & Subtitle with Smart Multi-line wrapping */}
              <div className="space-y-1 pt-0.5 px-2">
                <h3
                  className={cn(
                    "text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-2",
                    currentTheme.titleColor
                  )}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p
                    className={cn(
                      "text-[11px] sm:text-xs font-semibold line-clamp-2 leading-relaxed",
                      currentTheme.subColor
                    )}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {/* QR Code Container with High-Res Frame */}
              <div className="my-2.5 flex justify-center">
                <div className="relative rounded-2xl bg-white p-3 shadow-md border border-slate-200/80 dark:border-slate-800 transition-transform duration-200 hover:scale-[1.02]">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`${title} QR Code`}
                      className={cn(
                        "rounded-xl object-contain transition-all",
                        aspectRatio === "story" ? "size-44 sm:size-48" : "size-40 sm:size-44"
                      )}
                    />
                  ) : (
                    <div className="size-40 sm:size-44 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-muted-foreground font-bold">
                      Generating QR...
                    </div>
                  )}

                  {/* Centered Crest Watermark on QR */}
                  <div className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full bg-white shadow-lg border border-slate-200 pointer-events-none p-1">
                    <img src="/logo.png" alt="CampusLoop" className="size-full object-contain" />
                  </div>
                </div>
              </div>

              {/* Interactive Short Link Pill with Tap to Copy */}
              <div
                onClick={handleCopyLink}
                title="Tap to copy link"
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-2 border cursor-pointer group transition-all duration-150 active:scale-[0.98]",
                  currentTheme.linkBg,
                  currentTheme.linkBorder
                )}
              >
                <span
                  className={cn(
                    "text-xs font-mono font-bold truncate max-w-[240px]",
                    currentTheme.linkText
                  )}
                >
                  {displayUrl}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>

              {/* Card Footer Microcopy */}
              <p className={cn("text-[10px] font-bold tracking-wide", currentTheme.watermark)}>
                📷 Scan with any phone camera • campusloop.space
              </p>
            </div>
          </div>

          {/* Social Quick Share Actions Bar */}
          <div className="space-y-2 pt-1">
            {/* Primary Download & Copy Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isGeneratingImage || !qrDataUrl}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/20"
              >
                <Download className="size-4" />
                <span>
                  {isGeneratingImage
                    ? "Generating..."
                    : aspectRatio === "story"
                      ? "Save 9:16 Story"
                      : "Save Image Card"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                disabled={isGeneratingImage || !qrDataUrl}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-border/80 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                {copiedImage ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
                <span>{copiedImage ? "Image Copied!" : "Copy Image"}</span>
              </button>
            </div>

            {/* Secondary Social Channels Row: WhatsApp, Copy URL, Native Share */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer active:scale-95"
              >
                <MessageCircle className="size-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-[11px] font-bold text-foreground transition-all cursor-pointer active:scale-95"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy URL"}</span>
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-border/60 bg-card hover:bg-muted text-[11px] font-bold text-foreground transition-all cursor-pointer active:scale-95"
              >
                <Share2 className="size-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
