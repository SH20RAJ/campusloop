import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { deriveAnonHandle } from "@/lib/anonymity";
import { isViewerProfile } from "@/lib/viewer";
import { PostEditClient } from "./post-edit-client";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditPostPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Edit Post | CampusLoop",
    description: "Edit your post on CampusLoop campus social network.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/app/post/${id}/edit`,
    },
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/handler/sign-in");
  }

  const { id } = await params;
  const db = getDb();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
    with: {
      institution: true,
    },
  });

  if (!profile) {
    redirect("/handler/sign-in");
  }

  if (await isViewerProfile(profile)) {
    redirect("/app");
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      institution: true,
      community: true,
    },
  });

  if (!post || post.status === "DELETED") {
    notFound();
  }

  const userAnonHandle = profile.anonymousUsername || deriveAnonHandle(profile.id);
  const isAuthor = Boolean(post.authorId && post.authorId === profile.id);
  const isAnonAuthor = Boolean(post.isAnonymous && post.pseudonym === userAnonHandle);
  const isAdmin = profile.role === "ADMIN" || profile.role === "MODERATOR";

  if (!isAuthor && !isAnonAuthor && !isAdmin) {
    redirect(`/app/post/${id}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen border-x border-border/30 bg-background pb-20">
      <PostEditClient
        post={post}
        currentUserId={profile.id}
      />
    </main>
  );
}
