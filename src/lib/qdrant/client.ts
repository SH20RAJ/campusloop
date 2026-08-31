import { COLLECTION_CONFIGS } from "./collections";
import type { QdrantPoint, QdrantPointPayload, QdrantSearchHit } from "./types";

/**
 * Resilient Qdrant REST Client Singleton with Circuit Breaker & Strict Timeout.
 */
class QdrantResilientClient {
  private url: string;
  private apiKey: string;
  private isConfigured: boolean;

  // Circuit breaker state
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly COOLDOWN_MS = 30_000; // 30s cooldown before retry
  private readonly TIMEOUT_MS = 600; // 600ms strict timeout

  private verifiedCollections = new Set<string>();

  constructor() {
    this.url = (process.env.QDRANT_URL || "").replace(/\/+$/, "");
    this.apiKey = process.env.QDRANT_API_KEY || "";
    this.isConfigured = Boolean(this.url && this.apiKey);
  }

  private isCircuitOpen(): boolean {
    if (!this.isConfigured) return true;
    if (this.failureCount >= this.FAILURE_THRESHOLD) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed < this.COOLDOWN_MS) {
        return true;
      }
      // Half-open attempt: allow one trial request
    }
    return false;
  }

  private recordSuccess() {
    this.failureCount = 0;
  }

  private recordFailure(err?: unknown) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[Qdrant Warning] Request failed (attempt ${this.failureCount}/${this.FAILURE_THRESHOLD}):`,
        err instanceof Error ? err.message : err
      );
    }
  }

  /**
   * Safe fetch with strict timeout and auth headers
   */
  private async safeFetch(endpoint: string, options: RequestInit = {}): Promise<Response | null> {
    if (this.isCircuitOpen()) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const res = await fetch(`${this.url}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Qdrant HTTP ${res.status}: ${res.statusText}`);
      }

      this.recordSuccess();
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      this.recordFailure(err);
      return null;
    }
  }

  /**
   * Ensures a collection exists, creating it idempotently if missing.
   */
  async ensureCollection(collectionName: string): Promise<boolean> {
    if (!this.isConfigured || this.isCircuitOpen()) return false;
    if (this.verifiedCollections.has(collectionName)) return true;

    try {
      // Check collection status
      const checkRes = await this.safeFetch(`/collections/${collectionName}`);
      if (checkRes && checkRes.ok) {
        this.verifiedCollections.add(collectionName);
        return true;
      }

      // Create collection if missing
      const config = COLLECTION_CONFIGS[collectionName];
      if (!config) return false;

      const createRes = await this.safeFetch(`/collections/${collectionName}`, {
        method: "PUT",
        body: JSON.stringify({
          vectors: {
            size: config.vectorSize,
            distance: config.distance,
          },
        }),
      });

      if (createRes && createRes.ok) {
        this.verifiedCollections.add(collectionName);
        return true;
      }
    } catch {
      // Non-blocking catch
    }
    return false;
  }

  /**
   * Upsert vector points into a collection (non-blocking)
   */
  async upsert(collectionName: string, points: QdrantPoint[]): Promise<boolean> {
    if (!this.isConfigured || this.isCircuitOpen() || points.length === 0) return false;

    await this.ensureCollection(collectionName);

    const res = await this.safeFetch(`/collections/${collectionName}/points?wait=false`, {
      method: "PUT",
      body: JSON.stringify({ points }),
    });

    return Boolean(res && res.ok);
  }

  /**
   * Search for nearest neighbors using vector similarity with optional payload filter.
   */
  async search<T = QdrantPointPayload>(
    collectionName: string,
    vector: number[],
    options: {
      limit?: number;
      filter?: Record<string, unknown>;
      scoreThreshold?: number;
    } = {}
  ): Promise<QdrantSearchHit<T>[]> {
    if (!this.isConfigured || this.isCircuitOpen()) return [];

    await this.ensureCollection(collectionName);

    const res = await this.safeFetch(`/collections/${collectionName}/points/search`, {
      method: "POST",
      body: JSON.stringify({
        vector,
        limit: options.limit ?? 5,
        with_payload: true,
        score_threshold: options.scoreThreshold ?? 0.05,
        filter: options.filter,
      }),
    });

    if (!res) return [];

    try {
      const data = (await res.json()) as { result?: QdrantSearchHit<T>[] };
      return data.result || [];
    } catch {
      return [];
    }
  }

  /**
   * Delete vector points from a collection
   */
  async delete(collectionName: string, pointIds: (string | number)[]): Promise<boolean> {
    if (!this.isConfigured || this.isCircuitOpen() || pointIds.length === 0) return false;

    const res = await this.safeFetch(`/collections/${collectionName}/points/delete`, {
      method: "POST",
      body: JSON.stringify({ points: pointIds }),
    });

    return Boolean(res && res.ok);
  }
}

export const qdrant = new QdrantResilientClient();
export const qdrantClient = qdrant;
