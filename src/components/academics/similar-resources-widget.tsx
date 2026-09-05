"use client";

import { ArrowRight, Zap, ThumbsUp } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { sounds } from "@/lib/sounds";
import { getAvatarUrl } from "@/lib/utils";

interface SimilarResourcesWidgetProps {
  resourceId: string;
  subjectCode: string;
}

export function SimilarResourcesWidget({ resourceId, subjectCode }: SimilarResourcesWidgetProps) {
  const { data, isLoading } = useSWR<{
    similar: Array<{
      resource: {
        id: string;
        title: string;
        description?: string | null;
        subjectCode: string;
        subjectName: string;
        branch: string;
        semester: number;
        resourceType: string;
        moduleOrChapter?: string | null;
        fileUrl?: string | null;
        upvotesCount: number;
        downloadsCount: number;
        createdAt: string | Date;
        uploader: {
          id: string;
          username: string;
          displayName: string;
          avatarUrl?: string | null;
        };
        institution?: {
          name: string;
        } | null;
      };
      matchScore: number;
      matchReason: string;
    }>;
  }>(`/api/academics/${resourceId}/similar`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const similarList = data?.similar || [];

  if (isLoading) {
    return (
      <div className="space-y-3 pt-4 border-t border-border/20">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (similarList.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3.5 pt-6 border-t border-border/25">
      {/* ─── Header with AI Vector badge ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Zap className="size-3.5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-sm font-black text-foreground tracking-tight">
              Similar Notes &amp; Related PYQs
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Discovered via Qdrant semantic vector search &amp; syllabus matching
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {similarList.length} Related
        </span>
      </div>

      {/* ─── Twitter/X Style Recommended List ─── */}
      <div className="divide-y divide-border/20 rounded-2xl border border-border/30 bg-card/30 overflow-hidden">
        {similarList.map(({ resource: item, matchScore, matchReason }) => {
          const avatar = getAvatarUrl(item.uploader.avatarUrl, item.uploader.username);

          return (
            <Link
              key={item.id}
              href={`/app/academics/${item.id}`}
              onClick={() => sounds.tap()}
              className="flex items-center justify-between gap-3 p-3.5 hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Avatar className="size-8.5 rounded-full border border-border/40 shrink-0 mt-0.5">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="text-[10px] font-bold">
                    {item.uploader.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground flex-wrap">
                    <span className="font-semibold text-primary/90 bg-primary/10 px-1.5 py-0.2 rounded-md">
                      {matchReason}
                    </span>
                    <span>·</span>
                    <span className="font-mono font-bold text-foreground/80">{item.subjectCode}</span>
                    <span>·</span>
                    <span className="uppercase font-bold text-muted-foreground/80">
                      {item.resourceType.replace("_", " ")}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="truncate max-w-[120px] font-medium text-foreground/70">
                      {item.uploader.displayName}
                    </span>
                    <span>·</span>
                    <span>Sem {item.semester}</span>
                    <span>·</span>
                    <span className="truncate max-w-[100px]">{item.branch}</span>
                  </div>
                </div>
              </div>

              {/* Right: Upvotes & Arrow */}
              <div className="flex items-center gap-2 shrink-0 pl-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-primary/80 bg-primary/5 px-2 py-1 rounded-full border border-primary/15">
                  <ThumbsUp className="size-3" />
                  <span>{item.upvotesCount}</span>
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
