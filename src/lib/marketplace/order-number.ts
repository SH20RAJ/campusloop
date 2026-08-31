/**
 * Human-readable, collision-safe order numbers.
 *
 * The old scheme was `CL-${1000 + random(9000)}` against a column with a
 * UNIQUE constraint. With only 9,000 possible values that is a birthday
 * problem: a duplicate becomes more likely than not at ~112 orders, and once a
 * few thousand orders exist checkout starts throwing on nearly every attempt.
 *
 * The alphabet drops 0/O/1/I/L/U — students read these numbers aloud to a
 * canteen counter, and those are the characters that get misheard. That leaves
 * 30 symbols; six of them give ~729 million combinations, so a collision is
 * rare enough that the retry below is a safety net rather than a hot path.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 6;

export function generateOrderNumber(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  let code = "";
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return `CL-${code}`;
}

/**
 * Insert with a fresh order number, retrying only on a unique-constraint
 * collision.
 *
 * Any other database error is rethrown immediately — retrying a genuine
 * failure (a bad column, a dead connection) would just burn attempts and
 * bury the real cause.
 */
export async function withUniqueOrderNumber<T>(
  insert: (orderNumber: string) => Promise<T>,
  maxAttempts = 5
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await insert(generateOrderNumber());
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Could not allocate a unique order number");
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  // Postgres 23505 = unique_violation. Neon surfaces it as `code`; the message
  // check covers drivers that only stringify it.
  const code = (error as { code?: unknown }).code;
  if (code === "23505") return true;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message.includes("duplicate key value");
}
