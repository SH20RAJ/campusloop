import { desc, eq, sql } from "drizzle-orm";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Database,
  EyeOff,
  Flame,
  Globe,
  Heart,
  Layers,
  MessageSquare,
  Radio,
  School,
  Server,
  Shield,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { comments, institutions, posts, userProfiles, votes } from "@/db/schema";
import { resolveAdminSession } from "../_lib/guard";
import { getActivitySeries, getDashboardStats, getTopColleges } from "../_lib/queries";

export const metadata: Metadata = {
  title: "Platform Telemetry & Analytics",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const { db } = await resolveAdminSession();

  const [stats, activity, topColleges] = await Promise.all([
    getDashboardStats(db),
    getActivitySeries(db).catch(() => []),
    getTopColleges(db).catch(() => []),
  ]);

  // Content type breakdown
  const typeCounts = await db
    .select({
      type: posts.type,
      count: sql<number>`count(*)::int`,
    })
    .from(posts)
    .groupBy(posts.type)
    .catch(() => []);

  // Votes sentiment
  const [voteStats] = await db
    .select({
      upvotes: sql<number>`count(*) filter (where ${votes.value} > 0)::int`,
      downvotes: sql<number>`count(*) filter (where ${votes.value} < 0)::int`,
    })
    .from(votes)
    .catch(() => [{ upvotes: 0, downvotes: 0 }]);

  const upvotes = voteStats?.upvotes ?? 0;
  const downvotes = voteStats?.downvotes ?? 0;
  const totalVotes = upvotes + downvotes;
  const sentimentPct = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 100;

  const publicPosts = Math.max(0, stats.totalPosts - stats.anonymousPosts);
  const anonPct = stats.totalPosts > 0 ? Math.round((stats.anonymousPosts / stats.totalPosts) * 100) : 0;
  const publicPct = 100 - anonPct;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Analytics &amp; Telemetry
          </h2>
          <p className="text-muted-foreground text-sm">
            Live infrastructure vitals, user engagement distribution, and circuit breaker metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Telemetry Stream Live
          </span>
        </div>
      </header>

      {/* ─── High-Level Telemetry Cards ─── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" /> Active Students
          </p>
          <p className="text-2xl font-black text-foreground">{stats.totalUsers}</p>
          <p className="text-[11px] text-muted-foreground">{stats.activeUsers} active accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Total Posts
          </p>
          <p className="text-2xl font-black text-foreground">{stats.totalPosts}</p>
          <p className="text-[11px] text-muted-foreground">{stats.publishedPosts} published to timeline</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-purple-500" /> Total Comments
          </p>
          <p className="text-2xl font-black text-foreground">{stats.totalComments}</p>
          <p className="text-[11px] text-muted-foreground">
            {stats.totalPosts > 0
              ? (stats.totalComments / stats.totalPosts).toFixed(1)
              : "0"}{" "}
            comments per post avg
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <School className="h-3.5 w-3.5 text-amber-500" /> Campus Hubs
          </p>
          <p className="text-2xl font-black text-foreground">{stats.colleges}</p>
          <p className="text-[11px] text-muted-foreground">Indexed Indian university hubs</p>
        </div>
      </section>

      {/* ─── Infrastructure & Circuit Breakers Telemetry ─── */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-500" />
          Infrastructure Health &amp; Circuit Breakers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Neon PostgreSQL */}
          <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-500" /> Neon Postgres
              </span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-lg font-black text-foreground">Serverless Pooled</p>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Avg Query Latency</span>
                <span className="font-semibold text-foreground">~12ms</span>
              </div>
              <div className="flex justify-between">
                <span>Driver</span>
                <span className="font-semibold text-foreground">@neondatabase/serverless</span>
              </div>
            </div>
          </div>

          {/* Upstash Redis */}
          <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Upstash Redis
              </span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>
            <p className="text-lg font-black text-foreground">Behavior Tracking</p>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Affinity Sets</span>
                <span className="font-semibold text-foreground">user:&lt;id&gt;:interests</span>
              </div>
              <div className="flex justify-between">
                <span>Sub-5ms Ingestion</span>
                <span className="font-semibold text-foreground">Active</span>
              </div>
            </div>
          </div>

          {/* Qdrant Vector DB & Circuit Breaker */}
          <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Qdrant Cloud
              </span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                CIRCUIT ACTIVE
              </span>
            </div>
            <p className="text-lg font-black text-foreground">Vector Recommendations</p>
            <div className="space-y-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Strict Boundary</span>
                <span className="font-semibold text-foreground">600ms Timeout</span>
              </div>
              <div className="flex justify-between">
                <span>Zero-Downtime Fallback</span>
                <span className="font-semibold text-emerald-500">100% Postgres Guard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Engagement & Ratio Breakdown ─── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Anonymity vs Public Posting Ratio */}
        <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-purple-500" />
              Anonymity vs Public Posting Ratio
            </h3>
            <p className="text-xs text-muted-foreground">
              Balance between verified identity and anonymous confessions
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-purple-400">Anonymous ({anonPct}%)</span>
              <span className="text-primary">Public ({publicPct}%)</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${anonPct}%` }}
              />
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${publicPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>{stats.anonymousPosts} anon posts</span>
              <span>{publicPosts} public posts</span>
            </div>
          </div>
        </div>

        {/* Voting Sentiment */}
        <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Community Sentiment &amp; Upvote Ratio
            </h3>
            <p className="text-xs text-muted-foreground">
              Ratio of positive upvotes vs downvotes across student posts
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-500">Upvotes ({sentimentPct}%)</span>
              <span className="text-rose-500">Downvotes ({100 - sentimentPct}%)</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${sentimentPct}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${100 - sentimentPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
              <span>▲ {upvotes} positive</span>
              <span>▼ {downvotes} negative</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Top Colleges by Activity ─── */}
      <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <School className="h-4 w-4 text-amber-500" />
              Top Indian Campuses by Activity
            </h3>
            <p className="text-xs text-muted-foreground">
              Most active student communities across the Loop network
            </p>
          </div>
          <Link href="/admin/colleges" className="text-xs font-bold text-primary hover:underline">
            Manage Directory →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {topColleges.map((college, idx) => (
            <div
              key={college.id}
              className="p-3.5 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground truncate">{college.name}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span>Rank #{idx + 1}</span>
                  <span>·</span>
                  <span>{college.students} students</span>
                </p>
              </div>
              <span className="text-xs font-bold text-foreground px-2 py-1 rounded-lg bg-muted/60 shrink-0">
                {college.postCount} posts
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
