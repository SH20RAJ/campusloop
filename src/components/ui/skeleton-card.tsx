import { Skeleton } from "./skeleton";

// ──────── 1. Story Ring Skeleton ────────

export function StoryRingSkeleton() {
  return (
    <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2.5 px-4 border-b border-border/30 select-none">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-2.5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ──────── 2. Twitter / X 2-Column Post Item Skeleton ────────

function SinglePostSkeleton({ hasMedia }: { hasMedia?: boolean }) {
  return (
    <div className="border-b border-border/30 px-4 py-3.5 flex gap-3 select-none">
      {/* Left Avatar */}
      <Skeleton className="size-10 rounded-full shrink-0" />

      {/* Right Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="size-1 rounded-full" />
            <Skeleton className="h-3 w-8 rounded-full" />
          </div>
          <Skeleton className="size-4 rounded-full" />
        </div>

        {/* Minimal HR divider */}
        <hr className="border-t border-border/20 my-1.5" />

        {/* Text body lines */}
        <div className="space-y-2 pt-0.5">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
          <Skeleton className="h-3.5 w-2/3 rounded-md" />
        </div>

        {/* Optional Media Box */}
        {hasMedia && <Skeleton className="h-48 w-full rounded-2xl mt-2.5" />}

        {/* Actions bar */}
        <div className="flex items-center justify-between max-w-md pt-2">
          <Skeleton className="h-4 w-10 rounded-full" />
          <Skeleton className="h-4 w-8 rounded-full" />
          <Skeleton className="h-4 w-10 rounded-full" />
          <Skeleton className="h-4 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ──────── 3. Feed Skeleton (Initial Page Load) ────────

export function FeedSkeleton() {
  return (
    <div className="divide-y divide-border/30 select-none">
      <SinglePostSkeleton />
      <SinglePostSkeleton hasMedia />
      <SinglePostSkeleton />
      <SinglePostSkeleton />
    </div>
  );
}

// ──────── 4. Infinite Scroll Loading Skeletons ────────

export function FeedLoadingMoreSkeleton() {
  return (
    <div className="divide-y divide-border/30 select-none py-1 animate-in fade-in duration-200">
      <SinglePostSkeleton />
      <SinglePostSkeleton />
    </div>
  );
}

// ──────── 5. Post Detail & Thread Skeleton ────────

export function PostDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full select-none border-x border-border/20 min-h-screen">
      {/* Top Bar Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center gap-4">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-md" />
      </div>

      {/* Main Post Body */}
      <div className="p-4 space-y-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
        </div>

        <hr className="border-t border-border/20 my-2" />

        <div className="space-y-2.5 pt-1">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-11/12 rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>

        {/* Timestamp & Views */}
        <div className="py-2 text-xs">
          <Skeleton className="h-3 w-36 rounded-full" />
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 py-3 border-y border-border/30">
          <Skeleton className="h-3.5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>

        {/* Action icons */}
        <div className="flex items-center justify-between max-w-md pt-1">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="size-7 rounded-full" />
        </div>
      </div>

      {/* Reply Composer Skeleton */}
      <div className="p-4 border-b border-border/30 flex gap-3">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex justify-end">
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Thread Comments */}
      <div className="divide-y divide-border/25">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 flex gap-3">
            <div className="flex flex-col items-center">
              <Skeleton className="size-9 rounded-full shrink-0" />
              <div className="w-0.5 flex-1 bg-muted mt-2 min-h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-24 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── 6. Profile Skeleton (Twitter / X Header + Feed) ────────

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full select-none border-x border-border/20 min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/30 px-4 py-2.5 flex items-center gap-4">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>

      {/* Banner & Avatar Bar */}
      <div className="relative">
        <Skeleton className="h-36 sm:h-44 w-full rounded-none" />
        <div className="px-4 flex justify-between items-end -mt-12 relative z-10">
          <Skeleton className="size-24 sm:size-28 rounded-full border-4 border-background" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Bio Info */}
      <div className="px-4 pt-3 pb-4 space-y-3 border-b border-border/30">
        <div className="space-y-1">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-3.5 w-24 rounded-full" />
        </div>

        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
          <Skeleton className="h-3.5 w-1/2 rounded-md" />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <Skeleton className="h-3.5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-20 rounded-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 border-b border-border/30 text-center py-3 px-2">
        <Skeleton className="h-4 w-12 mx-auto rounded-full" />
        <Skeleton className="h-4 w-12 mx-auto rounded-full" />
        <Skeleton className="h-4 w-16 mx-auto rounded-full" />
        <Skeleton className="h-4 w-14 mx-auto rounded-full" />
      </div>

      {/* Posts Stream */}
      <FeedSkeleton />
    </div>
  );
}

