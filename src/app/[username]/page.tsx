import { getDb } from "@/db";
import { posts, userProfiles, institutions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { ProfileClientView } from "../app/(main)/profile/profile-client";
import { Navigation } from "@/components/ui/navigation";
import Link from "next/link";
import { Lock, School } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedPost } from "@/hooks/use-feed";
import { getCloutTier } from "@/lib/gamification";
import { getBranchIcon } from "@/lib/academic-constants";

interface VanityProfileProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: VanityProfileProps): Promise<Metadata> {
  const resolved = await params;
  const rawUsername = decodeURIComponent(resolved.username);
  
  if (!rawUsername.startsWith("@")) {
    return {
      title: "Profile",
    };
  }
  
  const username = rawUsername.slice(1);
  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, username),
    with: { institution: true },
  });

  const title = profile ? `${profile.displayName} (@${username})` : `@${username}`;
  const description = profile?.bio
    ? profile.bio
    : `View @${username}'s student clout rank, points, and campus activity on CampusLoop.`;
  const url = `https://campusloop.space/@${username}`;

  return {
    title,
    description,
    keywords: [
      `@${username}`,
      profile?.displayName || username,
      profile?.institution?.name || "CampusLoop Student",
      "student profile",
      "campus clout",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "profile",
      images: profile?.avatarUrl
        ? [{ url: profile.avatarUrl, alt: profile.displayName }]
        : [{ url: "https://campusloop.space/logo.png", alt: title }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile?.avatarUrl ? [profile.avatarUrl] : ["https://campusloop.space/logo.png"],
    },
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
    where: and(eq(posts.authorId, profile.id), eq(posts.status, "PUBLISHED")),
    orderBy: [desc(posts.createdAt)],
    limit: 20,
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

          <div className="flex md:pl-60 min-h-screen">
            <main className="flex-1 w-full max-w-2xl px-0 py-0 pb-28 md:pb-0 mx-auto min-h-screen">
              <ProfileClientView
                profile={profile}
                formattedPosts={formattedPosts as FeedPost[]}
                isOwnProfile={isOwnProfile}
                currentUserId={currentProfile.id}
              />
            </main>
          </div>
        </div>
      );
    }
  }

  // If not authenticated, render LinkedIn-style public card
  const tier = getCloutTier(profile.points || 0);
  const branchIcon = getBranchIcon(profile.branch || profile.course);
  const institutionName = profile.institution?.name || "Indian Institute of Technology";
  const campusShort = institutionName.split(",")[0];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-x-hidden pb-16 select-none">
      {/* Top Floating Glass Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/80 px-6 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-black tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/join?mode=signin">
            <button className="rounded-xl border border-input px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer">
              Sign In
            </button>
          </Link>
          <Link href="/join?mode=signup">
            <button className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
              Join Campus
            </button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl px-4 pt-20 mx-auto space-y-4">
        {/* Profile Card with Cover Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
          <div className="relative h-28 sm:h-36 w-full bg-gradient-to-r from-orange-500/25 via-primary/30 to-amber-500/25 overflow-hidden">
            {profile.bannerUrl ? (
              <img src={profile.bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            )}
          </div>

          <div className="px-5 pb-5 pt-0 space-y-3">
            <div className="flex items-end justify-between -mt-12 sm:-mt-14">
              <div className="relative">
                <Avatar className="size-20 sm:size-24 border-4 border-card shadow-2xl bg-background">
                  <AvatarImage src={profile.avatarUrl || ""} />
                  <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                    {profile.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {(profile.points || 0) >= 150 && (
                  <span className="absolute bottom-0 right-0 size-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md text-xs font-black border-2 border-card">
                    ✓
                  </span>
                )}
              </div>

              <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-2.5 py-1">
                {tier.tierName} · {profile.points || 0} LP
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {profile.displayName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-foreground/90 leading-snug">
                {profile.headline || (
                  profile.branch && profile.course
                    ? `${profile.course} in ${profile.branch} @ ${campusShort}`
                    : `Student @ ${campusShort}`
                )}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-0.5">
                <span>@{profile.username}</span>
                <span>•</span>
                <span>{campusShort}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Education & Discipline Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <School className="size-4 text-primary" /> Campus & Academic Discipline
          </h3>

          <div className="flex items-start gap-3.5 pt-1">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-xl shrink-0">
              {branchIcon}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs sm:text-sm font-bold text-foreground truncate">{institutionName}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                {profile.course && <span>{profile.course}</span>}
                {profile.course && profile.branch && <span>·</span>}
                {profile.branch && <span className="text-primary font-bold">{profile.branch}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* About Card */}
        {profile.bio && (
          <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About</h3>
            <p className="text-xs text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Locked Teaser CTA */}
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center space-y-4 shadow-sm">
          <div className="size-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <Lock className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Connect with @{profile.username} on CampusLoop</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Verify your student email to join your campus feed, swipe matches, and private message fellow classmates.
            </p>
          </div>
          <div className="flex gap-2.5 justify-center pt-1">
            <Link href="/join?mode=signin">
              <button className="rounded-xl border border-input h-9 px-4 text-xs font-bold hover:bg-muted text-foreground transition-all cursor-pointer">
                Sign In
              </button>
            </Link>
            <Link href="/join?mode=signup">
              <button className="rounded-xl bg-primary h-9 px-4 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
                Verify & Join
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
