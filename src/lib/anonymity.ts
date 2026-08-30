import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

const ANON_HANDLE_PREFIX = "anon_";
const ANON_HANDLE_HEX_LENGTH = 12;
const SEALED_PAYLOAD_VERSION = "v1";

function requireSecret(name: "ANON_PEPPER" | "ANON_VAULT_SECRET"): string {
  const value = process.env[name];
  if (value && value.length >= 16) return value;

  if (process.env.NODE_ENV === "production" || process.env.CF_PAGES === "1") {
    throw new Error(`Missing required secret ${name}. Set it via wrangler secret put ${name}.`);
  }

  return `${name}-development-only-secret`;
}

function getAnonPepper(): string {
  return requireSecret("ANON_PEPPER");
}

function getVaultKey(): Buffer {
  return createHash("sha256").update(requireSecret("ANON_VAULT_SECRET")).digest();
}

/** Stable public handle — also serves as the vault lookup key. */
export function deriveAnonHandle(profileId: string): string {
  const digest = createHmac("sha256", getAnonPepper()).update(`anon:${profileId}`).digest("hex");
  return `${ANON_HANDLE_PREFIX}${digest.slice(0, ANON_HANDLE_HEX_LENGTH)}`;
}

/**
 * AES-256-GCM seals the real profile id inside the vault. A full database
 * leak exposes only ciphertext; decryption requires ANON_VAULT_SECRET which
 * never lives in the database.
 */
export function sealIdentity(profileId: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getVaultKey(), iv);
  const encrypted = Buffer.concat([cipher.update(profileId, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    SEALED_PAYLOAD_VERSION,
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

export function openSealedIdentity(sealed: string): string {
  const [version, ivPart, dataPart, tagPart] = sealed.split(".");
  if (version !== SEALED_PAYLOAD_VERSION || !ivPart || !dataPart || !tagPart) {
    throw new Error("Invalid sealed identity payload");
  }

  const decipher = createDecipheriv("aes-256-gcm", getVaultKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataPart, "base64url")), decipher.final()]);
  return decrypted.toString("utf8");
}

type AuthorCarrier = { isAnonymous: boolean; author?: unknown };
type CommentCarrier = { comments?: Array<AuthorCarrier> };

/**
 * Removes author identity from anonymous posts/comments before rows cross
 * into client components or JSON responses. Non-anonymous rows pass through.
 */
export function sanitizeAnonRow<T extends AuthorCarrier & Partial<CommentCarrier>>(row: T): T {
  const safe: T = {
    ...row,
    author: row.isAnonymous ? null : row.author,
  };

  if (Array.isArray(safe.comments)) {
    safe.comments = safe.comments.map((comment) =>
      comment && typeof comment === "object"
        ? { ...comment, author: comment.isAnonymous ? null : comment.author }
        : comment
    );
  }

  return safe;
}
