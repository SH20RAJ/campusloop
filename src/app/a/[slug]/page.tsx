import { getDb } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import ArticleReaderPage from "@/app/app/(main)/articles/[slug]/page";

interface ArticleShortLinkProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticleShortLinkProps): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const article = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  });

  if (!article) {
    return { title: "Article | CampusLoop" };
  }

  // The root layout's title template already appends " | CampusLoop".
  const title = article.title;
  const description = article.excerpt || article.subtitle || "Read student articles on CampusLoop.";
  const url = `https://campusloop.space/a/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [{ url: "https://campusloop.space/og-image.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.coverImageUrl ? [article.coverImageUrl] : ["https://campusloop.space/og-image.png"],
    },
  };
}

/**
 * Public reader. This route lives outside the auth-gated `(main)` layout so a
 * shared link, a QR scan or Googlebot reaches the article itself rather than the
 * sign-in wall. Interactions on the page still require an account.
 */
export default ArticleReaderPage;
