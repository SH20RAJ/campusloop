"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Sparkles, Smartphone, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone / PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(Boolean(isStandaloneMode));
    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user dismissed banner recently (within 7 days)
    const dismissedAt = localStorage.getItem("cl_pwa_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Android/Desktop Chrome install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not standalone, show after 3 seconds on first visit
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  }

  function handleDismiss() {
    setShowBanner(false);
    setShowIOSModal(false);
    localStorage.setItem("cl_pwa_dismissed", String(Date.now()));
  }

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* ─── Floating Mobile PWA Install Pill ─── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-40 md:hidden max-w-sm mx-auto select-none"
          >
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-card/95 p-3.5 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border shadow-xs">
                  <img src="/logo.png" alt="CampusLoop App" className="size-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground flex items-center gap-1 truncate">
                    <span>Install CampusLoop</span>
                    <Sparkles className="size-3 text-amber-500 shrink-0" />
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Add to home screen for 2x faster app feel
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>Install</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── iOS Safari Instructions Modal ─── */}
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
                  <img src="/logo.png" alt="CampusLoop" className="size-8 rounded-xl border border-border" />
                  <h3 className="text-sm font-black text-foreground">Install on iPhone / iPad</h3>
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
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                    1
                  </div>
                  <p className="text-xs text-foreground font-medium leading-snug">
                    Tap the <strong>Share</strong> button <Share className="inline size-3.5 text-primary mx-0.5" /> at the bottom of Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                    2
                  </div>
                  <p className="text-xs text-foreground font-medium leading-snug">
                    Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline size-3.5 text-primary mx-0.5" />.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                    3
                  </div>
                  <p className="text-xs text-foreground font-medium leading-snug">
                    Tap <strong>Add</strong> in the top right. You&apos;re all set! 🚀
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowIOSModal(false);
                  setShowBanner(false);
                }}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
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
