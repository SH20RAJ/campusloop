"use client";

import { usePathname,useSearchParams } from "next/navigation";
import { Suspense,useEffect,useRef,useState } from "react";

/**
 * Thin loading bar across the top of the viewport during navigation.
 *
 * The App Router exposes no navigation events, so this watches same-origin
 * link clicks and history moves to start the bar, then completes it when the
 * pathname or query actually changes. It trickles toward 90% while waiting so
 * a slow server render still feels like it is making progress.
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

  useEffect(() => {
    function start() {
      if (hideRef.current) clearTimeout(hideRef.current);
      stopTrickle();
      setVisible(true);
      setProgress(12);
      trickleRef.current = setInterval(() => {
        // Ease toward 90% and stop — the last 10% belongs to the real load.
        setProgress((p) => (p >= 90 ? p : p + Math.max((90 - p) * 0.12, 0.6)));
      }, 180);
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin) return;
      if (target.pathname === window.location.pathname && target.search === window.location.search) {
        return;
      }

      start();
    }

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", start);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", start);
      stopTrickle();
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  // The route settled — snap to full, then fade out.
  useEffect(() => {
    stopTrickle();
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 260);

    return () => {
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
      role="progressbar"
      aria-label="Page loading"
      aria-hidden={progress >= 100}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 shadow-[0_0_10px_var(--color-primary)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}

export function RouteProgress() {
  // useSearchParams needs a Suspense boundary to avoid opting pages into CSR.
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
