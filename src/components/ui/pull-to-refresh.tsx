"use client";

import { cn } from "@/lib/utils";
import { ArrowDown,Loader2 } from "lucide-react";
import React,{ useCallback,useEffect,useRef,useState } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | void;
  children: React.ReactNode;
  disabled?: boolean;
}

const PULL_THRESHOLD = 60;
const MAX_PULL_DISTANCE = 85;

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;
      // Only initiate pull when at the very top of the window
      if (window.scrollY <= 2) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = false;
      } else {
        startYRef.current = null;
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (startYRef.current === null || disabled || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diffY = currentY - startYRef.current;

      if (diffY > 0 && window.scrollY <= 2) {
        isPullingRef.current = true;
        // Non-linear dampening formula for rubber band feel
        const dampened = Math.min(Math.pow(diffY, 0.82) * 1.6, MAX_PULL_DISTANCE);
        setPullDistance(dampened);

        // Prevent default native rubber-banding if we are pulling down
        if (e.cancelable && diffY > 10) {
          e.preventDefault();
        }
      } else {
        isPullingRef.current = false;
        setPullDistance(0);
      }
    },
    [disabled, isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (startYRef.current === null || disabled || isRefreshing) return;

    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(52); // Lock at loading badge height
      try {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(12);
        }
      } catch {
        // Ignore vibration errors
      }

      const minDuration = new Promise((resolve) => setTimeout(resolve, 600));
      try {
        await Promise.allSettled([onRefresh(), minDuration]);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    isPullingRef.current = false;
  }, [disabled, isRefreshing, onRefresh, pullDistance]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const isReadyToRelease = pullDistance >= PULL_THRESHOLD;

  return (
    <div ref={containerRef} className="relative w-full min-h-screen">
      {/* ─── Floating Pull Indicator Badge (Twitter / Instagram style) ─── */}
      <div
        className={cn(
          "pointer-events-none fixed left-1/2 -translate-x-1/2 z-50 transition-transform duration-200 ease-out",
          pullDistance > 0 || isRefreshing ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
        style={{
          top: `calc(env(safe-area-inset-top, 0px) + ${Math.max(pullDistance * 0.85 + 12, 12)}px)`,
        }}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-card/95 text-foreground border border-border/80 shadow-lg backdrop-blur-md">
          {isRefreshing ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <ArrowDown
              className={cn(
                "size-5 text-muted-foreground transition-transform duration-200",
                isReadyToRelease ? "rotate-180 text-primary" : ""
              )}
              style={{
                transform: isReadyToRelease ? "rotate(180deg)" : `rotate(${progress * 180}deg)`,
              }}
            />
          )}
        </div>
      </div>

      {/* Main Content with subtle translateY elasticity */}
      <div
        style={{
          transform: pullDistance > 0 ? `translate3d(0, ${pullDistance * 0.35}px, 0)` : undefined,
          transition: isPullingRef.current ? "none" : "transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
