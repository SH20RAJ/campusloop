import { FeedClient } from "./feed-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Feed",
  description: "Join your campus social network, share confessions, drop polls, and stay anonymous.",
};

export default function AppPage() {
  return <FeedClient />;
}
