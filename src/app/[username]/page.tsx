import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { Navigation } from "@/components/ui/navigation";
import { RightSidebar } from "@/components/ui/right-sidebar";
import { getBranchIcon } from "@/constants";

import { PublicFollowButton } from "@/components/profile/public-follow-button";
import { getDb } from "@/db";
import { institutions,posts,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { FeedPost } from "@/hooks/use-feed";
import { getFollowCounts,getFollowState } from "@/lib/follows";
import { and,desc,eq } from "drizzle-orm";
import { Lock,School } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileClientView } from "../app/(main)/profile/profile-client";

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
        : [{ url: "https://campusloop.space/og-image.png", alt: title, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile?.avatarUrl ? [profile.avatarUrl] : ["https://campusloop.space/og-image.png"],
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

      const [college, followState] = await Promise.all([
        currentProfile.institutionId
          ? db.query.institutions.findFirst({ where: eq(institutions.id, currentProfile.institutionId) })
          : Promise.resolve(null),
        getFollowState(profile.id, currentProfile.id),
      ]);

      return (
        <div className="relative min-h-screen bg-background">
          <Navigation 
            profile={currentProfile} 
            collegeName={college?.name ?? "Your College"} 
            isAdmin={currentProfile.role === "ADMIN"} 
          />

          <div className="flex md:pl-64 min-h-screen max-w-full overflow-x-clip">
            <main className="flex-1 w-full min-w-0 max-w-2xl px-0 py-0 pb-28 md:pb-0 mx-auto min-h-screen border-r border-border/30 overflow-x-clip">
              <ProfileClientView
                profile={profile}
                formattedPosts={formattedPosts as FeedPost[]}
                isOwnProfile={isOwnProfile}
                currentUserId={currentProfile.id}
                followersCount={followState.followersCount}
                followingCount={followState.followingCount}
                friendsCount={followState.friendsCount}
                isFollowedByViewer={followState.isFollowedByViewer}
              />
            </main>

            <aside className="hidden lg:block w-80 xl:w-[350px] shrink-0 px-4 py-3">
              <RightSidebar />
            </aside>
          </div>
        </div>
      );

    }
  }

  // If not authenticated, render LinkedIn-style public card
  const publicFollowCounts = await getFollowCounts(profile.id);
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

      {/* Main Container Layout */}
      <div className="flex max-w-5xl mx-auto w-full pt-20 px-4 gap-6 items-start">
        <main className="flex-1 w-full max-w-2xl space-y-4">
          {/* Profile Card with Aurora Mesh Banner (Reference 1 & 2) */}
          <div className="relative overflow-hidden rounded-3xl bg-card shadow-lg">

          <div className="relative h-36 sm:h-44 w-full bg-aurora-mesh overflow-hidden">
            {profile.bannerUrl && (
              <img src={profile.bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="px-5 pb-5 pt-0 space-y-3">
            <div className="flex items-end justify-between -mt-12 sm:-mt-14">
              <div className="relative">
                <Avatar className="size-22 sm:size-24 rounded-full border-4 border-card shadow-2xl bg-background">
                  <AvatarImage src={profile.avatarUrl || ""} className="rounded-full object-cover" />
                  <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary rounded-full">
                    {profile.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {(profile.points || 0) >= 150 && (
                  <span className="absolute bottom-0 right-0 size-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md text-xs font-black border-2 border-card">
                    ✓
                  </span>
                )}
              </div>

              <PublicFollowButton
                username={profile.username}
                displayName={profile.displayName}
                profileId={profile.id}
                isSignedIn={false}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  {profile.displayName}
                </h2>
                {(profile.points || 0) >= 150 && (
                  <span className="text-blue-500 font-bold" title="Verified Campus Star">
                    ✓
                  </span>
                )}
              </div>

              {/* Stats Row (Exact match to Reference: Following / Followers / LP) */}
              <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground pt-0.5">
                <Link href={`/@${profile.username}/following`} className="hover:underline">
                  <strong className="text-foreground font-black">{publicFollowCounts.followingCount}</strong> Following
                </Link>
                <Link href={`/@${profile.username}/followers`} className="hover:underline">
                  <strong className="text-foreground font-black">{publicFollowCounts.followersCount}</strong> Followers
                </Link>
                <span>
                  <strong className="text-foreground font-black">{profile.points || 0}</strong> LP Clout
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-foreground/90 leading-snug pt-1">
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
        <div className="rounded-3xl bg-card p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <School className="size-4 text-primary" /> Campus & Academic Discipline
          </h3>

          <div className="flex items-start gap-3.5 pt-1">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-xl shrink-0">
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
          <div className="rounded-3xl bg-card p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About</h3>
            <p className="text-xs text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Locked Teaser CTA */}
        <div className="rounded-3xl bg-card/60 p-6 text-center space-y-4 shadow-sm border border-border/40">
          <div className="size-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
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
              <button className="rounded-full border border-border/80 h-9 px-5 text-xs font-bold hover:bg-muted text-foreground transition-all cursor-pointer">
                Sign In
              </button>
            </Link>
            <Link href="/join?mode=signup">
              <button className="rounded-full bg-primary h-9 px-5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
                Verify & Join
              </button>
            </Link>
          </div>
        </div>
      </main>

      <aside className="hidden lg:block w-80 shrink-0 sticky top-24">
        <RightSidebar />
      </aside>
    </div>
  </div>
);
}

