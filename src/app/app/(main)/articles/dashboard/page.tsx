import { getDb } from "@/db";
import { articles, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArticleDashboardClient } from "./article-dashboard-client";

export const metadata: Metadata = {
  title: "My Articles & Drafts Dashboard | CampusLoop",
  description: "Manage your published student articles, drafts, and readership stats on CampusLoop.",
};

export default async function ArticleDashboardPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/join?mode=signin");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) {
    redirect("/app/onboarding");
  }

  const userArticles = await db.query.articles.findMany({
    where: eq(articles.authorId, profile.id),
    orderBy: [desc(articles.updatedAt)],
  });

  const published = userArticles.filter((a) => a.status === "PUBLISHED");
  const drafts = userArticles.filter((a) => a.status === "DRAFT");

  const totalViews = published.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalUpvotes = published.reduce((sum, a) => sum + (a.upvotesCount || 0), 0);

  return (
    <ArticleDashboardClient
      publishedArticles={published as any}
      draftArticles={drafts as any}
      stats={{
        totalViews,
        totalUpvotes,
        publishedCount: published.length,
        draftsCount: drafts.length,
      }}
    />
  );
}
