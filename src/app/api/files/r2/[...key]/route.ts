import { type NextRequest, NextResponse } from "next/server";
import { getR2Object } from "@/lib/r2";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { key: keyParts } = await params;
    if (!keyParts || keyParts.length === 0) {
      return new NextResponse("File key required", { status: 400 });
    }

    const key = keyParts.join("/");
    const rangeHeader = req.headers.get("range");

    const obj = await getR2Object(key, rangeHeader);
    if (!obj) {
      return new NextResponse("File not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", obj.contentType);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Check if Range was requested and fulfilled
    if (obj.range && rangeHeader) {
      const start = obj.range.offset;
      const end = obj.range.offset + obj.range.length - 1;
      headers.set("Content-Range", `bytes ${start}-${end}/${obj.size}`);
      headers.set("Content-Length", obj.range.length.toString());

      return new NextResponse(obj.body as any, {
        status: 206,
        headers,
      });
    }

    headers.set("Content-Length", obj.size.toString());
    return new NextResponse(obj.body as any, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("R2 file stream error:", error);
    return new NextResponse("Failed to stream file", { status: 500 });
  }
}
