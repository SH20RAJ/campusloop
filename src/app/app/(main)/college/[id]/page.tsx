import { getDb } from "@/db";
import { institutions, posts, userProfiles } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { School, MapPin, Globe, Calendar, ArrowLeft, Users, MessageSquare, Flame, Sparkles, Trophy } from "lucide-react";
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
    title: college ? `${college.name} | CampusLoop` : "College Hub | CampusLoop",
    description: college ? `Explore confessions, canteen polls, and student discussions from ${college.name}.` : "",
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
      profiles: {
        limit: 8,
      },
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
      <div className="flex items-center gap-2">
        <Link
          href="/app/discover"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </Link>
      </div>

      {/* Hero Campus Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-primary/10 p-3 text-primary border border-primary/20 shrink-0">
              <School className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{college.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {college.district ? `${college.district}, ` : ""}{college.state || "India"} &middot; AISHE: {college.aisheCode}
              </p>
            </div>
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
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {college.website}
            </a>
          )}
          {college.yearOfEstablishment && (
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/60" /> Est. {college.yearOfEstablishment}
            </span>
          )}
        </div>

        {/* Stats Pill Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <MessageSquare className="size-4 text-primary" />
            <span>{formattedPosts.length} Posts</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <Users className="size-4 text-emerald-500" />
            <span>{college.profiles?.length || 0} Enrolled Students</span>
          </div>
        </div>
      </div>

      {/* Discover Section 1: Active Student Members */}
      {college.profiles && college.profiles.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" /> Enrolled Campus Members
            </h3>
            <span className="text-[10px] text-muted-foreground font-semibold">Verified Students</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {college.profiles.map((u) => (
              <Link key={u.id} href={`/app/profile/${u.username}`}>
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 hover:bg-muted/80 transition-colors">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {u.displayName?.[0] || "S"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-none">{u.displayName}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">@{u.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Discover Section 2: Trending Hashtags */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="size-3.5 text-primary" /> Campus Topic Hubs
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {["LateNightTea", "CanteenDebate", "EndsemSurvivors", "ExamMemes", "HostelLife"].map((tag) => (
            <Link key={tag} href={`/app/hashtag/${tag}`}>
              <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer">
                #{tag}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* College Posts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> Posts from {college.name}
          </h2>
          <span className="text-[10px] text-muted-foreground font-semibold">Latest Discussions</span>
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

      {/* Discover Section 3: Related Campuses in State */}
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
