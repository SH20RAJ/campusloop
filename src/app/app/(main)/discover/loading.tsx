import { Skeleton } from "@/components/ui/skeleton";
import { FeedSkeleton } from "@/components/ui/skeleton-card";

export default function DiscoverLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col min-h-screen px-4 pt-4">
      <div className="space-y-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="flex">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex justify-center pb-3">
              <Skeleton className="h-3.5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="py-6">
        <Skeleton className="h-3.5 w-32 rounded mb-4" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
              <Skeleton className="h-7 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
      <div className="pt-4">
        <Skeleton className="h-3.5 w-24 rounded mb-4" />
        <FeedSkeleton />
      </div>
    </div>
  );
}
