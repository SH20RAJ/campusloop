import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { PostComments } from "./post-comments";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Post ${id} | CampusLoop`,
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const db = getDb();
  
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) {
    redirect("/app/onboarding");
  }

  const rawPost = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
    }
  });

  if (!rawPost) {
    notFound();
  }

  // Format post to match FeedPost type required by FeedCard
  const votesCount = rawPost.votes.reduce((acc, vote) => acc + vote.value, 0);
  const commentsCount = rawPost.comments.length;
  const userVote = rawPost.votes.find(v => v.userId === profile.id)?.value || 0;

  const post = {
    ...rawPost,
    votesCount,
    commentsCount,
    userVote,
    votes: undefined,
    comments: undefined,
  };

  return (
    <main className="space-y-6">
      <FeedCard post={post as any} />
      <PostComments postId={id} />
    </main>
  );
}
