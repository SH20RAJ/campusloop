"use client";

import { ArrowUpRight, Flame, PenTool, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";

interface TopAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  points: number;
  institution?: {
    name: string;
    slug: string;
  } | null;
}

const TRENDING_TAGS = [
  { name: "placements", count: "128 articles" },
  { name: "dsa-interview", count: "94 articles" },
  { name: "system-design", count: "67 articles" },
  { name: "ai-research", count: "53 articles" },
  { name: "internships", count: "48 articles" },
  { name: "hostellife", count: "41 articles" },
];

export function ArticlesRightSidebar() {
  const { data: topAuthorsData } = useSWR<{ authors: TopAuthor[] }>("/api/articles/top-authors", fetcher, {
    dedupingInterval: 60000,
  });

  const topAuthors = topAuthorsData?.authors || [];

  return (
    <aside className="w-80 shrink-0 space-y-6 select-none">
      {/* ─── Write For CampusLoop Callout ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-purple-500/10 p-5 shadow-xs">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Campus Journalism</span>
          </div>
          <h3 className="text-base font-black text-foreground tracking-tight leading-snug">
            Write placement roadmaps &amp; earn +15 LP
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share your interview experiences, tech guides, and campus insights with 1,350+ colleges across
            India.
          </p>
          <div className="pt-2">
            <Link
              href="/app/articles/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <PenTool className="size-3.5" />
              <span>Start Writing</span>
            </Link>
          </div>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] size-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
      </div>

      {/* ─── Trending Topics ─── */}
      <div className="rounded-3xl border border-border/30 bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-foreground font-black text-sm">
          <Flame className="size-4 text-orange-500" />
          <span>Trending Topics</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TRENDING_TAGS.map((tag) => (
            <Link
              key={tag.name}
              href={`/app/articles?tag=${tag.name}`}
              className="px-3 py-1.5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>#{tag.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Top Campus Writers ─── */}
      {topAuthors.length > 0 && (
        <div className="rounded-3xl border border-border/30 bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-black text-sm">
              <Users className="size-4 text-primary" />
              <span>Top Campus Authors</span>
            </div>
          </div>

          <div className="divide-y divide-border/20 pt-1">
            {topAuthors.slice(0, 5).map((author) => (
              <div
                key={author.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <Link href={`/@${author.username}`} className="flex items-center gap-2.5 min-w-0 group">
                  <Avatar className="size-8.5 border border-border/40 shrink-0">
                    <AvatarImage src={author.avatarUrl || ""} />
                    <AvatarFallback className="text-xs font-bold">{author.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                      {author.displayName}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      @{author.username} · {author.points} LP
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/@${author.username}`}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="View author profile"
                >
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Editorial Guidelines Footer ─── */}
      <div className="px-3 text-[11px] text-muted-foreground space-y-1.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-semibold">
          <Link href="/safety" className="hover:underline">
            Safety &amp; Rules
          </Link>
          <Link href="/contact" className="hover:underline">
            Help
          </Link>
          <Link href="/app/articles/dashboard" className="hover:underline">
            Author Dashboard
          </Link>
        </div>
        <p>© 2026 CampusLoop Editorial Hub</p>
      </div>
    </aside>
  );
}
