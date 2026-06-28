import { getDb } from "@/db";
import { institutions, posts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { School, MapPin, Globe, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();
  const college = await db.query.institutions.findFirst({
    where: eq(institutions.id, id),
  });

  return {
    title: college ? `${college.name} | CampusLoop` : "College Details | CampusLoop",
    description: college ? `See posts, confessions, and polls from ${college.name} on CampusLoop.` : "",
  };
}

export default async function CollegePage({ params }: PageProps) {
  const { id } = await params;
  const db = getDb();
  
  const college = await db.query.institutions.findFirst({
    where: eq(institutions.id, id),
  });

  if (!college) {
    notFound();
  }

  // Fetch posts from this college
  const collegePosts = await db.query.posts.findMany({
    where: eq(posts.institutionId, college.id),
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
    }
  });

  const formattedPosts = collegePosts.map(post => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;

    return {
      ...post,
      votesCount,
      commentsCount,
      userVote: 0,
      votes: undefined,
      comments: undefined,
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center px-6 border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </header>

      <main className="flex-1 w-full max-w-2xl px-4 py-8 mx-auto space-y-8">
        {/* College Information Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3 text-primary border border-primary/10 shrink-0">
              <School className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{college.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">AISHE Code: {college.aisheCode}</p>
            </div>
          </div>

          <div className="grid gap-3 pt-2 text-xs text-muted-foreground sm:grid-cols-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {college.district ? `${college.district}, ` : ""}{college.state || "India"}
            </span>
            {college.website && (
              <a
                href={college.website.startsWith("http") ? college.website : `https://${college.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {college.website}
              </a>
            )}
            {college.yearOfEstablishment && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/60" /> Established in {college.yearOfEstablishment}
              </span>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Posts from {college.name}</h2>
          
          <div className="space-y-6">
            {formattedPosts.map((post) => (
              <FeedCard key={post.id} post={post as any} />
            ))}
            {formattedPosts.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-xl border-border bg-card text-muted-foreground text-sm">
                No public posts have been shared from this college yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
