import { and, desc, eq, ilike, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  academicResources,
  communities,
  events,
  housingListings,
  marketplaceItems,
  posts,
  ridesharePools,
  savedPosts,
} from "@/db/schema";
import { qdrantClient } from "@/lib/qdrant/client";
import { COLLECTIONS } from "@/lib/qdrant/collections";
import { generateEmbedding } from "@/lib/qdrant/embeddings";
import type { AiSource, AiToolContext } from "./types";

export interface ToolExecutionResult {
  data: unknown;
  sources: AiSource[];
}

/**
 * 1. search_campus_posts: Searches posts the current user is authorized to read within their campus or global scope.
 * Enhanced with Qdrant vector similarity with transparent fallback to Postgres relational full-text matching.
 */
export async function executeSearchCampusPosts(
  context: AiToolContext,
  args: { query: string; limit?: number; timeRange?: "24h" | "7d" | "30d" }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);
  const q = args.query.trim();

  let candidateIds: string[] = [];

  // Try Qdrant semantic vector candidate retrieval
  try {
    const vector = await generateEmbedding(q);
    const hits = await qdrantClient.search(COLLECTIONS.POSTS, vector, { limit: limit * 2 });
    candidateIds = hits.map((h) => String(h.id));
  } catch {
    // Graceful circuit fallback
  }

  // Postgres authorization and final scope filtering
  const conditions = [eq(posts.status, "PUBLISHED")];
  if (context.institutionId) {
    conditions.push(eq(posts.institutionId, context.institutionId));
  }

  if (candidateIds.length > 0) {
    conditions.push(inArray(posts.id, candidateIds));
  } else {
    conditions.push(ilike(posts.body, `%${q}%`));
  }

  const results = await db.query.posts.findMany({
    where: and(...conditions),
    limit,
    orderBy: [desc(posts.createdAt)],
    columns: {
      id: true,
      title: true,
      body: true,
      type: true,
      scope: true,
      isAnonymous: true,
      pseudonym: true,
      createdAt: true,
    },
  });

  const sources: AiSource[] = results.map((p) => ({
    type: "post",
    id: p.id,
    title: p.title || `${p.type} Post`,
    excerpt: p.body.slice(0, 120),
  }));

  return {
    data: results.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      type: r.type,
      author: r.isAnonymous ? r.pseudonym || "Anonymous" : "Campus Student",
      createdAt: r.createdAt,
    })),
    sources,
  };
}

/**
 * 2. search_communities: Find student hubs & clubs
 */
export async function executeSearchCommunities(
  context: AiToolContext,
  args: { query: string; limit?: number }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);
  const q = args.query.trim();

  const conditions = [ilike(communities.name, `%${q}%`)];
  if (context.institutionId) {
    conditions.push(eq(communities.institutionId, context.institutionId));
  }

  const results = await db.query.communities.findMany({
    where: and(...conditions),
    limit,
    orderBy: [desc(communities.createdAt)],
  });

  const sources: AiSource[] = results.map((c) => ({
    type: "community",
    id: c.id,
    title: c.name,
    excerpt: c.description?.slice(0, 120),
  }));

  return {
    data: results.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      isPrivate: c.isPrivate,
    })),
    sources,
  };
}

/**
 * 3. get_trending_topics: Safe public trending topics
 */
export async function executeGetTrendingTopics(
  context: AiToolContext,
  args: { limit?: number; timeRange?: "24h" | "7d" }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);

  const conditions = [eq(posts.status, "PUBLISHED")];
  if (context.institutionId) {
    conditions.push(eq(posts.institutionId, context.institutionId));
  }

  const recentPosts = await db.query.posts.findMany({
    where: and(...conditions),
    limit: limit * 4,
    orderBy: [desc(posts.createdAt)],
    columns: {
      id: true,
      title: true,
      body: true,
    },
  });

  // Extract hashtags & frequent campus subjects
  const tagCounts: Record<string, { count: number; samplePostId: string; title: string }> = {};
  for (const p of recentPosts) {
    const matches = p.body.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      for (const t of matches) {
        const tag = t.toLowerCase();
        if (!tagCounts[tag]) {
          tagCounts[tag] = { count: 0, samplePostId: p.id, title: p.title || tag };
        }
        tagCounts[tag].count++;
      }
    }
  }

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  const sources: AiSource[] = sortedTags.map(([tag, meta]) => ({
    type: "post",
    id: meta.samplePostId,
    title: `Trending: ${tag}`,
    excerpt: `Discussed in ${meta.count} recent discussions on campus`,
  }));

  return {
    data: sortedTags.map(([tag, meta]) => ({
      tag,
      mentions: meta.count,
    })),
    sources,
  };
}

/**
 * 4. get_upcoming_events: Find campus hackathons, fests, workshops
 */
export async function executeGetUpcomingEvents(
  context: AiToolContext,
  args: { limit?: number }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);

  const conditions = [eq(events.status, "PUBLISHED")];
  if (context.institutionId) {
    conditions.push(eq(events.institutionId, context.institutionId));
  }

  const results = await db.query.events.findMany({
    where: and(...conditions),
    limit,
    orderBy: [desc(events.startDate)],
  });

  const sources: AiSource[] = results.map((e) => ({
    type: "event",
    id: e.id,
    title: e.title,
    excerpt: `${e.venue || "Campus"} · ${new Date(e.startDate).toLocaleDateString()}`,
  }));

  return {
    data: results.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      venue: e.venue,
      startDate: e.startDate,
      mode: e.mode,
    })),
    sources,
  };
}

