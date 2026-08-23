import { getDb } from "@/db";
import { posts, userProfiles, institutions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { ProfileClientView } from "../app/(main)/profile/profile-client";
import { Navigation } from "@/components/ui/navigation";
import Link from "next/link";
import { Lock, School, Sparkles, ShieldCheck, ArrowRight, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedPost } from "@/hooks/use-feed";
import { getCloutTier } from "@/lib/gamification";
import { getBranchIcon, slugifyBranch } from "@/lib/academic-constants";

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

  // If not authenticated, render soft minimal public card
  const tier = getCloutTier(profile.points || 0);
  const branchIcon = getBranchIcon(profile.branch || profile.course);
  const branchSlug = profile.branch ? slugifyBranch(profile.branch) : null;

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
        <Link href="/join">
          <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
            Join Campus
          </button>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-lg px-4 pt-24 mx-auto space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/20 p-6 shadow-xl space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <Avatar className="size-24 border-3 border-background shadow-2xl">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-black">
                  {profile.displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {(profile.points || 0) >= 150 && (
                <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md text-xs font-black border-2 border-background">
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {profile.displayName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold justify-center">
                <span>@{profile.username}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <Flame className="size-3 text-rose-500" /> {tier.tierName} · {profile.points || 0} LP
                </span>
              </div>

              {profile.institution && (
                <p className="text-xs text-primary font-bold flex items-center justify-center gap-1.5 pt-1">
                  <School className="size-3.5" /> {profile.institution.name.split(",")[0]}
                </p>
              )}
            </div>

            {/* Academic Badges */}
            {(profile.course || profile.branch || profile.year) && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {profile.branch && (
                  <span className="text-[11px] font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-lg">
                    {branchIcon} {profile.branch}
                  </span>
                )}
                {profile.course && (
                  <span className="text-[11px] font-bold bg-muted/60 border border-border px-2.5 py-0.5 rounded-lg text-foreground">
                    🎓 {profile.course}
                  </span>
                )}
                {profile.year && (
                  <span className="text-[11px] font-bold bg-muted/60 border border-border px-2.5 py-0.5 rounded-lg text-muted-foreground">
                    📅 Year {profile.year}
                  </span>
                )}
              </div>
            )}

            {profile.bio && (
              <p className="text-xs text-foreground/90 font-medium italic max-w-sm pt-1 leading-relaxed">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}
          </div>
        </div>

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
