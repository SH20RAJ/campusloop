import { redirect } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Community Redirect | CampusLoop`,
    description: `Redirecting to c/${id} community hub on CampusLoop.`,
  };
}

export default async function ShortCommunityRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/app/communities/${id}`);
}
