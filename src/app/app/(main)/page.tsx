import { Metadata } from "next";
import { FeedClient } from "./feed-client";

export const metadata: Metadata = {
  title: "Campus Feed",
  description: "Join your campus social network, share confessions, drop polls, and stay anonymous.",
  openGraph: {
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Campus Social Network",
      },
    ],
    title: "Campus Social Network | CampusLoop",
    description: "Join your campus social network, share confessions, drop polls, and stay anonymous.",
    siteName: "CampusLoop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Social Network | CampusLoop",
    description: "Join your campus social network, share confessions, drop polls, and stay anonymous.",
    images: ["https://campusloop.space/og-image.png"],
  },
};


export default function AppPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Campus Feed",
    description: "Live verified student campus feed with posts, polls, and confessions.",
    url: "https://campusloop.space/app",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FeedClient />
    </>
  );
}
