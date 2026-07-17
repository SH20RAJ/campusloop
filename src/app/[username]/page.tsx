import { getDb } from "@/db";
import { posts, userProfiles, institutions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { ProfileClientView } from "../app/(main)/profile/profile-client";
import { Navigation } from "@/components/ui/navigation";
import Link from "next/link";
import { Lock, School } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedPost } from "@/hooks/use-feed";

interface VanityProfileProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: VanityProfileProps): Promise<Metadata> {
  const resolved = await params;
  const rawUsername = decodeURIComponent(resolved.username);
  
  if (!rawUsername.startsWith("@")) {
    return {};
  }
  
  const username = rawUsername.slice(1);
  return {
    title: `@${username} | CampusLoop`,
    description: `View @${username}'s student profile, vibe rank, and activity on CampusLoop.`,
  };
}

export default async function VanityProfilePage({ params }: VanityProfileProps) {
  const resolved = await params;
  const rawUsername = decodeURIComponent(resolved.username);

  // If URL parameter does not start with @, trigger notFound
  if (!rawUsername.startsWith("@")) {
    notFound();
  }

  const username = rawUsername.slice(1);

  const user = await hexclaveServerApp.getUser();
  const db = getDb();

  // Look up profile by username
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, username),
    with: {
      institution: true,
    }
  });

  if (!profile) {
    notFound();
  }

  // Fetch posts written by this user
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, profile.id),
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
      pollOptions: {
        with: { votes: true }
      }
    }
  });

  // If user is authenticated, render with sidebar layout
  if (user) {
    const currentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (currentProfile) {
      const isOwnProfile = profile.id === currentProfile.id;

      // Format posts to match FeedPost type required by FeedCard
      const formattedPosts = userPosts.map(post => {
        const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
        const commentsCount = post.comments.length;
        const userVote = post.votes.find(v => v.userId === currentProfile.id)?.value || 0;

        const formattedPollOptions = post.pollOptions?.map(opt => {
          const optVotesCount = opt.votes.length;
          const userVoted = opt.votes.some(v => v.userId === currentProfile.id);
          return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
        });

        const hasVotedPoll = formattedPollOptions?.some(opt => opt.userVoted) || false;
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

      const college = currentProfile.institutionId 
        ? await db.query.institutions.findFirst({ where: eq(institutions.id, currentProfile.institutionId) })
        : null;

      return (
        <div className="relative min-h-screen bg-background">
          <Navigation 
            profile={currentProfile} 
            collegeName={college?.name ?? "Your College"} 
            isAdmin={currentProfile.role === "ADMIN"} 
          />

          <div className="flex md:pl-64 min-h-screen">
            <main className="flex-1 w-full max-w-2xl px-0 py-0 pb-28 md:pb-0 mx-auto min-h-screen">
              <ProfileClientView 
                profile={profile}
                formattedPosts={formattedPosts as FeedPost[]}
                isOwnProfile={isOwnProfile}
                currentProfileId={currentProfile.id}
              />
            </main>
          </div>
        </div>
      );
    }
  }

  // If not authenticated, render beautiful read-only teaser page for high virality conversion!
  const ratingBadge = profile.points >= 500 ? "Campus Legend" : profile.points >= 200 ? "Campus Talker" : "Loop Starter";
  const badgeColor = profile.points >= 500 ? "border-rose-500 bg-rose-500/5 text-rose-500" : profile.points >= 200 ? "border-violet-500 bg-violet-500/5 text-violet-500" : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-12">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <Link href="/join">
          <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
            Join CampusLoop
          </button>
        </Link>
      </header>

      {/* Main Teaser Container */}
      <main className="flex-1 w-full max-w-xl px-4 pt-28 mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatarUrl || ""} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                {profile.displayName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight text-foreground">
                {profile.displayName}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold justify-center">
                <span>@{profile.username}</span>
                <span className="text-muted-foreground/45">•</span>
                <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {ratingBadge}
                </span>
              </div>
              <p className="text-xs text-primary font-semibold flex items-center justify-center gap-1.5 mt-1">
                <School className="h-3.5 w-3.5" /> {profile.institution?.name || "Verified Student"}
              </p>
            </div>

            {profile.bio && (
              <p className="text-xs text-foreground/80 font-medium italic max-w-sm pt-2">
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Locked CTA view */}
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-4 shadow-sm">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">View Posts & Chat with @{profile.username}</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Sign up with your college email to verify your identity, interact with posts, and swipe to match.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/join?mode=signin">
              <button className="rounded-xl border border-input h-9 px-4.5 text-xs font-bold hover:bg-muted text-foreground transition-all cursor-pointer">
                Sign In
              </button>
            </Link>
            <Link href="/join?mode=signup">
              <button className="rounded-xl bg-primary h-9 px-4.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
