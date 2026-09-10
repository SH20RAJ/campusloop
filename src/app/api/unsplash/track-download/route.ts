import { type NextRequest, NextResponse } from "next/server";
import { trackUnsplashDownload } from "@/lib/unsplash";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { downloadLocation } = body as { downloadLocation?: string };

    if (downloadLocation && typeof downloadLocation === "string") {
      // Trigger ping asynchronously
      void trackUnsplashDownload(downloadLocation);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
