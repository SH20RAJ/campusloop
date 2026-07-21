import { Skeleton } from "./skeleton";

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-2.5 w-16 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-4/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg border border-border/40 bg-card">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-2.5 w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
          <Skeleton className="h-3.5 w-2/3 rounded" />
          <Skeleton className="h-2.5 w-full rounded" />
          <Skeleton className="h-2.5 w-3/4 rounded" />
        </div>
      ))}
    </div>
  );
}
