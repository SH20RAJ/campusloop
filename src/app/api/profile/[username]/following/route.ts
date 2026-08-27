import { getFollowListResponse } from "@/lib/follow-list-route";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return getFollowListResponse(request, username, "following");
}
