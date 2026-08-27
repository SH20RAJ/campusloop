"use client";

import { PostComposer } from "@/app/app/(main)/post/new/post-composer";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import {
Clock,
Compass,
Flame,
Lock,
MessageSquare,
ShieldCheck,
Trophy,
Zap
} from "lucide-react";
import { useMemo,useState } from "react";

interface CommunityFeedViewProps {
  community: {
    id: string;
    slug?: string | null;
    name: string;
    privacy?: string;
    allowAnonymousPosts?: boolean;
    rules?: string | null;
  };
  posts: FeedPost[];
  isMember: boolean;
  currentUserId: string;
}

type SortType = "hot" | "latest" | "top" | "discussed";

export function CommunityFeedView({
  community,
  posts,
  isMember,
  currentUserId,
}: CommunityFeedViewProps) {
  const [sort, setSort] = useState<SortType>("hot");

  const parsedRules = useMemo(() => {
    if (!community.rules) return [];
    try {
      return JSON.parse(community.rules) as Array<{ title: string; description: string }>;
    } catch {
      return [];
    }
  }, [community.rules]);

  const sortedPosts = useMemo(() => {
    const list = [...posts];
    if (sort === "latest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "top") {
      list.sort((a, b) => b.votesCount - a.votesCount);
    } else if (sort === "discussed") {
      list.sort((a, b) => b.commentsCount - a.commentsCount);
    } else {
      // Hot: votes + comments * 2
      list.sort((a, b) => {
        const scoreA = a.votesCount + a.commentsCount * 2;
        const scoreB = b.votesCount + b.commentsCount * 2;
        return scoreB - scoreA;
      });
    }
    return list;
  }, [posts, sort]);

  return (
    <div className="space-y-4 select-none animate-in fade-in">
      {/* Pinned Guidelines Capsule */}
      {parsedRules.length > 0 && (
        <div className="rounded-3xl bg-card p-4 space-y-2 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="size-3 text-primary" /> Community Bylaws
          </span>
          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            {parsedRules.slice(0, 4).map((rule, idx) => (
              <div key={idx} className="p-2.5 rounded-2xl bg-muted/30 space-y-0.5">
                <p className="font-bold text-foreground truncate">
                  {idx + 1}. {rule.title}
                </p>
                {rule.description && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {rule.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Composer or Join Prompt */}
      {isMember ? (
        <div className="rounded-3xl bg-card p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
              Post to c/{community.name}
            </h3>
            {community.allowAnonymousPosts ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                🎭 Anonymous Posting Enabled
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Verified Identity Only
              </span>
            )}
          </div>
          <PostComposer communityId={community.id} />
        </div>
      ) : (
        <div className="rounded-3xl bg-card p-6 text-center space-y-2 shadow-2xs">
          <div className="size-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="size-5" />
          </div>
          <h4 className="text-sm font-black text-foreground">Join c/{community.name} to Post &amp; Reply</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Join this student sub-hub to share campus threads, participate in polls, and connect with peers.
          </p>
        </div>
      )}

      {/* Sorting Control */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="size-3.5 text-primary" /> Feed ({sortedPosts.length})
        </span>

        <div className="flex items-center gap-1">
          {[
            { id: "hot", label: "Hot", icon: Flame },
            { id: "latest", label: "Latest", icon: Clock },
            { id: "top", label: "Top Voted", icon: Trophy },
            { id: "discussed", label: "Discussed", icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSort(item.id as SortType)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs",
                  sort === item.id
                    ? "bg-foreground text-background font-black"
                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts Stream */}
      <div className="flex flex-col gap-3.5">
        {sortedPosts.map((post) => (
          <FeedCard key={post.id} post={post} currentUserId={currentUserId} />
        ))}

        {sortedPosts.length === 0 && (
          <div className="text-center py-16 rounded-3xl bg-card text-muted-foreground text-xs font-semibold space-y-3 shadow-2xs">
            <Compass className="size-8 mx-auto text-muted-foreground/40" />
            <p className="font-bold text-foreground">No discussions in c/{community.name} yet.</p>
            {isMember && (
              <p className="text-primary font-bold">Be the first to share a thought or poll!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
