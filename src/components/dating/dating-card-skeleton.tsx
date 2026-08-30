"use client";

/**
 * High-fidelity full-screen mobile card skeleton for Campus Match swipe deck.
 * Prevents layout shifts and provides smooth animated shimmer cues.
 */
export function DatingCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col justify-between p-1 select-none">
      {/* Main Card Frame */}
      <div className="relative flex-1 w-full max-w-sm mx-auto rounded-3xl border border-border/40 bg-card overflow-hidden shimmer-effect flex flex-col justify-end p-5 shadow-lg">
        {/* Subtle badge placeholder */}
        <div className="absolute top-4 left-4 h-6 w-28 rounded-full bg-muted/65 shimmer-effect" />
        <div className="absolute top-4 right-4 size-8 rounded-full bg-muted/65 shimmer-effect" />

        {/* Content Details Placeholder */}
        <div className="space-y-3 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-full bg-muted/65 shimmer-effect shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-5 w-36 rounded-lg bg-muted/65 shimmer-effect" />
              <div className="h-3.5 w-24 rounded-md bg-muted/50 shimmer-effect" />
            </div>
            <div className="h-6 w-16 rounded-full bg-muted/50 shimmer-effect shrink-0" />
          </div>

          <div className="h-4 w-4/5 rounded-md bg-muted/40 shimmer-effect" />

          {/* Interests Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <div className="h-6 w-16 rounded-full bg-muted/40 shimmer-effect" />
            <div className="h-6 w-20 rounded-full bg-muted/40 shimmer-effect" />
            <div className="h-6 w-14 rounded-full bg-muted/40 shimmer-effect" />
          </div>
        </div>
      </div>

      {/* Tactile Action Buttons Placeholder */}
      <div className="flex items-center justify-center gap-4 py-3 shrink-0">
        <div className="size-11 rounded-full bg-muted/50 shimmer-effect" />
        <div className="size-14 rounded-full bg-muted/50 shimmer-effect" />
        <div className="size-14 rounded-full bg-muted/50 shimmer-effect" />
      </div>
    </div>
  );
}
