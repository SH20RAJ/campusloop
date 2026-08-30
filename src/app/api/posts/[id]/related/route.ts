import { type NextRequest, NextResponse } from "next/server";
import { hexclaveServerApp } from "@/hexclave/server";
import { getRelatedPosts } from "@/lib/recommendations/related-posts";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const user = await hexclaveServerApp.getUser();
  const related = await getRelatedPosts(id, {
    currentUserId: user?.id,
    limit: 4,
  });

  return NextResponse.json({ related });
}
