import { Metadata } from "next";
import HashtagFeed from "./hashtag-feed";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} Posts & Discussions | CampusLoop`,
    description: `Explore trending student confessions, polls, and discussions for #${tag} on CampusLoop.`,
  };
}

export default async function HashtagPage() {
  return <HashtagFeed />;
}
