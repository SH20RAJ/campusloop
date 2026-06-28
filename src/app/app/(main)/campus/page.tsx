import type { Metadata } from "next";
import { CampusFeed } from "./campus-feed";

export const metadata: Metadata = {
  title: "Campus Feed | CampusLoop",
  description: "View the latest posts and stories on CampusLoop.",
};

export default function CampusFeedPage() {
  return <CampusFeed />;
}
