import { getDb } from "@/db";
import { communities, communityMembers, userProfiles, posts } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { CommunityHeader } from "@/components/communities/community-header";
import { CommunitySettingsClient } from "@/components/communities/community-settings-client";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const comm = await db.query.communities.findFirst({
    where: or(eq(communities.id, id), eq(communities.slug, id)),
  });

  if (!comm) {
    return {
      title: "Community Settings | CampusLoop",
    };
  }

  return {
    title: `c/${comm.name} Settings & Moderation | CampusLoop`,
    description: `Manage privacy, anonymous posting permissions, and guidelines for c/${comm.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function CommunitySettingsPage({ params }: PageProps) {
  const { id } = await params;

  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  // Fetch community
  const comm = await db.query.communities.findFirst({
    where: or(eq(communities.id, id), eq(communities.slug, id)),
    with: {
      members: true,
      creator: {
        columns: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
  });

  if (!comm) {
    notFound();
  }

  const userMembership = comm.members.find((m) => m.userId === profile.id);
  const isMember = Boolean(userMembership && userMembership.status === "ACTIVE");
  const isAdmin = Boolean(comm.creatorId === profile.id || userMembership?.role === "ADMIN");

  // If not admin, redirect to community page
  if (!isAdmin) {
    redirect(`/app/communities/${comm.slug || comm.id}`);
  }

  // Count community posts
  const postsCount = (
    await db.query.posts.findMany({
      where: eq(posts.communityId, comm.id),
      columns: { id: true },
    })
  ).length;

  const activeMembersCount = comm.members.filter((m) => m.status === "ACTIVE").length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col min-h-screen pb-24 px-3 sm:px-4 pt-3 gap-5 select-none">
      <CommunityHeader
        community={comm}
        membersCount={activeMembersCount}
        postsCount={postsCount}
        isMember={isMember}
        isAdmin={isAdmin}
        memberStatus={userMembership?.status || "NONE"}
      />

      <CommunitySettingsClient
        community={{
          id: comm.id,
          slug: comm.slug,
          name: comm.name,
          description: comm.description,
          category: comm.category,
          privacy: comm.privacy,
          allowAnonymousPosts: comm.allowAnonymousPosts,
          rules: comm.rules,
        }}
      />
    </main>
  );
}
