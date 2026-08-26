import { MessengerView } from "@/components/chat/messenger-view";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { redirect } from "next/navigation";

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
