"use client";

import { usePushNotifications } from "@/hooks/use-push-notifications";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { AnimatePresence,motion } from "framer-motion";
import { Bell,BellRing,Loader2,X } from "lucide-react";
import { useEffect,useState } from "react";

const PROMPT_STORAGE_KEY = "campusloop_notif_prompted_v1";

export function FirstVisitNotificationPrompt() {
  const { permission, isSupported, isSubscribed, isBusy, subscribe } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Check if permission is default and not already prompted
    const hasPrompted = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (!hasPrompted && Notification.permission === "default") {
      // Delay slightly for smooth page load experience
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleEnable() {
    sounds.tap();
    haptics.light();
    localStorage.setItem(PROMPT_STORAGE_KEY, "true");
    const granted = await subscribe();
    if (granted) {
      setTimeout(() => setShowPrompt(false), 600);
    } else {
      setShowPrompt(false);
    }
  }

  function handleDismiss() {
    sounds.tap();
    haptics.light();
    localStorage.setItem(PROMPT_STORAGE_KEY, "true");
    setShowPrompt(false);
  }

  if (!showPrompt || !isSupported || isSubscribed || permission !== "default") {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:max-w-md w-auto"
      >
        <div className="relative overflow-hidden rounded-3xl border border-primary/35 bg-card/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl text-foreground select-none">
          {/* Subtle Ambient Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 size-7 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Dismiss notification prompt"
          >
            <X className="size-3.5" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-md shrink-0">
              <BellRing className="size-5.5 animate-bounce" />
            </div>

            <div className="space-y-1 min-w-0 pr-5">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-foreground tracking-tight">
                  Turn on Campus Alerts?
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Never miss instant replies, anonymous confessions, secret crushes, or direct chat messages.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              Not Now
            </button>

            <button
              type="button"
              onClick={handleEnable}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-md hover:bg-primary/95 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isBusy ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Enabling...</span>
                </>
              ) : (
                <>
                  <Bell className="size-3.5 fill-current" />
                  <span>Allow Notifications</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
