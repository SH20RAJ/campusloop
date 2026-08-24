import { Metadata } from "next";
import HashtagFeed from "./hashtag-feed";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const title = `#${tag} Posts & Discussions | CampusLoop`;
  const description = `Explore trending student confessions, polls, and discussions for #${tag} on CampusLoop.`;
  const url = `https://campusloop.space/app/hashtag/${encodeURIComponent(tag)}`;

  return {
    title,
    description,
    keywords: [tag, `#${tag}`, "campus hashtag", "student discussions", "CampusLoop feed"],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function HashtagPage({ params }: PageProps) {
  const { tag } = await params;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `#${tag} Discussions`,
    url: `https://campusloop.space/app/hashtag/${encodeURIComponent(tag)}`,
    description: `Student posts and campus threads tagged with #${tag}.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HashtagFeed />
    </>
  );
}
