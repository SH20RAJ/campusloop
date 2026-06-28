import { CommunitySkeleton } from "@/components/ui/skeleton-card";

export default function CommunitiesLoading() {
  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
      <CommunitySkeleton />
    </div>
  );
}
