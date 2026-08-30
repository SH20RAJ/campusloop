import type { Metadata } from "next";
import { SavedClient } from "./saved-client";

export const metadata: Metadata = {
  title: "Saved Posts & Bookmarks Vault | CampusLoop",
  description:
    "Your private archive of saved campus posts, hostel insights, placement discussions, and student guides on CampusLoop.",
  keywords: [
    "Saved Campus Posts",
    "Campus Bookmarks",
    "College Life Vault",
    "Hostel Guides",
    "Placement Discussions",
  ],
  alternates: { canonical: "https://campusloop.space/app/saved" },
  openGraph: {
    title: "Saved Posts & Bookmarks Vault | CampusLoop",
    description: "Your private archive of saved campus posts, hostel insights, and placement realities.",
    url: "https://campusloop.space/app/saved",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Saved Posts & Bookmarks Vault | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Posts & Bookmarks Vault | CampusLoop",
    description: "Your private archive of saved campus posts, hostel insights, and placement realities.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: false, follow: false },
};

export default function SavedPostsPage() {
  return <SavedClient />;
}
