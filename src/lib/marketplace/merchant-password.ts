/**
 * Password hashing for merchant portal accounts.
 *
 * PBKDF2-SHA256 over Web Crypto, because the merchant portal runs on workerd
 * where bcrypt/argon2 native bindings are unavailable. 210,000 iterations is
 * OWASP's 2023 floor for PBKDF2-HMAC-SHA256.
 *
 * Stored format: `pbkdf2$<iterations>$<salt-b64>$<hash-b64>`.
 *
 * Existing rows hold plaintext. `verifyMerchantPassword` accepts those once,
 * reports `needsRehash`, and the login route upgrades the row in place — so
 * nobody is locked out by the migration, and every account that logs in once
 * ends up hashed.
 */

const ALGORITHM = "PBKDF2";
const HASH = "SHA-256";
const ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const PREFIX = "pbkdf2";

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), ALGORITHM, false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt: salt as BufferSource, iterations, hash: HASH },
    key,
    KEY_BITS
  );
  return toBase64(bits);
}

export async function hashMerchantPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${toBase64(salt)}$${hash}`;
}

export function isHashedPassword(stored: string): boolean {
  return stored.startsWith(`${PREFIX}$`);
}

/**
 * Length-independent constant-time comparison.
 *
 * Compares over a fixed number of iterations so neither the contents nor the
 * length of the secret leaks through timing.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export interface PasswordVerification {
  valid: boolean;
  /** True when the stored value is legacy plaintext and should be upgraded. */
  needsRehash: boolean;
}

export async function verifyMerchantPassword(
  password: string,
  stored: string | null | undefined
): Promise<PasswordVerification> {
  // No credential on file is not a free pass. The previous implementation
  // short-circuited its whole check when this was empty, so any password
  // logged in — and then the typed password was saved as the real one.
  if (!stored) return { valid: false, needsRehash: false };

  if (!isHashedPassword(stored)) {
    return { valid: timingSafeEqual(password, stored), needsRehash: true };
  }

  const [, iterationsRaw, saltB64, expected] = stored.split("$");
  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations <= 0 || !saltB64 || !expected) {
    return { valid: false, needsRehash: false };
  }

  try {
    const actual = await derive(password, fromBase64(saltB64), iterations);
    return { valid: timingSafeEqual(actual, expected), needsRehash: iterations < ITERATIONS };
  } catch {
    return { valid: false, needsRehash: false };
  }
}

/**
 * Generate a readable one-time password for a new or reset merchant account.
 *
 * Shown to the admin exactly once, at the moment they create or reset it, and
 * shared with the shopkeeper over WhatsApp. It is never recoverable afterwards
 * — only resettable — because only its hash is stored.
 */
export function generateMerchantPassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let code = "";
  for (const byte of bytes) code += alphabet[byte % alphabet.length];
  return `cl-${code.slice(0, 5)}-${code.slice(5)}`;
}

/**
 * Remove credential columns from a merchant row before it leaves the server.
 *
 * Admin endpoints used to `.returning()` the whole row, which handed the
 * password straight back to the browser.
 */
export function stripMerchantSecrets<T extends { loginPassword?: string | null }>(
  merchant: T
): Omit<T, "loginPassword"> {
  const { loginPassword: _ignored, ...safe } = merchant;
  return safe;
}
