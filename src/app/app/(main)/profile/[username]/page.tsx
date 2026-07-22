import { redirect } from "next/navigation";
import { Metadata } from "next";

interface ProfileDetailProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfileDetailProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | CampusLoop`,
    description: `View @${username}'s student profile on CampusLoop.`,
  };
}

export default async function LegacyProfileRedirectPage({ params }: ProfileDetailProps) {
  const { username } = await params;
  redirect(`/@${username}`);
}
