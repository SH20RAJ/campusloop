import { getCloudflareContext } from "@opennextjs/cloudflare";

// In-memory fallback store for local development when outside Cloudflare runtime
const localDevMemoryStorage = new Map<
  string,
  {
    data: Uint8Array;
    contentType: string;
    size: number;
    uploadedAt: Date;
    metadata: Record<string, string>;
  }
>();

export interface R2UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

/**
 * Access the Cloudflare R2 bucket binding
 */
export function getR2Bucket(): any | null {
  try {
    const ctx = getCloudflareContext();
    const env = ctx?.env as { MEDIA_BUCKET?: any } | undefined;
    if (env?.MEDIA_BUCKET) {
      return env.MEDIA_BUCKET;
    }
  } catch {}

  // Check globalThis in case of Cloudflare Workers execution
  if (typeof (globalThis as any).MEDIA_BUCKET !== "undefined") {
    return (globalThis as any).MEDIA_BUCKET;
  }
  if (typeof (globalThis as any).__env__?.MEDIA_BUCKET !== "undefined") {
    return (globalThis as any).__env__.MEDIA_BUCKET;
  }

  return null;
}

/**
 * Put an object into Cloudflare R2 with content type and metadata
 */
export async function putR2Object(
  key: string,
  data: Uint8Array | ArrayBuffer | Blob,
  contentType: string,
  customMetadata: Record<string, string> = {}
): Promise<R2UploadResult> {
  const bucket = getR2Bucket();
  const buffer = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  const size = buffer.byteLength;

  if (bucket && typeof bucket.put === "function") {
    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata,
    });
  } else {
    // Local dev memory storage fallback
    localDevMemoryStorage.set(key, {
      data: buffer,
      contentType,
      size,
      uploadedAt: new Date(),
      metadata: customMetadata,
    });
  }

  return {
    key,
    url: `/api/files/r2/${key}`,
    contentType,
    size,
  };
}

/**
 * Get an object from Cloudflare R2 with optional HTTP Range header support
 */
export async function getR2Object(
  key: string,
  rangeHeader?: string | null
): Promise<{
  body: ReadableStream | Uint8Array | null;
  contentType: string;
  size: number;
  range?: { offset: number; length: number };
} | null> {
  const bucket = getR2Bucket();

  if (bucket && typeof bucket.get === "function") {
    let getOptions: any;

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = Number.parseInt(match[1], 10);
        const end = match[2] ? Number.parseInt(match[2], 10) : undefined;
        if (!Number.isNaN(start)) {
          getOptions = {
            range: {
              offset: start,
              length: end !== undefined ? end - start + 1 : undefined,
            },
          };
        }
      }
    }

    const obj = await bucket.get(key, getOptions);
    if (!obj) return null;

    return {
      body: obj.body,
      contentType: obj.httpMetadata?.contentType || "application/octet-stream",
      size: obj.size,
      range: obj.range,
    };
  }

  // Local fallback
  const local = localDevMemoryStorage.get(key);
  if (!local) return null;

  return {
    body: local.data,
    contentType: local.contentType,
    size: local.size,
  };
}

/**
 * Delete an object from Cloudflare R2
 */
export async function deleteR2Object(key: string): Promise<boolean> {
  const bucket = getR2Bucket();
  if (bucket && typeof bucket.delete === "function") {
    await bucket.delete(key);
    return true;
  }
  localDevMemoryStorage.delete(key);
  return true;
}
