import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { isViewerProfile } from "@/lib/viewer";
import { PostComposer } from "./post-composer";

export const metadata: Metadata = {
  title: "New Post | CampusLoop",
  description: "Share a confession, start a poll, or ask your campus on CampusLoop.",
};

const POST_TYPES = ["NORMAL", "CONFESSION", "POLL", "QUESTION"] as const;
type PostTypeParam = (typeof POST_TYPES)[number];

interface NewPostPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/handler/sign-in");
  }

  const { type } = await searchParams;
  const requested = (type || "").toUpperCase() as PostTypeParam;
  const initialType = POST_TYPES.includes(requested) ? requested : "NORMAL";

  const profile = await getDb().query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });
  if (profile && (await isViewerProfile(profile))) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen border-x border-border/30 bg-background">
      <PostComposer initialType={initialType} variant="page" />
    </main>
  );
}
