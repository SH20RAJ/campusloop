"use client";

import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { Download,WifiOff,X } from "lucide-react";
import { useEffect,useState } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaManager() {
  const unreadCount = useUnreadNotificationsCount();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if running in standalone PWA mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isStandaloneMode));
    }
  }, []);

  // ─── 1. PWA Badging API (App Icon Badge) ───
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      if ("setAppBadge" in navigator) {
        if (unreadCount > 0) {
          navigator.setAppBadge(unreadCount).catch(() => {});
        } else if ("clearAppBadge" in navigator) {
          navigator.clearAppBadge().catch(() => {});
        }
      }
    }
  }, [unreadCount]);

  // ─── 2. Online / Offline Network Monitoring ───
  useEffect(() => {
    function handleOnline() {
      sounds.ting();
      haptics.success();
      toast.success("Back Online! Reconnected to campus network ⚡");
    }

    function handleOffline() {
      haptics.heavy();
      toast.warning("Offline Mode — Browsing cached campus discussions", {
        icon: <WifiOff className="size-4 text-amber-500" />,
        duration: 5000,
      });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ─── 3. PWA Install Prompt Listener ───
  useEffect(() => {
    if (isStandalone) return;

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      const dismissed = localStorage.getItem("campusloop_pwa_dismissed");
      const lastDismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      // Don't show again within 3 days if dismissed
      if (Date.now() - lastDismissedTime < 3 * 24 * 60 * 60 * 1000) {
        return;
      }
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  async function handleInstallClick() {
    if (!installPrompt) return;
    sounds.tap();
    haptics.light();
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      sounds.match();
      haptics.match();
      toast.success("CampusLoop installed! Welcome to the standalone app 🚀");
    }
    setShowInstallBanner(false);
    setInstallPrompt(null);
  }

  function handleDismiss() {
    sounds.tap();
    setShowInstallBanner(false);
    localStorage.setItem("campusloop_pwa_dismissed", Date.now().toString());
  }

  if (!showInstallBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-3xl border border-primary/30 bg-card/95 backdrop-blur-xl p-4 shadow-2xl flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <img src="/icons/icon-192x192.png" alt="App Icon" className="size-7 rounded-xl object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground truncate">Install CampusLoop</p>
            <p className="text-[11px] text-muted-foreground truncate">
              Faster speeds, offline access & alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
          >
            <Download className="size-3" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="size-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Dismiss install prompt"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
