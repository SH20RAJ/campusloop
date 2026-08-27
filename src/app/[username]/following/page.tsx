import { FollowListPageView,generateFollowListMetadata } from "@/components/profile/follow-list-page";
import { Metadata } from "next";

interface FollowingPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: FollowingPageProps): Promise<Metadata> {
  const { username } = await params;
  return generateFollowListMetadata(username, "following");
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params;
  return <FollowListPageView rawUsername={username} direction="following" />;
}
