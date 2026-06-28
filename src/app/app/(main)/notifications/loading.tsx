import { FeedSkeleton } from "@/components/ui/skeleton-card";

export default function NotificationsLoading() {
  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-44 bg-muted rounded animate-pulse" />
      </div>
      <FeedSkeleton />
    </div>
  );
}
