import type { Metadata } from "next";
import { FollowListPageView, generateFollowListMetadata } from "@/components/profile/follow-list-page";

interface FriendsPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: FriendsPageProps): Promise<Metadata> {
  const { username } = await params;
  return generateFollowListMetadata(username, "friends");
}

export default async function FriendsPage({ params }: FriendsPageProps) {
  const { username } = await params;
  return <FollowListPageView rawUsername={username} direction="friends" />;
}
