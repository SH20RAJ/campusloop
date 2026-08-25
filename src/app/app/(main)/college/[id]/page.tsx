import { getDb } from "@/db";
import { institutions, posts } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { sanitizeAnonRow } from "@/lib/anonymity";
import type { FeedPost } from "@/hooks/use-feed";
import { Metadata } from "next";
import { CollegeHubClient } from "@/components/colleges/college-hub-client";
import { getCachedAuthUser, getCachedUserProfile, getCachedInstitution } from "@/lib/server-cache";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const college = await getCachedInstitution(id);

  if (!college) {
    return {
      title: "College Hub | CampusLoop",
      description: "Explore Indian college rankings and student communities on CampusLoop.",
    };
  }

  const title = `${college.name} Campus Hub | CampusLoop`;
  const description = `Connect with verified students at ${college.name} (${college.district || college.state || "India"}). Confessions, clubs, campus Q&A, and live feed.`;
  const url = `https://campusloop.space/app/college/${college.slug || college.id}`;

  return {
    title,
    description,
    keywords: [
      college.name,
      `${college.name} campus`,
      `${college.name} students`,
      "college confessions",
      "campus life India",
      "verified student network",
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
      type: "website",
      images: [
        {
          url: "https://campusloop.space/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://campusloop.space/og-image.png"],
    },
    robots: { index: true, follow: true },
  };

}

export default async function MainCollegePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCachedAuthUser();
  const db = getDb();

  // Fetch profile and institution in parallel with deduplicated request cache
  const [profile, college] = await Promise.all([
    user ? getCachedUserProfile(user.id) : Promise.resolve(null),
    getCachedInstitution(id),
  ]);

  if (!college) {
    notFound();
  }

  // Fetch posts from this college
  const collegePosts = await db.query.posts.findMany({
    where: eq(posts.institutionId, college.id),
    orderBy: [desc(posts.createdAt)],
    limit: 30,
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

  const formattedPosts: FeedPost[] = collegePosts.map((post) => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = profile ? post.votes.find((v) => v.userId === profile.id)?.value || 0 : 0;

    const formattedPollOptions = post.pollOptions?.map((opt) => {
      const optVotesCount = opt.votes.length;
      const userVoted = profile ? opt.votes.some((v) => v.userId === profile.id) : false;
      return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
    });

    const hasVotedPoll = formattedPollOptions?.some((opt) => opt.userVoted) || false;
    const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;

    return {
      ...sanitizeAnonRow(post),
      votesCount,
      commentsCount,
      userVote,
      pollOptions: formattedPollOptions,
      hasVotedPoll,
      totalPollVotes,
      votes: undefined,
      comments: undefined,
    } as unknown as FeedPost;
  });

  // Extract enrolled student profiles
  const students = (college.profiles || []).map((p) => ({
    id: p.id,
    username: p.username,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    points: p.points,
    course: p.course,
    branch: p.branch,
    year: p.year,
    headline: p.headline,
  }));

  // Calculate Campus Collective Score & Points
  const studentCount = students.length;
  const totalStudentPoints = students.reduce((acc, p) => acc + (p.points || 0), 0);
  const postsCount = collegePosts.length;

  const collectivePoints = Math.round(
    studentCount * 60 + totalStudentPoints * 1.5 + postsCount * 25 + 500
  );

  // Extract hashtags from posts
  const hashtagSet = new Set<string>();
  collegePosts.forEach((p) => {
    const matches = p.body.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      matches.forEach((tag) => hashtagSet.add(tag.slice(1)));
    }
  });
  const trendingTags = Array.from(hashtagSet).slice(0, 8);
  if (trendingTags.length === 0) {
    trendingTags.push("BITOTSAV", "AskSeniors", "Placements2026", "SharmaJi", "HostelLife", "CanteenDebate");
  }

  // Fetch competitor campuses in the same state
  const rawRelatedColleges = college.state
    ? await db.query.institutions.findMany({
        where: eq(institutions.state, college.state),
        limit: 6,
        with: {
          profiles: true,
        },
      })
    : [];

  const relatedColleges = rawRelatedColleges
    .filter((c) => c.id !== college.id)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      district: c.district,
      state: c.state,
      studentsCount: c.profiles?.length || 0,
      points: Math.round(
        (c.profiles?.length || 0) * 50 +
        (c.profiles?.reduce((acc, p) => acc + (p.points || 0), 0) || 0) * 1.2 +
        300
      ),
    }));

  const isEnrolledHere = Boolean(profile && profile.institutionId === college.id);

  return (
    <>
      {/* EducationalOrganization JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: college.name,
            url: college.website || `https://campusloop.space/college/${college.slug || college.id}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: college.district || undefined,
              addressRegion: college.state || "India",
              addressCountry: "IN",
            },
            identifier: college.aisheCode || undefined,
            foundingDate: college.yearOfEstablishment ? String(college.yearOfEstablishment) : undefined,
          }),
        }}
      />

      <CollegeHubClient
        college={{
          id: college.id,
          slug: college.slug,
          name: college.name,
          state: college.state,
          district: college.district,
          website: college.website,
          yearOfEstablishment: college.yearOfEstablishment,
          aisheCode: college.aisheCode,
          locationType: college.locationType,
          logoUrl: college.logoUrl,
          bannerUrl: college.bannerUrl,
          nirfRank: college.nirfRank,
          description: college.description,
        }}
        initialPosts={formattedPosts}
        students={students}
        relatedColleges={relatedColleges}
        collectivePoints={collectivePoints}
        currentUserId={profile?.id}
        isEnrolledHere={isEnrolledHere}
        trendingTags={trendingTags}
      />
    </>
  );
}
