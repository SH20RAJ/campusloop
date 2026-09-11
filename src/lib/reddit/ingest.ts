import { randomUUID } from "node:crypto";
import { getDb } from "@/db";
import { externalMedia, externalPosts, posts } from "@/db/schema";
import { runSafetyCheck } from "@/lib/moderation/rules";
import { redditClient } from "./client";
import { batchFindExistingRedditIds, isRedditPostDuplicate } from "./dedupe";
import { normalizeRedditPost } from "./normalize";
import { calculateRedditRelevance } from "./relevance";
import { findRedditSource, getActiveRedditSources } from "./sources";
import { getOrCreateSubredditProfile } from "./subreddit-accounts";
import type { IngestOptions, IngestSummary, NormalizedRedditMedia, SubredditSourceConfig } from "./types";

/**
 * Main Reddit Ingestion Pipeline for CampusLoop.
 * Fetches recent high-quality content, classifies media, applies safety filters,
 * deduplicates at the database level, and persists external references without downloading media.
 */
export async function ingestRedditContent(options: IngestOptions = {}): Promise<IngestSummary> {
  const startTime = Date.now();
  const limit = Math.min(Math.max(1, options.limit || 25), 50);
  const dryRun = Boolean(options.dryRun);

  console.log(
    `[reddit_ingest_started] limit=${limit}, dryRun=${dryRun}, targetSubreddit=${options.subreddit || "ALL"}`
  );

  const sources: SubredditSourceConfig[] = options.subreddit
    ? [
        findRedditSource(options.subreddit) || {
          subreddit: options.subreddit.replace(/^r\//, ""),
          priority: 80,
          enabled: true,
          categories: ["college", "custom"],
          defaultSort: "hot",
        },
      ]
    : getActiveRedditSources();

  const summary: IngestSummary = {
    sourcesProcessed: 0,
    totalFetched: 0,
    normalized: 0,
    duplicates: 0,
    moderationFiltered: 0,
    lowRelevanceFiltered: 0,
    inserted: 0,
    dryRun,
    durationMs: 0,
    items: [],
  };

  const db = getDb();
  let defaultInstitutionId: string | null = null;
  const fallbackInstitution = await db.query.institutions.findFirst();
  if (fallbackInstitution) {
    defaultInstitutionId = fallbackInstitution.id;
  }

  for (const source of sources) {
    console.log(`[reddit_source_started] Subreddit: r/${source.subreddit} (priority: ${source.priority})`);
    summary.sourcesProcessed++;

    const sort = options.sort || source.defaultSort || "hot";
    const rawPosts = await redditClient.fetchSubredditPosts(source.subreddit, sort, limit);
    summary.totalFetched += rawPosts.length;

    if (rawPosts.length === 0) {
      console.warn(`[reddit_source_skipped] No posts returned for r/${source.subreddit}`);
      continue;
    }

    // Fast batch deduplication check against database
    const rawIds = rawPosts.map((p) => p.id);
    const existingIds = await batchFindExistingRedditIds(rawIds);

    for (const raw of rawPosts) {
      // 1. Deduplication check
      if (existingIds.has(raw.id)) {
        summary.duplicates++;
        console.log(`[reddit_duplicate] Skipped existing post: ${raw.id} in r/${source.subreddit}`);
        summary.items.push({
          redditId: raw.id,
          subreddit: source.subreddit,
          title: raw.title,
          contentType: "OTHER",
          action: "SKIPPED_DUPLICATE",
          relevanceScore: 0,
          reason: "Already imported previously",
        });
        continue;
      }

      // 2. Normalization & Classification
      const normalized = normalizeRedditPost(raw, source);
      summary.normalized++;
      console.log(
        `[reddit_post_normalized] id=${normalized.redditId} sub=r/${normalized.subreddit} type=${normalized.contentType} postType=${normalized.postType}`
      );

      // 3. Relevance & NSFW Check
      const relevance = calculateRedditRelevance(raw, source, normalized.contentType);
      if (!relevance.isAcceptable) {
        summary.lowRelevanceFiltered++;
        console.log(
          `[reddit_post_skipped] Low relevance or NSFW: ${normalized.redditId} (${relevance.rejectionReason})`
        );
        summary.items.push({
          redditId: normalized.redditId,
          subreddit: source.subreddit,
          title: normalized.title,
          contentType: normalized.contentType,
          action: "SKIPPED_LOW_RELEVANCE",
          relevanceScore: relevance.totalScore,
          reason: relevance.rejectionReason,
        });
        continue;
      }

      // 4. CampusLoop Central Moderation Safety Check
      const safety = runSafetyCheck({ title: normalized.title, body: normalized.body });
      if (safety.blocked) {
        summary.moderationFiltered++;
        console.warn(
          `[reddit_media_rejected] Safety violation on ${normalized.redditId}: ${safety.messages.join(", ")}`
        );
        summary.items.push({
          redditId: normalized.redditId,
          subreddit: source.subreddit,
          title: normalized.title,
          contentType: normalized.contentType,
          action: "SKIPPED_MODERATION",
          relevanceScore: relevance.totalScore,
          reason: safety.messages.join("; "),
        });
        continue;
      }

      // 5. Check secondary duplicate on permalink
      const permalinkDuplicate = await isRedditPostDuplicate(normalized.redditId, normalized.permalink);
      if (permalinkDuplicate) {
        summary.duplicates++;
        console.log(`[reddit_duplicate] Permalink duplicate: ${normalized.permalink}`);
        summary.items.push({
          redditId: normalized.redditId,
          subreddit: source.subreddit,
          title: normalized.title,
          contentType: normalized.contentType,
          action: "SKIPPED_DUPLICATE",
          relevanceScore: relevance.totalScore,
          reason: "Duplicate permalink detected",
        });
        continue;
      }

      // 6. Persistence
      if (dryRun) {
        summary.inserted++;
        summary.items.push({
          redditId: normalized.redditId,
          subreddit: source.subreddit,
          title: normalized.title,
          contentType: normalized.contentType,
          action: "DRY_RUN",
          relevanceScore: relevance.totalScore,
        });
        continue;
      }

      if (!defaultInstitutionId) {
        console.error("[reddit_ingest_error] No institution available in database to attach post to.");
        break;
      }

      try {
        const postId = randomUUID();
        const externalPostId = randomUUID();

        // Resolve or create dedicated subreddit UserProfile
        let authorId: string | null = null;
        try {
          const subredditProfile = await getOrCreateSubredditProfile(
            db,
            normalized.subreddit,
            defaultInstitutionId
          );
          authorId = subredditProfile.id;
        } catch (profileErr) {
          console.warn("[reddit_ingest_warn] Failed to resolve subreddit profile, falling back:", profileErr);
        }

        // A. Insert into posts table
        await db.insert(posts).values({
          id: postId,
          authorId,
          pseudonym: authorId ? null : `u/${normalized.redditAuthor}`,
          institutionId: defaultInstitutionId,
          type: normalized.postType,
          scope: "GLOBAL",
          title: normalized.title,
          body: normalized.body,
          isAnonymous: false,
          isSeeded: true, // Marked as imported external content
          status: safety.status,
          riskScore: safety.riskScore,
          createdAt: new Date(normalized.createdAt),
        });

        // B. Insert into external_posts table
        await db.insert(externalPosts).values({
          id: externalPostId,
          postId: postId,
          source: "reddit",
          externalId: normalized.redditId,
          externalFullname: normalized.redditFullname,
          subreddit: normalized.subreddit,
          externalAuthor: normalized.redditAuthor,
          permalink: normalized.permalink,
          canonicalUrl: normalized.canonicalUrl,
          score: normalized.score,
          commentCount: normalized.numComments,
          externalCreatedAt: normalized.createdAt,
          relevanceScore: relevance.totalScore,
          contentType: normalized.contentType,
          sourceMetadata: normalized.sourceMetadata,
          mediaStatus: "ACTIVE",
        });

        // C. Insert into external_media table
        const mediaToInsert: NormalizedRedditMedia[] =
          normalized.gallery.length > 0 ? normalized.gallery : normalized.media ? [normalized.media] : [];

        for (const item of mediaToInsert) {
          await db.insert(externalMedia).values({
            id: randomUUID(),
            externalPostId,
            mediaType: item.mediaType,
            mediaUrl: item.url,
            previewUrl: item.previewUrl,
            thumbnailUrl: item.thumbnailUrl,
            hlsUrl: item.hlsUrl,
            dashUrl: item.dashUrl,
            width: item.width,
            height: item.height,
            duration: item.duration,
            isGif: item.isGif,
            position: item.position,
            metadata: item.metadata,
          });
        }

        summary.inserted++;
        existingIds.add(normalized.redditId);

        console.log(
          `[reddit_post_inserted] Ingested r/${normalized.subreddit} - "${normalized.title.slice(0, 40)}" (postId=${postId})`
        );

        summary.items.push({
          redditId: normalized.redditId,
          subreddit: source.subreddit,
          title: normalized.title,
          contentType: normalized.contentType,
          action: "INSERTED",
          relevanceScore: relevance.totalScore,
          postId,
        });
      } catch (insertErr) {
        console.error(
          `[reddit_insert_failed] Failed persisting ${normalized.redditId}:`,
          insertErr instanceof Error ? insertErr.message : insertErr
        );
      }
    }
  }

  summary.durationMs = Date.now() - startTime;
  console.log(
    `[reddit_ingest_finished] Done in ${summary.durationMs}ms. Processed: ${summary.sourcesProcessed}, Fetched: ${summary.totalFetched}, Inserted: ${summary.inserted}, Duplicates: ${summary.duplicates}, Filtered: ${summary.moderationFiltered + summary.lowRelevanceFiltered}`
  );

  return summary;
}
