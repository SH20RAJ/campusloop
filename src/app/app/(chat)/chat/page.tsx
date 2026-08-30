import { redirect } from "next/navigation";
import { MessengerView } from "@/components/chat/messenger-view";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

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