// ──────── 7. Notifications Skeleton (Twitter / X Style) ────────

export function NotificationsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full select-none border-x border-border/20 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-border/30 py-3.5 text-center">
        <Skeleton className="h-4 w-12 mx-auto rounded-full" />
        <Skeleton className="h-4 w-16 mx-auto rounded-full" />
        <Skeleton className="h-4 w-16 mx-auto rounded-full" />
      </div>

      {/* Notification Stream */}
      <div className="divide-y divide-border/25">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-3 px-4 py-3.5">
            <div className="w-7 flex justify-end pt-1">
              <Skeleton className="size-4.5 rounded-full" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-3.5 w-40 rounded-full" />
                <Skeleton className="h-3 w-8 rounded-full ml-auto" />
              </div>
              <Skeleton className="h-10 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── 8. Communities Skeleton ────────

export function CommunitySkeleton() {
  return (
    <div className="divide-y divide-border/25 p-4 select-none">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="size-11 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-7 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ──────── 9. Colleges Hub Directory Skeleton ────────

export function CollegesSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full p-4 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-44 rounded-xl" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border/30 bg-muted/10 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/25">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── 10. Dating Deck Skeleton ────────

export function DatingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4 select-none">
      <div className="w-full max-w-sm aspect-[3/4] rounded-3xl border border-border/40 bg-card p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full rounded-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="relative z-10 space-y-2 bg-linear-to-t from-black/85 via-black/40 to-transparent -mx-5 -mb-5 p-5">
          <Skeleton className="h-6 w-44 rounded-full bg-white/40" />
          <Skeleton className="h-3.5 w-56 rounded-full bg-white/30" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
            <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-6">
        <Skeleton className="size-13 rounded-full" />
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="size-13 rounded-full" />
      </div>
    </div>
  );
}

// ──────── 11. Chat Skeletons (Responsive & Mobile-Optimized) ────────

