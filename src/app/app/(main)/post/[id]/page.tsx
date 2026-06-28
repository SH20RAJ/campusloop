import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { Metadata } from "next";

interface PostPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  return {
    title: `Post ${params.id} | CampusLoop`,
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const db = getDb();
  
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, params.id),
    with: {
      author: true,
      institution: true,
    }
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col min-h-screen px-4 pt-6 pb-32">
      <FeedCard post={post as any} />
      
      <div className="mt-8 rounded-3xl bg-black/20 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-lg font-semibold text-white">Comments</h3>
        <p className="text-sm text-muted-foreground">Comments coming soon...</p>
      </div>
    </main>
  );
}
