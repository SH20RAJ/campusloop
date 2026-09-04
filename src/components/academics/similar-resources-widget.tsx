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

      {/* ─── Responsive Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {similarList.map(({ resource: item, matchScore, matchReason }) => {
          const avatar = getAvatarUrl(item.uploader.avatarUrl, item.uploader.username);

          return (
            <Link
              key={item.id}
              href={`/app/academics/${item.id}`}
              onClick={() => sounds.tap()}
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-border/60 bg-card/60 hover:bg-muted/40 hover:border-indigo-500/40 transition-all group cursor-pointer shadow-2xs"
            >
              <div className="space-y-2">
                {/* Match reason pill & type */}
                <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 truncate max-w-[170px]">
                    {matchReason}
                  </span>
                  <span className="text-muted-foreground uppercase text-[9px] font-black">
                    {item.resourceType.replace("_", " ")}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>

                {/* Subject Code & Semester */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground/80">{item.subjectCode}</span>
                  <span>·</span>
                  <span>Sem {item.semester}</span>
                  <span>·</span>
                  <span>{item.branch}</span>
                </div>
              </div>

              {/* Footer with uploader & stats */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/20 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Avatar className="size-4.5 rounded-full">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="text-[9px]">{item.uploader.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[100px] font-medium text-foreground/70">
                    {item.uploader.displayName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="flex items-center gap-0.5 text-indigo-400">
                    <ThumbsUp className="size-2.5" />
                    <span>{item.upvotesCount}</span>
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
