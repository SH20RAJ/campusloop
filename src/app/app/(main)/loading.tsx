import { FeedSkeleton,StoryRingSkeleton } from "@/components/ui/skeleton-card";

export default function MainAppLoading() {
  return (
    <div className="max-w-2xl mx-auto w-full min-h-screen space-y-2 select-none">
      <StoryRingSkeleton />
      <FeedSkeleton />
    </div>
  );
}
