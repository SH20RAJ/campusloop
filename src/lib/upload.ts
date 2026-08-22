/**
 * ImgBB Image Upload Service for CampusLoop
 * Handles client & server side uploads for posts, comments, stories, and profile avatars.
 */

const IMGBB_API_KEY =
  process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
  process.env.IMGBB_API_KEY ||
  "c0c864f0d9aadb0f7de371582b301397";

export type ImgBBUploadResponse = {
  url: string;
  displayUrl: string;
  thumbUrl: string;
  deleteUrl?: string;
  title: string;
};

/**
 * Upload an image file directly to ImgBB.
 */
export async function uploadImageToImgBB(file: File): Promise<ImgBBUploadResponse> {
  // 1. Validate file
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Please upload a valid image (JPEG, PNG, WebP, GIF, or SVG).");
  }

  // 15MB limit check
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Image file size exceeds 15MB limit.");
  }

  // 2. Prepare FormData
  const formData = new FormData();
  formData.append("image", file);

  // 3. Upload to ImgBB
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      (errData as { error?: { message?: string } })?.error?.message ||
        `Image upload failed with status ${res.status}`
    );
  }

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
    title: data.data.title,
  };
}
