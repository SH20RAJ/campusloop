"use client";

import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function MerchantPWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem("cl_merchant_pwa_dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstall() {
    sounds.tap();
    haptics.medium();

    if (!deferredPrompt) {
      alert(
        "To install on iOS / Safari: Tap the Share button at the bottom and select 'Add to Home Screen'."
      );
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    sounds.tap();
    setIsDismissed(true);
    localStorage.setItem("cl_merchant_pwa_dismissed", "true");
  }

  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Install Merchant App"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl bg-card border border-border shadow-2xl p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-foreground truncate">Install Merchant App</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Get order alerts &amp; manage store directly from your phone screen
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shadow-xs"
        >
          <Download className="size-3.5" />
          <span>Install</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="size-7 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Dismiss installation prompt"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}
