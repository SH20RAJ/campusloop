import type { Metadata } from "next";
import { ConfessionsFeed } from "./confessions-feed";

export const metadata: Metadata = {
  title: "Confessions | CampusLoop",
  description: "Anonymous thoughts from your campus.",
};

export default function ConfessionsPage() {
  return <ConfessionsFeed />;
}
