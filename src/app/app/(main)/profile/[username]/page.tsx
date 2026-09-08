import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface ProfileDetailProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: ProfileDetailProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | CampusLoop`,
    description: `View @${username}'s student profile on CampusLoop.`,
    robots: { index: false, follow: true },
  };
}

export default async function LegacyProfileRedirectPage({ params, searchParams }: ProfileDetailProps) {
  const { username } = await params;
  const search = await searchParams;
  const tab = search?.tab;
  redirect(tab ? `/@${username}?tab=${tab}` : `/@${username}`);
}
