import { and, eq, or } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { articles, articleVotes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getFollowState } from "@/lib/follows";
import { ArticleReaderClient } from "./article-reader-client";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const article = await db.query.articles.findFirst({
    where: or(eq(articles.slug, slug), eq(articles.id, slug)),
    with: {
      author: {
        with: { institution: true },
      },
      institution: true,
    },
  });

  if (!article) {
    return { title: "Article Not Found | CampusLoop" };
  }

  const title = `${article.title} — By @${article.author?.username || "student"} | CampusLoop`;
  const description = article.excerpt || article.subtitle || `Read ${article.title} on CampusLoop.`;
  const url = `https://campusloop.space/app/articles/${article.slug}`;
  const ogImage = article.coverImageUrl || "https://campusloop.space/og-image.png";

  return {
    title,
    description,
    keywords: [
      ...(article.tags || []),
      "CampusLoop Article",
      "College Long Read",
      article.category,
      article.institution?.name || "Campus",
      `@${article.author?.username}`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CampusLoop",
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author?.displayName || `@${article.author?.username}`],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const db = getDb();
  const user = await hexclaveServerApp.getUser();

  let currentProfile = null;
  if (user) {
    currentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });
  }

  const article = await db.query.articles.findFirst({
    where: or(eq(articles.slug, slug), eq(articles.id, slug)),
    with: {
      author: {
        with: { institution: true },
      },
      institution: true,
    },
  });

  if (!article) {
    notFound();
  }

  // Get viewer's vote on this article
  let userVote = 0;
  if (currentProfile) {
    const vote = await db.query.articleVotes.findFirst({
      where: and(eq(articleVotes.articleId, article.id), eq(articleVotes.profileId, currentProfile.id)),
    });
    if (vote) {
      userVote = vote.value;
    }
  }

  // Get follow state of author
  let isFollowingAuthor = false;
  if (currentProfile && currentProfile.id !== article.authorId) {
    const followState = await getFollowState(article.authorId, currentProfile.id);
    isFollowingAuthor = followState.isFollowedByViewer;
  }

  // Fetch more articles by the same author or same category
  const moreArticles = await db.query.articles.findMany({
    where: and(
      eq(articles.status, "PUBLISHED"),
      or(eq(articles.authorId, article.authorId), eq(articles.category, article.category))
    ),
    limit: 4,
    orderBy: (art, { desc }) => [desc(art.publishedAt)],
    with: {
      author: {
        with: { institution: true },
      },
      institution: true,
    },
  });

  const filteredMore = moreArticles.filter((a) => a.id !== article.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.subtitle,
    image: article.coverImageUrl || "https://campusloop.space/og-image.png",
    datePublished: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    dateModified: article.updatedAt?.toISOString() || article.createdAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author?.displayName || `@${article.author?.username}`,
      url: `https://campusloop.space/@${article.author?.username}`,
    },
    publisher: {
      "@type": "Organization",
      name: "CampusLoop",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://campusloop.space/app/articles/${article.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleReaderClient
        article={article as any}
        currentProfile={currentProfile as any}
        initialUserVote={userVote}
        initialIsFollowingAuthor={isFollowingAuthor}
        relatedArticles={filteredMore as any}
      />
    </>
  );
}
