"use client";

import { AnimatePresence,motion } from "framer-motion";
import { RefreshCw,Wifi,WifiOff } from "lucide-react";
import { useEffect,useState } from "react";
import { useSWRConfig } from "swr";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Revalidate all active SWR keys across the app
      mutate(() => true, undefined, { revalidate: true });

      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);

      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [mutate]);

  const handleManualSync = () => {
    mutate(() => true, undefined, { revalidate: true });
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-900/95 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-xl border border-white/10 dark:border-black/10 backdrop-blur-md pointer-events-auto text-xs font-bold">
            <span className="flex size-2 rounded-full bg-amber-400 animate-pulse" />
            <WifiOff className="size-3.5 text-amber-400" />
            <span>Offline Mode · Viewing cached campus data</span>
            <button
              type="button"
              onClick={handleManualSync}
              className="ml-1 p-1 hover:opacity-80 transition-opacity cursor-pointer"
              title="Try Reconnecting"
            >
              <RefreshCw className="size-3" />
            </button>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-950/95 text-emerald-100 border border-emerald-500/30 shadow-xl backdrop-blur-md pointer-events-auto text-xs font-bold">
            <Wifi className="size-3.5 text-emerald-400" />
            <span>Back online · Campus feed synced</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
