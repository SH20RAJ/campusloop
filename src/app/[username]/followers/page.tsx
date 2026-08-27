import { FollowListPageView,generateFollowListMetadata } from "@/components/profile/follow-list-page";
import { Metadata } from "next";

interface FollowersPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: FollowersPageProps): Promise<Metadata> {
  const { username } = await params;
  return generateFollowListMetadata(username, "followers");
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;
  return <FollowListPageView rawUsername={username} direction="followers" />;
}
