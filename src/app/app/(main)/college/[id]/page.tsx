import { getDb } from "@/db";
import { institutions, posts, userProfiles } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { School, MapPin, Globe, Calendar, ArrowLeft, Users, MessageSquare, Flame, Sparkles, Trophy, Award, Hash, ExternalLink } from "lucide-react";
import Link from "next/link";
import { hexclaveServerApp } from "@/hexclave/server";
import { FeedPost } from "@/hooks/use-feed";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const college = await db.query.institutions.findFirst({
    where: or(eq(institutions.slug, id), eq(institutions.id, id)),
  });

  return {
    title: college ? `${college.name} Rank & Campus Hub | CampusLoop` : "College Hub | CampusLoop",
    description: college ? `Explore rankings, student lists, confessions, and discussions from ${college.name}.` : "",
  };
}

export default async function MainCollegePage({ params }: PageProps) {
  const { id } = await params;
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  // Query college by slug or id
  const college = await db.query.institutions.findFirst({
    where: or(eq(institutions.slug, id), eq(institutions.id, id)),
    with: {
      profiles: true,
    },
  });

  if (!college) {
    notFound();
  }

  // Fetch posts from this college
  const collegePosts = await db.query.posts.findMany({
    where: eq(posts.institutionId, college.id),
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
      community: true,
      votes: true,
      comments: true,
      pollOptions: {
        with: { votes: true },
      },
    },
  });

  const formattedPosts = collegePosts.map((post) => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = post.votes.find((v) => v.userId === profile.id)?.value || 0;

    const formattedPollOptions = post.pollOptions?.map((opt) => {
      const optVotesCount = opt.votes.length;
      const userVoted = opt.votes.some((v) => v.userId === profile.id);
      return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
    });

    const hasVotedPoll = formattedPollOptions?.some((opt) => opt.userVoted) || false;
    const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;

    return {
      ...post,
      votesCount,
      commentsCount,
      userVote,
      pollOptions: formattedPollOptions,
      hasVotedPoll,
      totalPollVotes,
      votes: undefined,
      comments: undefined,
    };
  });

  // Calculate Campus Collective Score & Points
  const studentCount = college.profiles?.length || 0;
  const totalStudentPoints = college.profiles?.reduce((acc, p) => acc + (p.points || 0), 0) || 0;
  const totalInvites = college.profiles?.reduce((acc, p) => acc + (p.referralCount || 0), 0) || 0;
  const postsCount = collegePosts.length;

  const collectivePoints = Math.round(
    studentCount * 50 + totalStudentPoints * 1.5 + totalInvites * 20 + postsCount * 15
  );

  // Extract hashtags from posts
  const hashtagSet = new Set<string>();
  collegePosts.forEach((p) => {
    const matches = p.body.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      matches.forEach((tag) => hashtagSet.add(tag.slice(1)));
    }
  });
  const trendingTags = Array.from(hashtagSet).slice(0, 6);
  if (trendingTags.length === 0) {
    trendingTags.push("LateNightTea", "CanteenDebate", "EndsemSurvivors", "HostelLife");
  }

  // Fetch related campuses in the same state
  const relatedColleges = college.state
    ? await db.query.institutions.findMany({
        where: eq(institutions.state, college.state),
        limit: 4,
      })
    : [];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-20 px-4 pt-4 gap-6">
      {/* Header Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/colleges"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Campus Directory
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
          <Trophy className="size-3" /> Campus Rank Score
        </span>
      </div>

      {/* Hero Campus Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 p-3.5 text-primary border border-primary/20 shrink-0 shadow-inner">
              <School className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">{college.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {college.district ? `${college.district}, ` : ""}{college.state || "India"} &middot; AISHE: {college.aisheCode}
              </p>
            </div>
          </div>
        </div>

        {/* Collective Rank & Points Metric */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-amber-500/10 via-primary/5 to-card p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Award className="size-3.5" /> Collective Campus Rank Score
            </span>
            <p className="text-xl font-black text-foreground">{collectivePoints.toLocaleString()} <span className="text-xs font-bold text-muted-foreground">LP</span></p>
          </div>
          <div className="text-right text-[10px] font-semibold text-muted-foreground space-y-0.5">
            <p>⚡ {studentCount} Verified Students</p>
            <p>🔥 {postsCount} Active Threads</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-3 pt-2 text-xs text-muted-foreground border-t border-border/40 sm:grid-cols-2">
          {college.website && (
            <a
              href={college.website.startsWith("http") ? college.website : `https://${college.website}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
            >
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {college.website} <ExternalLink className="size-3" />
            </a>
          )}
          {college.yearOfEstablishment && (
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/60" /> Est. {college.yearOfEstablishment}
            </span>
          )}
        </div>
      </div>

      {/* Discover Section 1: Enrolled Campus Leaders */}
      {college.profiles && college.profiles.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3.5 text-emerald-500" /> Top Campus Student Leaders
            </h3>
            <span className="text-[10px] text-muted-foreground font-semibold">Verified Students</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {college.profiles.slice(0, 6).map((u) => (
              <Link key={u.id} href={`/app/profile/${u.username}`}>
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2 hover:bg-muted/80 hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {u.displayName?.[0] || "S"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{u.displayName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">@{u.username}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-500 shrink-0">
                    {u.points || 0} LP
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Discover Section 2: Trending Hashtags */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Hash className="size-3.5 text-primary" /> Trending Topics in {college.name}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {trendingTags.map((tag) => (
            <Link key={tag} href={`/app/hashtag/${tag}`}>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer">
                #{tag}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* College Posts Feed (Across Profiles & Sub-Communities) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> Campus Discussions & Sub-Hub Posts
          </h2>
          <span className="text-[10px] text-muted-foreground font-semibold">{formattedPosts.length} Threads</span>
        </div>

        <div className="flex flex-col gap-4">
          {formattedPosts.map((post) => (
            <FeedCard key={post.id} post={post as FeedPost} currentUserId={profile.id} />
          ))}
          {formattedPosts.length === 0 && (
            <div className="text-center py-16 border border-dashed rounded-2xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2">
              <p>No public posts have been shared from this campus yet.</p>
              <Link href="/app/post/new" className="text-primary hover:underline font-bold inline-block">
                Be the first to post from {college.name}!
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Discover Section 3: Related Campuses */}
      {relatedColleges.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <School className="size-3.5 text-primary" /> Related Campuses in {college.state}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {relatedColleges
              .filter((c) => c.id !== college.id)
              .map((c) => (
                <Link key={c.id} href={`/college/${c.slug || c.id}`}>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-3 hover:bg-muted/80 transition-colors">
                    <p className="text-xs font-bold text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.district || c.state}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </main>
  );
}
