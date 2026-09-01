import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { hexclaveServerApp } from "@/hexclave/server";
import { putR2Object } from "@/lib/r2";

export const dynamic = "force-dynamic";

const IMGBB_API_KEY =
  process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
  process.env.IMGBB_API_KEY ||
  "c0c864f0d9aadb0f7de371582b301397";

export async function POST(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const originalName = file.name || "upload";
    const bytes = await file.arrayBuffer();
    const size = bytes.byteLength;

    // Detect media category
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");
    const isAudio = mimeType.startsWith("audio/") || originalName.endsWith(".m4a") || originalName.endsWith(".ogg");
    const isDoc =
      mimeType === "application/pdf" ||
      mimeType.includes("word") ||
      mimeType.includes("officedocument") ||
      mimeType === "application/zip" ||
      originalName.endsWith(".pdf") ||
      originalName.endsWith(".docx");

    const today = new Date().toISOString().slice(0, 10);
    const fileExt = originalName.includes(".") ? originalName.split(".").pop() || "" : "";
    const safeExt = fileExt ? `.${fileExt}` : "";
    const randomId = randomUUID();

    // ─── 1. Image Upload (ImgBB Primary, R2 Automatic Fallback) ───
    if (isImage || category === "image") {
      // 15MB limit check for ImgBB
      if (size <= 15 * 1024 * 1024) {
        try {
          const imgbbFormData = new FormData();
          imgbbFormData.append("image", file);

          const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: imgbbFormData,
          });

          if (imgbbRes.ok) {
            const data = (await imgbbRes.json()) as {
              data: {
                url: string;
                display_url: string;
                thumb?: { url: string };
                title: string;
              };
            };
            return NextResponse.json({
              url: data.data.display_url || data.data.url,
              displayUrl: data.data.display_url || data.data.url,
              thumbUrl: data.data.thumb?.url || data.data.url,
              type: "image",
              name: originalName,
              size,
              provider: "imgbb",
            });
          }
        } catch (imgbbErr) {
          console.warn("[ImgBB upload failed, falling back to Cloudflare R2]:", imgbbErr);
        }
      }

      // R2 Fallback for Images
      const key = `images/${today}/${randomId}${safeExt || ".webp"}`;
      const r2Result = await putR2Object(key, bytes, mimeType, {
        uploadedBy: user.id,
        originalName,
      });

      return NextResponse.json({
        url: r2Result.url,
        displayUrl: r2Result.url,
        thumbUrl: r2Result.url,
        type: "image",
        name: originalName,
        size,
        provider: "r2",
      });
    }

    // ─── 2. Video Upload (Cloudflare R2, up to 100MB) ───
    if (isVideo || category === "video") {
      if (size > 100 * 1024 * 1024) {
        return NextResponse.json({ error: "Video exceeds 100MB limit" }, { status: 400 });
      }

      const key = `videos/${today}/${randomId}${safeExt || ".mp4"}`;
      const r2Result = await putR2Object(key, bytes, mimeType || "video/mp4", {
        uploadedBy: user.id,
        originalName,
      });

      return NextResponse.json({
        url: r2Result.url,
        type: "video",
        name: originalName,
        size,
        provider: "r2",
      });
    }

    // ─── 3. Audio & Voice Notes (Cloudflare R2, up to 35MB) ───
    if (isAudio || category === "audio") {
      if (size > 35 * 1024 * 1024) {
        return NextResponse.json({ error: "Audio exceeds 35MB limit" }, { status: 400 });
      }

      const key = `audio/${today}/${randomId}${safeExt || ".webm"}`;
      const r2Result = await putR2Object(key, bytes, mimeType || "audio/webm", {
        uploadedBy: user.id,
        originalName,
      });

      return NextResponse.json({
        url: r2Result.url,
        type: "audio",
        name: originalName,
        size,
        provider: "r2",
      });
    }

    // ─── 4. Documents & Study Notes PDFs (Cloudflare R2, up to 60MB) ───
    if (isDoc || category === "document") {
      if (size > 60 * 1024 * 1024) {
        return NextResponse.json({ error: "Document exceeds 60MB limit" }, { status: 400 });
      }

      const cleanFilename = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `documents/${today}/${randomId}_${cleanFilename}`;
      const r2Result = await putR2Object(
        key,
        bytes,
        mimeType || (originalName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
        {
          uploadedBy: user.id,
          originalName,
        }
      );

      return NextResponse.json({
        url: r2Result.url,
        type: "document",
        name: originalName,
        size,
        provider: "r2",
      });
    }

    // Default Generic R2 Upload
    const key = `files/${today}/${randomId}${safeExt}`;
    const r2Result = await putR2Object(key, bytes, mimeType, {
      uploadedBy: user.id,
      originalName,
    });

    return NextResponse.json({
      url: r2Result.url,
      type: "file",
      name: originalName,
      size,
      provider: "r2",
    });
  } catch (error) {
    console.error("Upload API route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
