import type { Metadata } from "next";

import { resolveAdminSession } from "../_lib/guard";
import { FeedBoostsClient } from "./feed-boosts-client";

export const metadata: Metadata = {
  title: "Feed Curation",
  description: "Promote a post or a student across the campus feed.",
};

export default async function AdminFeedPage() {
  await resolveAdminSession();
  return <FeedBoostsClient />;
}
