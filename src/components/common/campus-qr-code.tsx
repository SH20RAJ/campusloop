"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CampusQrCodeProps {
  value: string;
  size?: number;
  logoUrl?: string;
  logoSize?: number;
  darkColor?: string;
  lightColor?: string;
  className?: string;
  bordered?: boolean;
  onGenerated?: (dataUrl: string) => void;
}

/**
 * Generates a high-res branded QR code Data URL with /logo.png embedded in the center.
 */
export async function generateBrandedQrDataUrl({
  value,
  size = 720,
  logoUrl = "/logo.png",
  logoSize,
  darkColor = "#0f172a",
  lightColor = "#ffffff",
}: {
  value: string;
  size?: number;
  logoUrl?: string;
  logoSize?: number;
  darkColor?: string;
  lightColor?: string;
}): Promise<string> {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 1. Generate base QR with high error correction (H = 30% recovery)
  await QRCode.toCanvas(canvas, value, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });

  // 2. Overlay center CampusLoop logo
  if (logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logoUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });

      const actualLogoSize = logoSize || Math.round(size * 0.22);
      const center = size / 2;
      const logoRadius = actualLogoSize / 2;

      // Draw circular white pill with shadow behind logo
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
      ctx.shadowBlur = Math.round(size * 0.02);
      ctx.shadowOffsetY = Math.round(size * 0.006);

      ctx.beginPath();
      ctx.arc(center, center, logoRadius + Math.round(size * 0.018), 0, Math.PI * 2);
      ctx.fillStyle = lightColor;
      ctx.fill();

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = Math.max(2, Math.round(size * 0.004));
      ctx.stroke();
      ctx.restore();

      // Draw the logo in the center
      const drawX = center - logoRadius;
      const drawY = center - logoRadius;
      ctx.drawImage(img, drawX, drawY, actualLogoSize, actualLogoSize);
    } catch (e) {
      console.warn("Failed to load logo for QR code overlay:", e);
    }
  }

  return canvas.toDataURL("image/png");
}

export function CampusQrCode({
  value,
  size = 240,
  logoUrl = "/logo.png",
  logoSize,
  darkColor = "#0f172a",
  lightColor = "#ffffff",
  className,
  bordered = true,
  onGenerated,
}: CampusQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then(async () => {
        if (isCancelled || !logoUrl) {
          if (!isCancelled) {
            setIsRendered(true);
            onGenerated?.(canvas.toDataURL("image/png"));
          }
          return;
        }

        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = logoUrl;

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
          });

          if (isCancelled) return;

          const actualLogoSize = logoSize || Math.round(size * 0.22);
          const center = size / 2;
          const logoRadius = actualLogoSize / 2;

          // White circular badge
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
          ctx.shadowBlur = Math.round(size * 0.03);
          ctx.shadowOffsetY = Math.round(size * 0.008);

          ctx.beginPath();
          ctx.arc(center, center, logoRadius + Math.round(size * 0.02), 0, Math.PI * 2);
          ctx.fillStyle = lightColor;
          ctx.fill();

          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = Math.max(1.5, Math.round(size * 0.006));
          ctx.stroke();
          ctx.restore();

          // Logo image
          ctx.drawImage(img, center - logoRadius, center - logoRadius, actualLogoSize, actualLogoSize);

          setIsRendered(true);
          onGenerated?.(canvas.toDataURL("image/png"));
        } catch {
          setIsRendered(true);
          onGenerated?.(canvas.toDataURL("image/png"));
        }
      })
      .catch((err) => {
        console.error("Failed to generate QR code canvas:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [value, size, logoUrl, logoSize, darkColor, lightColor, onGenerated]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl bg-white p-2.5 transition-all shadow-xs",
        bordered && "border border-border/60",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className={cn("rounded-xl transition-opacity duration-300", isRendered ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
