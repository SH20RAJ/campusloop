import { and, desc, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  academicPlaylists,
  academicResources,
  comments,
  communities,
  institutions,
  merchants,
  posts,
  userProfiles,
} from "@/db/schema";
import { formatApiFeedPosts } from "@/lib/feed";

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
        merchants: [],
        academics: [],
        playlists: [],
      });
    }

    const searchPattern = `%${q.trim()}%`;

    // 1. Search Posts (published only)
    const foundPosts = await db.query.posts.findMany({
      where: and(
        eq(posts.status, "PUBLISHED"),
        or(ilike(posts.body, searchPattern), ilike(posts.title, searchPattern))
      ),
      limit: 15,
      orderBy: [desc(posts.createdAt)],
      with: {
        author: true,
        institution: true,
        community: true,
        votes: true,
        comments: {
          where: eq(comments.status, "PUBLISHED"),
          orderBy: [desc(comments.createdAt)],
          with: { author: true },
        },
        pollOptions: {
          with: { votes: true },
        },
      },
    });

    const formattedPosts = await formatApiFeedPosts(foundPosts as any);

    // 2. Search Colleges
    const foundColleges = await db.query.institutions.findMany({
      where: or(
        ilike(institutions.name, searchPattern),
        ilike(institutions.slug, searchPattern),
        ilike(institutions.state, searchPattern),
        ilike(institutions.district, searchPattern)
      ),
      limit: 10,
    });

    // 3. Search Users (students)
    const foundUsers = await db.query.userProfiles.findMany({
      where: or(
        ilike(userProfiles.displayName, searchPattern),
        ilike(userProfiles.username, searchPattern),
        ilike(userProfiles.officialName, searchPattern)
      ),
      limit: 10,
      with: {
        institution: true,
      },
    });

    // 4. Search Communities
    const foundCommunities = await db.query.communities.findMany({
      where: or(ilike(communities.name, searchPattern), ilike(communities.description, searchPattern)),
      limit: 10,
    });

    // 5. Search Merchants & Stores
    const foundMerchants = await db.query.merchants.findMany({
      where: and(
        eq(merchants.status, "ACTIVE"),
        or(
          ilike(merchants.name, searchPattern),
          ilike(merchants.description, searchPattern),
          ilike(merchants.address, searchPattern)
        )
      ),
      limit: 10,
    });

    // 6. Search Academic Resources (Notes, PYQs, Slides, Cheat Sheets)
    const foundAcademics = await db.query.academicResources.findMany({
      where: or(
        ilike(academicResources.title, searchPattern),
        ilike(academicResources.subjectName, searchPattern),
        ilike(academicResources.subjectCode, searchPattern),
        ilike(academicResources.description, searchPattern)
      ),
      limit: 15,
      orderBy: [desc(academicResources.createdAt)],
      with: {
        institution: true,
        uploader: true,
      },
    });

    // 7. Search Academic Study Playlists & Stacks
    const foundPlaylists = await db.query.academicPlaylists.findMany({
      where: or(
        ilike(academicPlaylists.title, searchPattern),
        ilike(academicPlaylists.description, searchPattern)
      ),
      limit: 8,
      orderBy: [desc(academicPlaylists.createdAt)],
      with: {
        creator: true,
      },
    });

    return NextResponse.json({
      posts: formattedPosts,
      colleges: foundColleges,
      users: foundUsers,
      communities: foundCommunities,
      merchants: foundMerchants,
      academics: foundAcademics,
      playlists: foundPlaylists,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
