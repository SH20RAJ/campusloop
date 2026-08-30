import { and, desc, eq, isNotNull, lt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  academicResources,
  gamingLobbies,
  housingListings,
  lostAndFoundItems,
  marketplaceItems,
  posts,
  ridesharePools,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "all";
    const cursor = searchParams.get("cursor"); // ISO timestamp string
    const limit = Math.min(20, Math.max(5, parseInt(searchParams.get("limit") || "12", 10)));

    const cursorDate = cursor ? new Date(cursor) : undefined;

    const feedItems: any[] = [];

    // Helper to format posts
    const formatPost = (post: any) => {
      const votesCount = (post.votes || []).reduce((acc: number, v: any) => acc + v.value, 0);
      const commentsCount = (post.comments || []).length;
      const userVote = (post.votes || []).find((v: any) => v.userId === profile.id)?.value || 0;

      const formattedPollOptions = post.pollOptions?.map((opt: any) => {
        const optVotesCount = (opt.votes || []).length;
        const userVoted = (opt.votes || []).some((v: any) => v.userId === profile.id);
        return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
      });

      const hasVotedPoll = formattedPollOptions?.some((opt: any) => opt.userVoted) || false;
      const totalPollVotes =
        formattedPollOptions?.reduce((acc: number, opt: any) => acc + opt.votesCount, 0) || 0;

      return {
        itemType: "POST",
        createdAt: post.createdAt,
        id: `post_${post.id}`,
        data: {
          ...post,
          votesCount,
          commentsCount,
          userVote,
          pollOptions: formattedPollOptions,
          hasVotedPoll,
          totalPollVotes,
          votes: undefined,
          comments: undefined,
        },
      };
    };

    if (tab === "all" || tab === "discussions") {
      const postConditions = [isNotNull(posts.communityId)];
      if (cursorDate) postConditions.push(lt(posts.createdAt, cursorDate));

      const communityPosts = await db.query.posts.findMany({
        where: and(...postConditions),
        orderBy: [desc(posts.createdAt)],
        limit,
        with: {
          author: true,
          institution: true,
          community: true,
          votes: true,
          comments: true,
          pollOptions: { with: { votes: true } },
        },
      });

      feedItems.push(...communityPosts.map(formatPost));
    }

    if (tab === "all" || tab === "lost_found") {
      const lfConditions: any[] = [];
      if (cursorDate) lfConditions.push(lt(lostAndFoundItems.createdAt, cursorDate));

      const lf = await db.query.lostAndFoundItems.findMany({
        where: lfConditions.length > 0 ? and(...lfConditions) : undefined,
        orderBy: [desc(lostAndFoundItems.createdAt)],
        limit,
        with: {
          author: {
            columns: { id: true, username: true, displayName: true, avatarUrl: true, points: true },
          },
          institution: {
            columns: { id: true, name: true, slug: true },
          },
        },
      });

      feedItems.push(
        ...lf.map((item) => ({
          itemType: "LOST_FOUND",
          createdAt: item.createdAt,
          id: `lf_${item.id}`,
          data: item,
        }))
      );
    }

    if (tab === "all" || tab === "marketplace" || tab === "buy-and-sell" || tab === "buy_and_sell") {
      const mpConditions: any[] = [];
      if (cursorDate) mpConditions.push(lt(marketplaceItems.createdAt, cursorDate));

      const mp = await db.query.marketplaceItems.findMany({
        where: mpConditions.length > 0 ? and(...mpConditions) : undefined,
        orderBy: [desc(marketplaceItems.createdAt)],
        limit,
        with: {
          seller: {
            columns: { id: true, username: true, displayName: true, avatarUrl: true, points: true },
          },
          institution: {
            columns: { id: true, name: true, slug: true },
          },
        },
      });

      feedItems.push(
        ...mp.map((item) => ({
          itemType: "MARKETPLACE",
          createdAt: item.createdAt,
          id: `mp_${item.id}`,
          data: item,
        }))
      );
    }

    if (tab === "all" || tab === "gaming") {
      const gConditions: any[] = [];
      if (cursorDate) gConditions.push(lt(gamingLobbies.createdAt, cursorDate));

      const gaming = await db.query.gamingLobbies.findMany({
        where: gConditions.length > 0 ? and(...gConditions) : undefined,
        orderBy: [desc(gamingLobbies.createdAt)],
        limit,
        with: {
          host: {
            columns: { id: true, username: true, displayName: true, avatarUrl: true, points: true },
          },
          institution: {
            columns: { id: true, name: true, slug: true },
          },
        },
      });

      feedItems.push(
        ...gaming.map((item) => ({
          itemType: "GAMING",
          createdAt: item.createdAt,
          id: `gaming_${item.id}`,
          data: item,
        }))
      );
    }

    if (tab === "all" || tab === "rideshare") {
      const rConditions: any[] = [];
      if (cursorDate) rConditions.push(lt(ridesharePools.createdAt, cursorDate));

      const rides = await db.query.ridesharePools.findMany({
        where: rConditions.length > 0 ? and(...rConditions) : undefined,
        orderBy: [desc(ridesharePools.createdAt)],
        limit,
        with: {
          creator: {
            columns: { id: true, username: true, displayName: true, avatarUrl: true, points: true },
          },
          institution: {
            columns: { id: true, name: true, slug: true },
          },
        },
      });

      feedItems.push(
        ...rides.map((item) => ({
          itemType: "RIDESHARE",
          createdAt: item.createdAt,
          id: `ride_${item.id}`,
          data: item,
        }))
      );
    }

    if (tab === "all" || tab === "housing") {
      const hConditions: any[] = [];
      if (cursorDate) hConditions.push(lt(housingListings.createdAt, cursorDate));

      const housing = await db.query.housingListings.findMany({
        where: hConditions.length > 0 ? and(...hConditions) : undefined,
        orderBy: [desc(housingListings.createdAt)],
        limit,
        with: {
          author: {
            columns: { id: true, username: true, displayName: true, avatarUrl: true, points: true },
          },
          institution: {
            columns: { id: true, name: true, slug: true },
          },
        },
      });

      feedItems.push(
        ...housing.map((item) => ({
          itemType: "HOUSING",
          createdAt: item.createdAt,
          id: `housing_${item.id}`,
          data: item,
        }))
      );
    }

    if (tab === "all" || tab === "academics") {
      const aConditions: any[] = [];
      if (cursorDate) aConditions.push(lt(academicResources.createdAt, cursorDate));

      const academics = await db.query.academicResources.findMany({
        where: aConditions.length > 0 ? and(...aConditions) : undefined,
        orderBy: [desc(academicResources.createdAt)],
        limit,
        with: {
          uploader: {
            columns: { id: true, username: true, displayName: true, avatarUrl: true, points: true },
          },
          institution: {
            columns: { id: true, name: true, slug: true },
          },
        },
      });

      feedItems.push(
        ...academics.map((item) => ({
          itemType: "ACADEMICS",
          createdAt: item.createdAt,
          id: `acad_${item.id}`,
          data: item,
        }))
      );
    }

    // Sort combined feed chronologically descending
    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Slice to the requested page limit
    const pageItems = feedItems.slice(0, limit);
    const hasMore = feedItems.length > limit;
    const nextCursor =
      pageItems.length > 0 ? new Date(pageItems[pageItems.length - 1].createdAt).toISOString() : null;

    return NextResponse.json({
      items: pageItems,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("GET /api/communities/feed error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
