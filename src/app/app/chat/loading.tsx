import { ChatSkeleton } from "@/components/ui/skeleton-card";

export default function ChatLoading() {
  return (
    <div className="space-y-6 pt-4 max-w-5xl mx-auto px-4">
      <div className="space-y-2">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-36 bg-muted rounded animate-pulse" />
      </div>
      <ChatSkeleton />
    </div>
  );
}
