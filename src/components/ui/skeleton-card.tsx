import { Skeleton } from "./skeleton";

export function StoryRingSkeleton() {
  return (
    <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2.5 px-4 border-b border-border/40 select-none">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-2.5 w-10 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-3.5 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-28 rounded-full" />
                  <Skeleton className="size-3.5 rounded-full" />
                </div>
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="size-6 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
            <Skeleton className="h-3.5 w-2/3 rounded-md" />
          </div>

          {i === 2 && (
            <Skeleton className="h-44 w-full rounded-2xl" />
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
            </div>
            <Skeleton className="size-7 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Inbox List */}
      <div className="w-80 lg:w-96 border-r border-border/30 p-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full rounded-full" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-border/20">
              <Skeleton className="size-11 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-24 rounded-full" />
                  <Skeleton className="h-2.5 w-8 rounded-full" />
                </div>
                <Skeleton className="h-2.5 w-3/4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Chat Thread */}
      <div className="flex-1 flex flex-col h-full bg-muted/10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-2.5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>

        <div className="flex-1 space-y-4 py-4">
          <div className="flex justify-start">
            <Skeleton className="h-12 w-64 rounded-2xl rounded-tl-xs" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-xs bg-emerald-600/30" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-16 w-80 rounded-2xl rounded-tl-xs" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-14 w-72 rounded-2xl rounded-tr-xs bg-emerald-600/30" />
          </div>
        </div>

        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card overflow-hidden space-y-3 p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-2xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-2.5 w-1/2 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-4/5 rounded-md" />
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full p-4 space-y-5 select-none">
      <div className="relative rounded-3xl overflow-hidden border border-border/40 bg-card p-6 space-y-4 shadow-sm">
        <Skeleton className="h-28 w-full rounded-2xl -mx-6 -mt-6 mb-4" />
        <div className="flex items-end justify-between -mt-14 relative z-10 px-2">
          <Skeleton className="size-20 rounded-full border-4 border-card" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3.5 w-full rounded-md pt-2" />
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-border/30">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-border/40 pb-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <FeedSkeleton />
    </div>
  );
}

export function CollegesSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44 rounded-xl" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card p-4 space-y-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-2xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DatingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 select-none">
      <div className="w-full max-w-sm aspect-[3/4] rounded-3xl border border-border/40 bg-card p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full rounded-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="relative z-10 space-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent -mx-5 -mb-5 p-5">
          <Skeleton className="h-6 w-40 rounded-full bg-white/40" />
          <Skeleton className="h-3.5 w-56 rounded-full bg-white/30" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
            <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-6">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="size-14 rounded-full" />
      </div>
    </div>
  );
}
