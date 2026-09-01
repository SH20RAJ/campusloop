"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, PlusSquare, Share, Store, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function MerchantPWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(Boolean(isStandaloneMode));
    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check recent dismissal (within 7 days)
    const dismissedAt = localStorage.getItem("cl_merchant_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If iOS and not standalone, show prompt after 2 seconds
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstall() {
    sounds.tap();
    haptics.medium();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        sounds.ting();
        haptics.success();
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  }

  function handleDismiss() {
    sounds.tap();
    haptics.light();
    setShowBanner(false);
    setShowIOSModal(false);
    localStorage.setItem("cl_merchant_pwa_dismissed", String(Date.now()));
  }

  if (isStandalone || !showBanner) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.aside
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            aria-label="Install CampusLoop Merchant App"
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-3xl bg-card/95 border border-emerald-500/30 shadow-2xl backdrop-blur-2xl p-4 select-none"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
                  <Store className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground flex items-center gap-1.5 truncate">
                    <span>Install Merchant App</span>
                    <Zap className="size-3 text-emerald-500 shrink-0" />
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Live orders, sound alarms &amp; instant menu updates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstall}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
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
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── iOS Safari Instructions Modal for Merchant ─── */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md p-4 select-none">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                    <Store className="size-4.5" />
                  </div>
                  <h3 className="text-sm font-black text-foreground">Install Merchant App on iPhone</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                    1
                  </div>
                  <p className="text-xs text-foreground font-medium leading-snug">
                    Tap the <strong>Share</strong> button{" "}
                    <Share className="inline size-3.5 text-emerald-500 mx-0.5" /> at the bottom of Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                    2
                  </div>
                  <p className="text-xs text-foreground font-medium leading-snug">
                    Scroll down and tap <strong>Add to Home Screen</strong>{" "}
                    <PlusSquare className="inline size-3.5 text-emerald-500 mx-0.5" />.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                    3
                  </div>
                  <p className="text-xs text-foreground font-medium leading-snug">
                    Tap <strong>Add</strong> in the top right. Launch the standalone Merchant Console anytime!
                    🏪
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowIOSModal(false);
                  setShowBanner(false);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Got it!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
