import { Skeleton } from "./skeleton";

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/4 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
          <div className="flex justify-between pt-2">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
            <Skeleton className="h-3.5 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommunitySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4.5 w-1/3 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <Skeleton className="h-3.5 w-5/6 rounded" />
          </div>
          <div className="flex justify-between pt-4 border-t border-border">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-7 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
