import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CommunityHeader } from "@/components/communities/community-header";
import { CommunityMembersClient } from "@/components/communities/community-members-client";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { getCachedAuthUser, getCachedCommunity, getCachedUserProfile } from "@/lib/server-cache";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const comm = await getCachedCommunity(id);

  if (!comm) {
    return {
      title: "Community Members",
    };
  }

  return {
    title: `c/${comm.name} Members & Leaders | CampusLoop`,
    description: `Browse verified student members, leaders, and moderators in c/${comm.name} on CampusLoop.`,
    alternates: {
      canonical: `https://campusloop.space/app/communities/${comm.slug || comm.id}/members`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function CommunityMembersPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  // Parallelize user profile and community lookup with request cache
  const [profile, comm] = await Promise.all([getCachedUserProfile(user.id), getCachedCommunity(id)]);

  if (!profile) redirect("/app/onboarding");
  if (!comm) notFound();

  const db = getDb();
  // Count community posts
  const postsCount = (
    await db.query.posts.findMany({
      where: eq(posts.communityId, comm.id),
      columns: { id: true },
    })
  ).length;

  const userMembership = comm.members.find((m) => m.userId === profile.id);
  const isMember = Boolean(userMembership && userMembership.status === "ACTIVE");
  const isAdmin = Boolean(comm.creatorId === profile.id || userMembership?.role === "ADMIN");
  const memberStatus = userMembership?.status || "NONE";
  const activeMembersCount = comm.members.filter((m) => m.status === "ACTIVE").length;

  const formattedMembers = comm.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role || "MEMBER",
    status: m.status || "ACTIVE",
    createdAt: m.createdAt,
    user: m.user,
  }));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen bg-background text-foreground pb-24 border-x border-border/30 select-none">
      <CommunityHeader
        community={comm}
        membersCount={activeMembersCount}
        postsCount={postsCount}
        isMember={isMember}
        isAdmin={isAdmin}
        memberStatus={memberStatus}
      />

      <div className="px-4 sm:px-5 py-4">
        <CommunityMembersClient
          communityId={comm.id}
          communityName={comm.name}
          members={formattedMembers}
          isAdmin={isAdmin}
        />
      </div>
    </main>
  );
}
