import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MessengerView } from "@/components/chat/messenger-view";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Messages & Campus Chat",
  description: "Real-time encrypted private chat, study pods, and campus group messaging on CampusLoop.",
  robots: { index: false, follow: false },
};

interface ChatPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  const resolvedParams = await searchParams;
  const targetUserId = resolvedParams?.userId;

  return <MessengerView currentUserId={profile.id} initialTargetUserId={targetUserId} />;
}