/**
 * 5. search_academic_resources: Exam PYQs, notes, syllabus guides
 */
export async function executeSearchAcademicResources(
  context: AiToolContext,
  args: { query: string; subject?: string; semester?: string; limit?: number }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);
  const q = args.query.trim();

  const conditions = [ilike(academicResources.title, `%${q}%`)];
  if (context.institutionId) {
    conditions.push(eq(academicResources.institutionId, context.institutionId));
  }
  if (args.subject) {
    conditions.push(ilike(academicResources.subject, `%${args.subject}%`));
  }

  const results = await db.query.academicResources.findMany({
    where: and(...conditions),
    limit,
    orderBy: [desc(academicResources.createdAt)],
  });

  const sources: AiSource[] = results.map((a) => ({
    type: "academic",
    id: a.id,
    title: a.title,
    excerpt: `${a.subject} · Semester ${a.semester || "All"}`,
  }));

  return {
    data: results.map((a) => ({
      id: a.id,
      title: a.title,
      subject: a.subject,
      semester: a.semester,
      resourceType: a.resourceType,
      fileUrl: a.fileUrl,
    })),
    sources,
  };
}

/**
 * 6. search_marketplace: Student secondhand gear, bicycles, hostel essentials
 */
export async function executeSearchMarketplace(
  context: AiToolContext,
  args: { query: string; limit?: number; maxPrice?: number }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);
  const q = args.query.trim();

  const conditions = [eq(marketplaceItems.isSold, false), ilike(marketplaceItems.title, `%${q}%`)];
  if (context.institutionId) {
    conditions.push(eq(marketplaceItems.institutionId, context.institutionId));
  }

  const results = await db.query.marketplaceItems.findMany({
    where: and(...conditions),
    limit,
    orderBy: [desc(marketplaceItems.createdAt)],
  });

  const sources: AiSource[] = results.map((m) => ({
    type: "marketplace",
    id: m.id,
    title: m.title,
    excerpt: `₹${m.price} · ${m.category}`,
  }));

  return {
    data: results.map((m) => ({
      id: m.id,
      title: m.title,
      price: m.price,
      condition: m.condition,
      category: m.category,
      isSold: m.isSold,
    })),
    sources,
  };
}

/**
 * 7. search_housing: Student flats, PGs & roommate openings
 */
export async function executeSearchHousing(
  context: AiToolContext,
  args: { query?: string; limit?: number }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);

  const conditions = [eq(housingListings.status, "ACTIVE")];
  if (context.institutionId) {
    conditions.push(eq(housingListings.institutionId, context.institutionId));
  }
  if (args.query) {
    conditions.push(ilike(housingListings.title, `%${args.query.trim()}%`));
  }

  const results = await db.query.housingListings.findMany({
    where: and(...conditions),
    limit,
    orderBy: [desc(housingListings.createdAt)],
  });

  const sources: AiSource[] = results.map((h) => ({
    type: "housing",
    id: h.id,
    title: h.title,
    excerpt: `₹${h.rent}/mo · ${h.propertyType} (${h.location || "Near Campus"})`,
  }));

  return {
    data: results.map((h) => ({
      id: h.id,
      title: h.title,
      rent: h.rent,
      propertyType: h.propertyType,
      location: h.location,
      occupancy: h.occupancy,
    })),
    sources,
  };
}

/**
 * 8. search_rides: Airport, railway station cab pool & carpool
 */
export async function executeSearchRides(
  context: AiToolContext,
  args: { limit?: number }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);

  const conditions = [eq(ridesharePools.status, "OPEN")];
  if (context.institutionId) {
    conditions.push(eq(ridesharePools.institutionId, context.institutionId));
  }

  const results = await db.query.ridesharePools.findMany({
    where: and(...conditions),
    limit,
    orderBy: [desc(ridesharePools.departureTime)],
  });

  const sources: AiSource[] = results.map((r) => ({
    type: "ride",
    id: r.id,
    title: `${r.origin} ➔ ${r.destination}`,
    excerpt: `Leaves ${new Date(r.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${r.seatsAvailable} seats`,
  }));

  return {
    data: results.map((r) => ({
      id: r.id,
      origin: r.origin,
      destination: r.destination,
      departureTime: r.departureTime,
      seatsAvailable: r.seatsAvailable,
      farePerSeat: r.farePerSeat,
    })),
    sources,
  };
}

/**
 * 9. get_my_saved_posts: Authorized retrieval of user's personal bookmarks
 */
export async function executeGetMySavedPosts(
  context: AiToolContext,
  args: { limit?: number }
): Promise<ToolExecutionResult> {
  const db = getDb();
  const limit = Math.min(Math.max(1, args.limit || 5), 10);

  const saved = await db.query.savedPosts.findMany({
    where: eq(savedPosts.userId, context.userId),
    limit,
    orderBy: [desc(savedPosts.createdAt)],
    with: {
      post: true,
    },
  });

  const validPosts = saved.map((s) => s.post).filter(Boolean);

  const sources: AiSource[] = validPosts.map((p) => ({
    type: "post",
    id: p!.id,
    title: p!.title || "Saved Post",
    excerpt: p!.body.slice(0, 100),
  }));

  return {
    data: validPosts.map((p) => ({
      id: p!.id,
      title: p!.title,
      body: p!.body,
      createdAt: p!.createdAt,
    })),
    sources,
  };
}
