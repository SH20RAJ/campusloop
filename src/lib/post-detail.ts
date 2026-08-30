import { and, asc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  comments,
  institutions,
  pollOptions,
  pollVotes,
  posts,
  reports,
  userProfiles,
  votes,
} from "@/db/schema";
import type { FeedPost } from "@/lib/feed";

export type DetailComment = {
  id: string;
  body: string;
  isAnonymous: boolean;
  pseudonym: string | null;
  createdAt: Date;
  authorId: string | null;
  authorDisplayName: string | null;
  authorUsername: string | null;
};

export type DetailPollOption = {
  id: string;
  text: string;
  voteCount: number;
  selectedByViewer: boolean;
};

export async function getPostDetail(postId: string, viewerProfileId: string) {
  const db = getDb();
  const commentCountSql = sql<number>`coalesce((select count(*)::int from ${comments} where ${comments.postId} = ${posts.id} and ${comments.status} = 'PUBLISHED'), 0)`;
  const voteScoreSql = sql<number>`coalesce((select sum(${votes.value})::int from ${votes} where ${votes.postId} = ${posts.id}), 0)`;
  const reportCountSql = sql<number>`coalesce((select count(*)::int from ${reports} where ${reports.targetType} = 'POST' and ${reports.targetId} = ${posts.id}), 0)`;

  const [post] = await db
    .select({
      id: posts.id,
      type: posts.type,
      scope: posts.scope,
      title: posts.title,
      body: posts.body,
      isAnonymous: posts.isAnonymous,
      pseudonym: posts.pseudonym,
      status: posts.status,
      riskScore: posts.riskScore,
      createdAt: posts.createdAt,
      authorId: posts.authorId,
      // Identity fields are nulled server-side for anonymous posts so the
      // real author never reaches the client (RSC payload included).
      authorDisplayName: sql<
        string | null
      >`case when ${posts.isAnonymous} then null else ${userProfiles.displayName} end`,
      authorUsername: sql<
        string | null
      >`case when ${posts.isAnonymous} then null else ${userProfiles.username} end`,
      institutionName: institutions.name,
      institutionState: institutions.state,
      commentCount: commentCountSql,
      voteScore: voteScoreSql,
      reportCount: reportCountSql,
    })
    .from(posts)
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
    .innerJoin(institutions, eq(posts.institutionId, institutions.id))
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return null;
  }

  const postComments = await db
    .select({
      id: comments.id,
      body: comments.body,
      isAnonymous: comments.isAnonymous,
      pseudonym: comments.pseudonym,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorDisplayName: sql<
        string | null
      >`case when ${comments.isAnonymous} then null else ${userProfiles.displayName} end`,
      authorUsername: sql<
        string | null
      >`case when ${comments.isAnonymous} then null else ${userProfiles.username} end`,
    })
    .from(comments)
    .leftJoin(userProfiles, eq(comments.authorId, userProfiles.id))
    .where(and(eq(comments.postId, postId), eq(comments.status, "PUBLISHED")))
    .orderBy(asc(comments.createdAt));

  const options =
    post.type === "POLL"
      ? await db
          .select({
            id: pollOptions.id,
            text: pollOptions.text,
            voteCount: sql<number>`coalesce((select count(*)::int from ${pollVotes} where ${pollVotes.optionId} = ${pollOptions.id}), 0)`,
            selectedByViewer: sql<boolean>`exists(select 1 from ${pollVotes} where ${pollVotes.optionId} = ${pollOptions.id} and ${pollVotes.userId} = ${viewerProfileId})`,
          })
          .from(pollOptions)
          .where(eq(pollOptions.postId, postId))
          .orderBy(asc(pollOptions.createdAt))
      : [];

  const viewerVote = await db
    .select({ value: votes.value })
    .from(votes)
    .where(and(eq(votes.postId, postId), eq(votes.userId, viewerProfileId)))
    .limit(1);

  return {
    post: post as FeedPost & { authorId: string },
    comments: postComments satisfies DetailComment[],
    pollOptions: options satisfies DetailPollOption[],
    viewerVote: viewerVote[0]?.value ?? 0,
  };
}
