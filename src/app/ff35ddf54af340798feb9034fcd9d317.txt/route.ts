import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("ff35ddf54af340798feb9034fcd9d317", {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
