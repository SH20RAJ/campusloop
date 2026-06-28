import { FeedSkeleton } from "@/components/ui/skeleton-card";

export default function DiscoverLoading() {
  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
      </div>
      <FeedSkeleton />
    </div>
  );
}
