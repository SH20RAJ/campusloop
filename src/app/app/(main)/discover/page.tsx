import type { Metadata } from "next";
import { DiscoverFeed } from "./discover-feed";

export const metadata: Metadata = {
  title: "Discover | CampusLoop",
  description: "See what's happening globally.",
};

export default function DiscoverPage() {
  return <DiscoverFeed />;
}
