import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { hexclaveServerApp } from "@/hexclave/server";
import { putR2Object } from "@/lib/r2";

export const dynamic = "force-dynamic";

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY || "";

// Whitelist of dangerous file extensions to reject immediately
const DISALLOWED_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "sh",
  "bin",
  "php",
  "phtml",
  "cgi",
  "pl",
  "html",
  "htm",
  "js",
  "mjs",
  "ts",
  "py",
  "rb",
  "dll",
  "so",
  "app",
  "jar",
]);

export async function POST(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to upload files" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalName = file.name || "upload";
    const mimeType = file.type || "application/octet-stream";
    const fileExt = originalName.includes(".") ? (originalName.split(".").pop() || "").toLowerCase() : "";

    // Reject dangerous executable scripts and files
    if (DISALLOWED_EXTENSIONS.has(fileExt)) {
      return NextResponse.json(
        { error: "This file type cannot be uploaded for security reasons." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const size = bytes.byteLength;

    // Detect media category
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");
    const isAudio =
      mimeType.startsWith("audio/") || originalName.endsWith(".m4a") || originalName.endsWith(".ogg");
    const isDoc =
      mimeType === "application/pdf" ||
      mimeType.includes("word") ||
      mimeType.includes("officedocument") ||
      mimeType.includes("presentation") ||
      mimeType.includes("powerpoint") ||
      mimeType === "application/zip" ||
      originalName.endsWith(".pdf") ||
      originalName.endsWith(".docx") ||
      originalName.endsWith(".pptx");

    const today = new Date().toISOString().slice(0, 10);
    const safeExt = fileExt ? `.${fileExt}` : "";
    const randomId = randomUUID();
    const safeUserId = user.id.replace(/[^a-zA-Z0-9_-]/g, "");

    // ─── 1. Image Upload ───
    if (isImage || category === "image") {
      if (size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image exceeds 15MB limit. Please choose a smaller photo." },
          { status: 400 }
        );
      }

      // Try primary image host if configured
      if (IMGBB_API_KEY) {
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
        } catch {}
      }

      // Resilient secure server storage
      const key = `images/${safeUserId}/${today}/${randomId}${safeExt || ".jpg"}`;
      const r2Result = await putR2Object(key, bytes, mimeType, {
        uploadedBy: user.id,
        originalName: originalName.slice(0, 100),
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

    // ─── 2. Video Upload ───
    if (isVideo || category === "video") {
      if (size > 75 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Video exceeds 75MB limit. Please select a shorter video." },
          { status: 400 }
        );
      }

      const key = `videos/${safeUserId}/${today}/${randomId}${safeExt || ".mp4"}`;
      const r2Result = await putR2Object(key, bytes, mimeType || "video/mp4", {
        uploadedBy: user.id,
        originalName: originalName.slice(0, 100),
      });

      return NextResponse.json({
        url: r2Result.url,
        type: "video",
        name: originalName,
        size,
        provider: "r2",
      });
    }

    // ─── 3. Audio & Voice Notes ───
    if (isAudio || category === "audio") {
      if (size > 30 * 1024 * 1024) {
        return NextResponse.json({ error: "Audio exceeds 30MB limit." }, { status: 400 });
      }

      const key = `audio/${safeUserId}/${today}/${randomId}${safeExt || ".webm"}`;
      const r2Result = await putR2Object(key, bytes, mimeType || "audio/webm", {
        uploadedBy: user.id,
        originalName: originalName.slice(0, 100),
      });

      return NextResponse.json({
        url: r2Result.url,
        type: "audio",
        name: originalName,
        size,
        provider: "r2",
      });
    }

    // ─── 4. Documents & Study Notes ───
    if (isDoc || category === "document") {
      if (size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: "Document exceeds 50MB limit." }, { status: 400 });
      }

      const cleanFilename = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
      const key = `documents/${safeUserId}/${today}/${randomId}_${cleanFilename}`;
      const r2Result = await putR2Object(
        key,
        bytes,
        mimeType || (originalName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
        {
          uploadedBy: user.id,
          originalName: originalName.slice(0, 100),
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

    // Default Generic File Upload
    if (size > 30 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 30MB limit." }, { status: 400 });
    }

    const key = `files/${safeUserId}/${today}/${randomId}${safeExt}`;
    const r2Result = await putR2Object(key, bytes, mimeType, {
      uploadedBy: user.id,
      originalName: originalName.slice(0, 100),
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
