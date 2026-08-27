"use client";

import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { useEffect,useState } from "react";

/**
 * Floating "back to top" button for long scrolling surfaces.
 *
 * Only appears once the reader is well past the fold, and hides while they are
 * scrolling down so it never covers content they are actively reading.
 */
export function ScrollToTop({ threshold = 1200, className }: { threshold?: number; className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        // Show when deep in the page and heading back up
        setVisible(y > threshold && y < lastY);
        lastY = y;
        frame = 0;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        haptics.light();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={cn(
        "fixed bottom-24 right-4 z-40 flex size-11 items-center justify-center rounded-full border border-border/60 bg-card/95 text-foreground shadow-lg backdrop-blur-xl transition-all duration-200 cursor-pointer hover:bg-muted active:scale-90 md:bottom-8 md:right-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        className,
      )}
    >
      <ArrowUp className="size-4.5" />
    </button>
  );
}