export function ChatInboxSkeleton() {
  return (
    <div className="flex flex-col h-full w-full bg-card select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 border-b border-border/30 space-y-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-xl" />
            <Skeleton className="size-8 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        {/* Search */}
        <Skeleton className="h-9 w-full rounded-full" />
        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-0.5">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
          <Skeleton className="h-6 w-18 rounded-full" />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-2xl border border-border/10 bg-muted/10"
          >
            <div className="relative shrink-0">
              <Skeleton className="size-11 rounded-full" />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-muted-foreground/30 ring-2 ring-card" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="h-2.5 w-8 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-44 rounded-full" />
                {i % 2 === 0 && <Skeleton className="size-4 rounded-full" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatThreadSkeleton() {
  return (
    <div className="flex flex-col h-full w-full bg-background select-none overflow-hidden">
      {/* Sticky Header Skeleton */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-md px-3 sm:px-4 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full sm:hidden" />
          <div className="relative">
            <Skeleton className="size-10 rounded-full" />
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-muted-foreground/30 ring-2 ring-card" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 sm:w-36 rounded-full" />
            <Skeleton className="h-2.5 w-16 sm:w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full hidden sm:block" />
        </div>
      </div>

      {/* Message Stream Bubbles Skeleton */}
      <div className="flex-1 overflow-hidden px-3 sm:px-6 py-4 space-y-4">
        {/* Incoming */}
        <div className="flex justify-start items-end gap-2">
          <Skeleton className="size-6 rounded-full shrink-0 mb-1" />
          <div className="space-y-1">
            <Skeleton className="h-12 w-56 sm:w-72 rounded-2xl rounded-tl-xs bg-muted/60" />
            <Skeleton className="h-2 w-12 rounded-full ml-1" />
          </div>
        </div>

        {/* Outgoing */}
        <div className="flex justify-end items-end gap-2">
          <div className="space-y-1 flex flex-col items-end">
            <Skeleton className="h-10 w-44 sm:w-60 rounded-2xl rounded-tr-xs bg-primary/25" />
            <Skeleton className="h-2 w-10 rounded-full mr-1" />
          </div>
        </div>

        {/* Incoming with media */}
        <div className="flex justify-start items-end gap-2">
          <Skeleton className="size-6 rounded-full shrink-0 mb-1" />
          <div className="space-y-1">
            <Skeleton className="h-32 sm:h-44 w-52 sm:w-64 rounded-2xl rounded-tl-xs bg-muted/70" />
            <Skeleton className="h-2 w-14 rounded-full ml-1" />
          </div>
        </div>

        {/* Outgoing reply */}
        <div className="flex justify-end items-end gap-2">
          <div className="space-y-1 flex flex-col items-end">
            <Skeleton className="h-16 w-52 sm:w-80 rounded-2xl rounded-tr-xs bg-primary/25" />
            <Skeleton className="h-2 w-12 rounded-full mr-1" />
          </div>
        </div>

        {/* Incoming short */}
        <div className="flex justify-start items-end gap-2">
          <Skeleton className="size-6 rounded-full shrink-0 mb-1" />
          <div className="space-y-1">
            <Skeleton className="h-9 w-32 sm:w-48 rounded-2xl rounded-tl-xs bg-muted/60" />
            <Skeleton className="h-2 w-10 rounded-full ml-1" />
          </div>
        </div>
      </div>

      {/* Bottom Composer Skeleton */}
      <div className="border-t border-border/40 bg-card px-3 sm:px-4 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="flex items-center gap-1 shrink-0">
            <Skeleton className="size-8 rounded-xl" />
            <Skeleton className="size-8 rounded-xl" />
            <Skeleton className="size-8 rounded-xl" />
          </div>
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="size-10 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex h-full w-full overflow-hidden select-none bg-background">
      {/* On phone: show Inbox skeleton full width. On desktop: show dual pane */}
      <div className="w-full md:w-80 lg:w-96 border-r border-border/30 h-full shrink-0 flex flex-col">
        <ChatInboxSkeleton />
      </div>
      <div className="hidden md:flex flex-1 flex-col h-full">
        <ChatThreadSkeleton />
      </div>
    </div>
  );
}

// ──────── 12. Search Page Skeleton ────────

export function SearchSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full select-none border-x border-border/20 min-h-screen">
      {/* Top Search Bar */}
      <div className="p-3 border-b border-border/30">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-4 border-b border-border/30 py-3 text-center">
        <Skeleton className="h-4 w-12 mx-auto rounded-full" />
        <Skeleton className="h-4 w-14 mx-auto rounded-full" />
        <Skeleton className="h-4 w-14 mx-auto rounded-full" />
        <Skeleton className="h-4 w-16 mx-auto rounded-full" />
      </div>

      {/* People Results Preview */}
      <div className="p-4 border-b border-border/30 space-y-3">
        <Skeleton className="h-4 w-28 rounded-full" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32 rounded-full" />
                  <Skeleton className="h-2.5 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Posts Stream */}
      <FeedSkeleton />
    </div>
  );
}
