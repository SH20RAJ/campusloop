import { cache } from "react";
import { getDb } from "@/db";
import { communities, institutions, posts, userProfiles } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hexclaveServerApp } from "@/hexclave/server";

/**
 * Per-request memoized current user from Hexclave auth.
 * Deduplicates multiple hexclaveServerApp.getUser() calls across layout, pages, and metadata.
 */
export const getCachedAuthUser = cache(async () => {
  return await hexclaveServerApp.getUser();
});

/**
 * Per-request memoized User Profile with Institution relation.
 * Fetches in a single relational join and deduplicates across layouts and subpages.
 */
export const getCachedUserProfile = cache(async (userId: string) => {
  if (!userId) return null;
  const db = getDb();
  return await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    with: {
      institution: true,
    },
  });
});

/**
 * Per-request memoized Community lookup by ID or Slug.
 * Deduplicates identical queries between generateMetadata and Page components.
 */
export const getCachedCommunity = cache(async (idOrSlug: string) => {
  if (!idOrSlug) return null;
  const db = getDb();
  return await db.query.communities.findFirst({
    where: or(eq(communities.id, idOrSlug), eq(communities.slug, idOrSlug)),
    with: {
      members: {
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              points: true,
              branch: true,
              year: true,
            },
          },
        },
      },
      creator: {
        columns: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
  });
});

/**
 * Per-request memoized Institution lookup by ID or Slug.
 * Deduplicates identical queries between generateMetadata and Page components.
 */
export const getCachedInstitution = cache(async (idOrSlug: string) => {
  if (!idOrSlug) return null;
  const db = getDb();
  return await db.query.institutions.findFirst({
    where: or(eq(institutions.slug, idOrSlug), eq(institutions.id, idOrSlug)),
    with: {
      profiles: true,
    },
  });
});

/**
 * Per-request memoized Post Detail lookup.
 * Deduplicates identical queries between generateMetadata and PostDetailPage.
 */
export const getCachedPostDetail = cache(async (id: string) => {
  if (!id) return null;
  const db = getDb();
  return await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: {
        with: {
          author: true,
        },
      },
      pollOptions: {
        with: {
          votes: true,
        },
      },
    },
  });
});
