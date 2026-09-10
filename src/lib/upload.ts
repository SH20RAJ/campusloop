/**
 * Multi-Media Upload Service for CampusLoop
 * Handles Images, Videos, Audio & Voice Notes, and Notes/PDF Documents.
 * Features automatic client-side compression, progress tracking, and zero tech jargon.
 */

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || process.env.IMGBB_API_KEY || "";

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

export interface UploadProgress {
  percent: number;
  stage: "compressing" | "uploading" | "processing" | "complete";
  loaded?: number;
  total?: number;
  message?: string;
}

export type UploadProgressCallback = (progress: UploadProgress) => void;

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
 * Compresses an image on the client side using HTML5 Canvas.
 * Prevents HTTP 413 (Payload Too Large) by reducing multi-megabyte camera photos
 * to crisp, web-optimized images (max 2048px, ~600KB-1.2MB).
 */
export async function compressImageIfNeeded(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
    maxSizeBytes?: number;
  }
): Promise<File> {
  const maxDim = options?.maxDimension ?? 2048;
  const quality = options?.quality ?? 0.85;
  const maxSizeBytes = options?.maxSizeBytes ?? 1.5 * 1024 * 1024; // 1.5MB threshold

  // Don't attempt to compress animated GIFs or SVGs
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  // If already under size threshold and standard type, skip compression
  if (file.size <= maxSizeBytes && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return file;
  }

  // Only run in browser environment with Canvas available
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width <= 0 || height <= 0) {
        resolve(file);
        return;
      }

      // Calculate scale if image exceeds maximum dimensions
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP or JPEG for optimal compression ratio
      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If compression didn't help, return original
            resolve(file);
            return;
          }

          const cleanName =
            file.name.replace(/\.[^/.]+$/, "") + (outputType === "image/jpeg" ? ".jpg" : ".png");
          const compressedFile = new File([blob], cleanName, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to uncompressed file on decode error
    };

    img.src = objectUrl;
  });
}

/**
 * Upload an image with automatic client-side compression and live progress updates.
 */
export async function uploadImageToImgBB(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<ImgBBUploadResponse> {
  if (!file) {
    throw new Error("No file selected.");
  }

  // 1. Optimize image locally to prevent HTTP 413
  onProgress?.({
    percent: 10,
    stage: "compressing",
    message: "Optimizing image...",
  });

  let processedFile = file;
  try {
    processedFile = await compressImageIfNeeded(file);
  } catch {
    processedFile = file;
  }

  // 2. Try primary image provider if key exists and file <= 15MB
  if (IMGBB_API_KEY && processedFile.size <= 15 * 1024 * 1024) {
    try {
      onProgress?.({
        percent: 30,
        stage: "uploading",
        message: "Uploading image...",
      });

      const formData = new FormData();
      formData.append("image", processedFile);

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

        onProgress?.({
          percent: 100,
          stage: "complete",
          message: "Uploaded successfully!",
        });

        return {
          url: data.data.url,
          displayUrl: data.data.display_url,
          thumbUrl: data.data.thumb?.url || data.data.url,
          deleteUrl: data.data.delete_url,
          title: data.data.title || file.name,
        };
      }
    } catch {
      // Graceful fallback to server storage
    }
  }

  // 3. Resilient server storage upload with progress tracking
  const serverResult = await uploadMediaFile(processedFile, "image", processedFile.name, onProgress);
  onProgress?.({
    percent: 100,
    stage: "complete",
    message: "Uploaded successfully!",
  });

  return {
    url: serverResult.url,
    displayUrl: serverResult.displayUrl || serverResult.url,
    thumbUrl: serverResult.thumbUrl || serverResult.url,
    title: serverResult.name,
  };
}

/**
 * Universal Multi-Media Uploader with accurate progress tracking via XMLHttpRequest.
 */
export async function uploadMediaFile(
  file: File | Blob,
  category: MediaType = "file",
  fileName?: string,
  onProgress?: UploadProgressCallback
): Promise<MediaUploadResult> {
  const actualName = fileName || (file instanceof File ? file.name : `recording_${Date.now()}.webm`);
  const fileSize = file.size;

  // Enforce friendly client-side limits
  const maxLimits: Record<MediaType, { max: number; label: string }> = {
    image: { max: 15 * 1024 * 1024, label: "15MB" },
    video: { max: 75 * 1024 * 1024, label: "75MB" },
    audio: { max: 30 * 1024 * 1024, label: "30MB" },
    document: { max: 50 * 1024 * 1024, label: "50MB" },
    file: { max: 50 * 1024 * 1024, label: "50MB" },
  };

  const limit = maxLimits[category] || maxLimits.file;
  if (fileSize > limit.max) {
    throw new Error(`File is too large (${formatFileSize(fileSize)}). Maximum allowed is ${limit.label}.`);
  }

  const formData = new FormData();
  formData.append("file", file, actualName);
  formData.append("category", category);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        onProgress?.({
          percent,
          stage: "uploading",
          loaded: event.loaded,
          total: event.total,
          message: `Uploading ${percent}%...`,
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as MediaUploadResult;
          onProgress?.({
            percent: 100,
            stage: "complete",
            message: "Upload complete!",
          });
          resolve(result);
        } catch {
          reject(new Error("Unexpected server response format."));
        }
      } else if (xhr.status === 413) {
        reject(new Error("File exceeds server payload limits. Please choose a smaller or compressed file."));
      } else if (xhr.status === 401) {
        reject(new Error("Please sign in to upload files."));
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data?.error || "Upload failed. Please try again."));
        } catch {
          reject(new Error("Upload failed. Please check your network and try again."));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network connection error during upload. Please try again."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload cancelled."));
    };

    xhr.send(formData);
  });
}
