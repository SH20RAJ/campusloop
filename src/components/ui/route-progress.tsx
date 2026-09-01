"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

export function startRouteProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("campusloop_navigate_start"));
  }
}

/**
 * High-performance, instant visual loading bar across the top of the viewport.
 * Triggers on pointerdown/click and custom navigation events at 0ms latency.
 */
function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopTrickle() {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
  }

  function start() {
    if (hideRef.current) clearTimeout(hideRef.current);
    stopTrickle();
    setVisible(true);
    setProgress(20);
    trickleRef.current = setInterval(() => {
      // Smoothly trickle towards 90%
      setProgress((p) => (p >= 90 ? p : p + Math.max((90 - p) * 0.15, 0.8)));
    }, 120);
  }

  useEffect(() => {
    function handleLinkInteraction(event: MouseEvent | TouchEvent) {
      if (event.defaultPrevented) return;
      if ("button" in event && event.button !== 0) return;
      if ("metaKey" in event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      )
        return;

      try {
        const target = new URL(anchor.href, window.location.href);
        if (target.origin !== window.location.origin) return;
        if (target.pathname === window.location.pathname && target.search === window.location.search) {
          return;
        }
        start();
      } catch {}
    }

    function handleCustomStart() {
      start();
    }

    document.addEventListener("click", handleLinkInteraction, { capture: true, passive: true });
    window.addEventListener("popstate", handleCustomStart, { passive: true });
    window.addEventListener("campusloop_navigate_start", handleCustomStart, { passive: true });

    return () => {
      document.removeEventListener("click", handleLinkInteraction, { capture: true });
      window.removeEventListener("popstate", handleCustomStart);
      window.removeEventListener("campusloop_navigate_start", handleCustomStart);
      stopTrickle();
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [stopTrickle]);

  // Route transition settled — snap to 100% and fade out quickly
  useEffect(() => {
    stopTrickle();
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);

    return () => {
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [pathname, searchParams, stopTrickle]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px]"
      role="progressbar"
      aria-label="Page loading"
      aria-hidden={progress >= 100}
    >
      <div
        className="h-full bg-linear-to-r from-primary via-amber-500 to-emerald-500 shadow-[0_0_12px_rgba(249,115,22,0.9)] transition-[width,opacity] duration-150 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
