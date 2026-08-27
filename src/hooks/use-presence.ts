"use client";

import { HEARTBEAT_INTERVAL_MS,isOnline,presenceLabel } from "@/lib/presence";
import { useEffect } from "react";

/**
 * Keeps the signed-in student's presence fresh.
 *
 * Beats only while the tab is visible, so a backgrounded tab decays to
 * offline on its own, and beats immediately on focus so switching back shows
 * as online without waiting out the interval.
 */
export function usePresenceHeartbeat(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    let timer: ReturnType<typeof setInterval> | null = null;
    let inFlight = false;

    async function beat() {
      if (inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        await fetch("/api/presence", { method: "POST", keepalive: true });
      } catch {
        // A missed heartbeat is harmless — presence simply decays.
      } finally {
        inFlight = false;
      }
    }

    function start() {
      beat();
      if (!timer) timer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") start();
      else stop();
    }

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled]);
}

export { isOnline, presenceLabel };
