import { MessengerView } from "@/components/chat/messenger-view";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { redirect } from "next/navigation";

interface DirectChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DirectChatPage({ params }: DirectChatPageProps) {
  const user = await getCachedAuthUser();
  if (!user) redirect("/join");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  const resolved = await params;
  const conversationId = resolved.id;

  return (
    <MessengerView
      currentUserId={profile.id}
      initialConversationId={conversationId}
    />
  );
}
