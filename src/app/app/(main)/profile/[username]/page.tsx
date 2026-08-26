import { Metadata } from "next";
import { redirect } from "next/navigation";

interface ProfileDetailProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfileDetailProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | CampusLoop`,
    description: `View @${username}'s student profile on CampusLoop.`,
    robots: { index: false, follow: true },
  };
}

export default async function LegacyProfileRedirectPage({ params }: ProfileDetailProps) {
  const { username } = await params;
  redirect(`/@${username}`);
}
