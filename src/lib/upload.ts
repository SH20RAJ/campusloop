/**
 * Multi-Media Upload Service for CampusLoop
 * Handles Images (ImgBB + R2 Fallback), Videos, Audio & Voice Notes, and Notes/PDF Documents.
 */

const IMGBB_API_KEY =
  process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY || "c0c864f0d9aadb0f7de371582b301397";

export type MediaType = "image" | "video" | "audio" | "document" | "file";

export interface MediaUploadResult {
  url: string;
  displayUrl?: string;
  thumbUrl?: string;
  type: MediaType;
  name: string;
  size: number;
  provider?: "imgbb" | "r2";
}

export type ImgBBUploadResponse = {
  url: string;
  displayUrl: string;
  thumbUrl: string;
  deleteUrl?: string;
  title: string;
};

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

/**
 * Upload an image directly to ImgBB with automatic Cloudflare R2 failover
 */
export async function uploadImageToImgBB(file: File): Promise<ImgBBUploadResponse> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // 1. Try ImgBB if valid image format and < 15MB
  if (file.size <= 15 * 1024 * 1024) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = (await res.json()) as {
          data: {
            url: string;
            display_url: string;
            thumb?: { url: string };
            delete_url?: string;
            title: string;
          };
        };

        return {
          url: data.data.url,
          displayUrl: data.data.display_url,
          thumbUrl: data.data.thumb?.url || data.data.url,
          deleteUrl: data.data.delete_url,
          title: data.data.title || file.name,
        };
      }
    } catch (err) {
      console.warn("[Client ImgBB upload failed, falling back to server R2 upload]:", err);
    }
  }

  // 2. Fallback to server endpoint (Cloudflare R2)
  const serverResult = await uploadMediaFile(file, "image");
  return {
    url: serverResult.url,
    displayUrl: serverResult.displayUrl || serverResult.url,
    thumbUrl: serverResult.thumbUrl || serverResult.url,
    title: serverResult.name,
  };
}

/**
 * Universal Multi-Media Uploader for Videos, Audio, PDFs, and Images
 */
export async function uploadMediaFile(
  file: File | Blob,
  category: MediaType = "file",
  fileName?: string
): Promise<MediaUploadResult> {
  const formData = new FormData();
  const actualName = fileName || (file instanceof File ? file.name : `voice_${Date.now()}.webm`);
  formData.append("file", file, actualName);
  formData.append("category", category);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data?.error || `Upload failed with status ${res.status}`);
  }

  return (await res.json()) as MediaUploadResult;
}
