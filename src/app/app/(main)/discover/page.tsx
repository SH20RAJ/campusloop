import type { Metadata } from "next";
import { DiscoverFeed } from "./discover-feed";

export const metadata: Metadata = {
  title: "Discover Campuses Across India",
  description:
    "Explore trending posts, confessions, and questions from verified students across every college on CampusLoop — switch between your campus loop and all of India.",
  robots: { index: true, follow: true },
};

export default function DiscoverPage() {
  return <DiscoverFeed />;
}
