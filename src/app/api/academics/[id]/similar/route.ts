import { NextResponse } from "next/server";
import { getSimilarAcademicResources } from "@/lib/recommendations/academic-recommendations";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCachedAuthUser();
    const profile = user ? await getCachedUserProfile(user.id) : null;

    const similar = await getSimilarAcademicResources(id, {
      limit: 6,
      currentUserId: profile?.id,
    });

    return NextResponse.json({ similar });
  } catch (error) {
    console.error("Error fetching similar academic resources:", error);
    return NextResponse.json({ error: "Internal Server Error", similar: [] }, { status: 500 });
  }
}
