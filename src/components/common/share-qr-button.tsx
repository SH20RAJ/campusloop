"use client";

import { BrandedQrModal, type BrandedQrModalProps } from "@/components/common/branded-qr-modal";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { QrCode, Share2 } from "lucide-react";
import { useState } from "react";

/**
 * Drop-in QR share trigger, so any surface (profile, event, article, community,
 * college hub) can offer the same branded share card without re-wiring modal
 * state each time.
 */

interface ShareQrButtonProps extends Omit<BrandedQrModalProps, "isOpen" | "onClose"> {
  /** `icon` is a bare circular button; `pill` shows a label beside the icon. */
  variant?: "icon" | "pill";
  label?: string;
  className?: string;
}

export function ShareQrButton({
  variant = "icon",
  label = "Share",
  className,
  ...modalProps
}: ShareQrButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Share ${modalProps.title} via QR code`}
        title="Share with a QR code"
        onClick={() => {
          haptics.light();
          setIsOpen(true);
        }}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-1.5 border border-border/60 bg-card text-foreground transition-all hover:bg-muted active:scale-95",
          variant === "icon"
            ? "size-9 rounded-full"
            : "h-9 rounded-full px-4 text-xs font-bold",
          className
        )}
      >
        {variant === "icon" ? <Share2 className="size-4" /> : <QrCode className="size-3.5" />}
        {variant === "pill" && <span>{label}</span>}
      </button>

      <BrandedQrModal isOpen={isOpen} onClose={() => setIsOpen(false)} {...modalProps} />
    </>
  );
}
