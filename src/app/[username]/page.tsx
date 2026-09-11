import { and, desc, eq, inArray } from "drizzle-orm";
import { ArrowUpRight, BadgeCheck, Download, FolderPlus, Lock, MessageSquare, School, ThumbsUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShareQrButton } from "@/components/common/share-qr-button";
import { PublicFollowButton } from "@/components/profile/public-follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navigation } from "@/components/ui/navigation";
import { RightSidebar } from "@/components/ui/right-sidebar";
import { getBranchIcon } from "@/constants";
import { getDb } from "@/db";
import { academicPlaylists, academicResources, externalPosts, institutions, posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import type { ExternalPostInfo, FeedPost } from "@/hooks/use-feed";
import { getFollowCounts, getFollowState } from "@/lib/follows";
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
    },
  });

  if (!profile) {
    notFound();
  }

  // Fetch posts written by this user (never expose anonymous posts on public profile)
  const userPosts = await db.query.posts.findMany({
    where: and(eq(posts.authorId, profile.id), eq(posts.status, "PUBLISHED"), eq(posts.isAnonymous, false)),
    orderBy: [desc(posts.createdAt)],
    limit: 20,
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

  // Hydrate external posts info (media, reddit syndication)
  const postIds = userPosts.map((p) => p.id);
  const externalPostsMap = new Map<string, ExternalPostInfo>();
  if (postIds.length > 0) {
    try {
      const extPosts = await db.query.externalPosts.findMany({
        where: inArray(externalPosts.postId, postIds),
        with: {
          media: {
            orderBy: (media, { asc }) => [asc(media.position)],
          },
        },
      });
      for (const ep of extPosts) {
        externalPostsMap.set(ep.postId, {
          id: ep.id,
          source: ep.source,
          externalId: ep.externalId,
          subreddit: ep.subreddit,
          externalAuthor: ep.externalAuthor,
          permalink: ep.permalink,
          canonicalUrl: ep.canonicalUrl,
          score: ep.score,
          commentCount: ep.commentCount,
          contentType: ep.contentType,
          media: ep.media.map((m) => ({
            id: m.id,
            mediaType: m.mediaType,
            mediaUrl: m.mediaUrl,
            previewUrl: m.previewUrl,
            thumbnailUrl: m.thumbnailUrl,
            hlsUrl: m.hlsUrl,
            dashUrl: m.dashUrl,
            width: m.width,
            height: m.height,
            duration: m.duration,
            isGif: m.isGif,
            position: m.position,
          })),
        });
      }
    } catch {
      // Graceful fallback if external_posts query fails
    }
  }

  // If user is authenticated, render with sidebar layout
  if (user) {
    const currentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (currentProfile) {
      const isOwnProfile = profile.id === currentProfile.id;

      // Format posts to match FeedPost type required by FeedCard
      const formattedPosts = userPosts.map((post) => {
        const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
        const commentsCount = post.comments.length;
        const userVote = post.votes.find((v) => v.userId === currentProfile.id)?.value || 0;

        const formattedPollOptions = post.pollOptions?.map((opt) => {
          const optVotesCount = opt.votes.length;
          const userVoted = opt.votes.some((v) => v.userId === currentProfile.id);
          return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
        });

        const hasVotedPoll = formattedPollOptions?.some((opt) => opt.userVoted) || false;
        const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;

        return {
          ...post,
          externalPost: externalPostsMap.get(post.id) || null,
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
              <Suspense
                fallback={
                  <div className="p-8 text-center text-xs text-muted-foreground">Loading profile...</div>
                }
              >
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
              </Suspense>
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
  const [publicFollowCounts, userAcademicResources, userPlaylists] = await Promise.all([
    getFollowCounts(profile.id),
    db.query.academicResources.findMany({
      where: eq(academicResources.uploaderId, profile.id),
      orderBy: [desc(academicResources.createdAt)],
      limit: 6,
      with: {
        institution: true,
      },
    }),
    db.query.academicPlaylists.findMany({
      where: eq(academicPlaylists.creatorId, profile.id),
      orderBy: [desc(academicPlaylists.createdAt)],
      limit: 4,
    }),
  ]);
  const branchIcon = getBranchIcon(profile.branch || profile.course);
  const institutionName = profile.institution?.name || "Indian Institute of Technology";
  const campusShort = institutionName.split(",")[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: profile.createdAt.toISOString(),
    mainEntity: {
      "@type": "Person",
      name: profile.displayName,
      alternateName: `@${profile.username}`,
      identifier: profile.username,
      description: profile.bio || profile.headline || undefined,
      image: profile.avatarUrl || undefined,
      url: `https://campusloop.space/@${profile.username}`,
      alumniOf: institutionName
        ? {
            "@type": "EducationalOrganization",
            name: institutionName,
          }
        : undefined,
      knowsAbout: profile.branch ? [profile.branch, "College Academics"] : undefined,
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-x-hidden pb-16 select-none">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Top Floating Glass Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="text-base font-black tracking-tight text-foreground">CampusLoop</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/join?mode=signin">
            <button className="rounded-full border border-border/80 px-4 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer">
              Sign In
            </button>
          </Link>
          <Link href="/join?mode=signup">
            <button className="rounded-full bg-foreground text-background px-4 py-1.5 text-xs font-bold hover:bg-foreground/90 transition-all cursor-pointer">
              Join Campus
            </button>
          </Link>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex max-w-5xl mx-auto w-full pt-20 px-4 gap-6 items-start">
        <main className="flex-1 w-full max-w-2xl space-y-4">
          {/* Profile Card (Clean Twitter/X Architecture) */}
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 shadow-xs">
            <div className="relative h-36 sm:h-48 w-full bg-[#16181C] overflow-hidden border-b border-border/20">
              {profile.bannerUrl ? (
                <img src={profile.bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-b from-neutral-800/40 via-[#16181C] to-[#121417] relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-700/10 via-transparent to-transparent" />
                </div>
              )}
            </div>

            <div className="px-5 pb-5 pt-0 space-y-3">
              <div className="flex items-end justify-between -mt-12 sm:-mt-16">
                <div className="relative">
                  <Avatar className="size-24 sm:size-28 rounded-full border-4 border-background shadow-lg bg-background">
                    <AvatarImage src={profile.avatarUrl || ""} className="rounded-full object-cover" />
                    <AvatarFallback className="text-2xl font-black bg-muted text-foreground rounded-full">
                      {profile.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {(profile.points || 0) >= 150 && (
                    <span className="absolute bottom-1 right-1 size-5 rounded-full bg-background flex items-center justify-center">
                      <BadgeCheck className="size-5 text-[#1D9BF0] shrink-0" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ShareQrButton
                    title={profile.displayName}
                    subtitle={`@${profile.username} • ${profile.institution?.name || "Verified Student"}`}
                    badgeText="Verified Student Network"
                    shortUrl={`https://campusloop.space/@${profile.username}`}
                    avatarUrl={profile.avatarUrl}
                    category="profile"
                  />
                  <PublicFollowButton
                    username={profile.username}
                    displayName={profile.displayName}
                    profileId={profile.id}
                    isSignedIn={false}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {profile.displayName}
                  </h2>
                  {(profile.points || 0) >= 150 && (
                    <span title="Verified Campus Student">
                      <BadgeCheck className="size-5 text-[#1D9BF0] shrink-0" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
                  <span>@{profile.username}</span>
                  <span>•</span>
                  <span>{campusShort}</span>
                </div>

                {/* Bio / Headline */}
                <p className="text-sm text-foreground leading-relaxed pt-1 whitespace-pre-wrap">
                  {profile.bio ||
                    profile.headline ||
                    (profile.branch && profile.course
                      ? `${profile.course} in ${profile.branch} @ ${campusShort}`
                      : `Student @ ${campusShort}`)}
                </p>

                {/* Stats Row (Following / Followers / LP) */}
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-2">
                  <Link href={`/@${profile.username}/following`} className="hover:underline">
                    <strong className="text-foreground font-bold">{publicFollowCounts.followingCount}</strong>{" "}
                    Following
                  </Link>
                  <Link href={`/@${profile.username}/followers`} className="hover:underline">
                    <strong className="text-foreground font-bold">{publicFollowCounts.followersCount}</strong>{" "}
                    Followers
                  </Link>
                  <span>
                    <strong className="text-[#1D9BF0] font-bold">{profile.points || 0}</strong> LP Clout
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Discipline Card */}
          <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <School className="size-4 text-[#1D9BF0]" /> Campus &amp; Academic Discipline
            </h3>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted/40 text-xl shrink-0">
                {branchIcon}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">{institutionName}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                  {profile.course && <span>{profile.course}</span>}
                  {profile.course && profile.branch && <span>·</span>}
                  {profile.branch && <span className="text-[#1D9BF0] font-semibold">{profile.branch}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* About Card */}
          {profile.bio && (
            <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About</h3>
              <p className="text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Shared Notes & Study Materials Card */}
          {(userAcademicResources.length > 0 || userPlaylists.length > 0) && (
            <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderPlus className="size-4 text-[#1D9BF0]" /> Shared Notes &amp; Study Materials (
                  {userAcademicResources.length + userPlaylists.length})
                </h3>
                <Link
                  href={`/@${profile.username}?tab=academics`}
                  className="text-xs font-bold text-[#1D9BF0] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>

              {/* Study Playlists if any */}
              {userPlaylists.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Curated Stacks &amp; Playlists
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {userPlaylists.map((pl) => (
                      <Link
                        key={pl.id}
                        href={`/app/academics/playlists/${pl.slug}`}
                        className="p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col justify-between gap-2"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0]">
                            {pl.category.replace("_", " ")}
                          </span>
                          <h4 className="text-xs font-bold text-foreground line-clamp-1 mt-1">{pl.title}</h4>
                          {pl.description && (
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{pl.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                          <span className="font-semibold">{pl.itemsCount} materials</span>
                          <span>★ {pl.starsCount}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Resources */}
              {userAcademicResources.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Uploaded Notes &amp; Papers
                  </span>
                  <div className="divide-y divide-border/20 rounded-xl border border-border/30 overflow-hidden">
                    {userAcademicResources.map((res) => (
                      <Link
                        key={res.id}
                        href={`/app/academics/${res.id}`}
                        className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-3"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="font-mono font-bold text-foreground/80">{res.subjectCode}</span>
                            <span>·</span>
                            <span className="uppercase font-bold text-[#1D9BF0]">{res.resourceType}</span>
                            <span>·</span>
                            <span>Sem {res.semester}</span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground line-clamp-1">{res.title}</h4>
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground shrink-0 font-medium">
                          <span className="flex items-center gap-1">
                            <Download className="size-3" />
                            <span>{res.downloadsCount}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="size-3" />
                            <span>{res.upvotesCount}</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Campus Posts & Discussions */}
          {userPosts.length > 0 && (
            <div className="rounded-2xl border border-border/40 bg-card/40 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-4 text-[#1D9BF0]" /> Recent Posts &amp; Activity ({userPosts.length})
                </h3>
              </div>
              <div className="divide-y divide-border/20 rounded-xl border border-border/30 overflow-hidden">
                {userPosts.slice(0, 5).map((p) => {
                  const votesTotal = p.votes.reduce((acc, v) => acc + v.value, 0);
                  const ep = externalPostsMap.get(p.id);
                  return (
                    <Link
                      key={p.id}
                      href={`/app/post/${p.id}`}
                      className="block p-3.5 hover:bg-muted/30 transition-colors space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        {ep?.subreddit && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            r/{ep.subreddit}
                          </span>
                        )}
                        {p.title && (
                          <h4 className="text-xs font-bold text-foreground line-clamp-1">{p.title}</h4>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {p.body}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 font-medium">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <ThumbsUp className="size-3" />
                          <span>{votesTotal} upvotes</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="size-3" />
                          <span>{p.comments.length} comments</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Teaser CTA */}
          <div className="rounded-2xl bg-card/40 p-6 text-center space-y-4 shadow-xs border border-border/40">
            <div className="size-11 bg-[#1D9BF0]/10 text-[#1D9BF0] rounded-full flex items-center justify-center mx-auto">
              <Lock className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Connect with @{profile.username} on CampusLoop
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Verify your student email to join your campus feed, swipe matches, and private message fellow
                classmates.
              </p>
            </div>
            <div className="flex gap-2.5 justify-center pt-1">
              <Link href="/join?mode=signin">
                <button className="rounded-full border border-border/80 h-9 px-5 text-xs font-bold hover:bg-muted text-foreground transition-all cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link href="/join?mode=signup">
                <button className="rounded-full bg-foreground text-background h-9 px-5 text-xs font-bold hover:bg-foreground/90 transition-all cursor-pointer">
                  Verify &amp; Join
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
