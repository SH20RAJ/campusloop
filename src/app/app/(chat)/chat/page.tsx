import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { MessengerView } from "@/components/chat/messenger-view";

interface ChatPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const user = await getCachedAuthUser();
  if (!user) redirect("/join");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  const resolvedParams = await searchParams;
  const targetUserId = resolvedParams?.userId;

  return (
    <MessengerView
      currentUserId={profile.id}
      initialTargetUserId={targetUserId}
    />
  );
}
