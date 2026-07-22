import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts, institutions, userProfiles, communities } from "@/db/schema";
import { ilike, or, desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      return NextResponse.json({
        posts: [],
        colleges: [],
        users: [],
        communities: [],
      });
    }

    const searchPattern = `%${q.trim()}%`;

    // 1. Search Posts
    const foundPosts = await db.query.posts.findMany({
      where: or(ilike(posts.body, searchPattern), ilike(posts.title, searchPattern)),
      limit: 10,
      orderBy: [desc(posts.createdAt)],
      with: {
        author: true,
        institution: true,
        votes: true,
        comments: true,
      },
    });

    const formattedPosts = foundPosts.map((post) => ({
      ...post,
      votesCount: post.votes.reduce((acc, v) => acc + v.value, 0),
      commentsCount: post.comments.length,
      userVote: 0,
      votes: undefined,
      comments: undefined,
    }));

    // 2. Search Colleges
    const foundColleges = await db.query.institutions.findMany({
      where: or(
        ilike(institutions.name, searchPattern),
        ilike(institutions.slug, searchPattern),
        ilike(institutions.state, searchPattern),
        ilike(institutions.district, searchPattern)
      ),
      limit: 8,
    });

    // 3. Search Users
    const foundUsers = await db.query.userProfiles.findMany({
      where: or(
        ilike(userProfiles.displayName, searchPattern),
        ilike(userProfiles.username, searchPattern)
      ),
      limit: 8,
      with: {
        institution: true,
      },
    });

    // 4. Search Communities
    const foundCommunities = await db.query.communities.findMany({
      where: or(
        ilike(communities.name, searchPattern),
        ilike(communities.description, searchPattern)
      ),
      limit: 8,
    });

    return NextResponse.json({
      posts: formattedPosts,
      colleges: foundColleges,
      users: foundUsers,
      communities: foundCommunities,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
