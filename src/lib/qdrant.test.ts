import { describe, expect, it } from "vitest";
import { qdrant } from "./qdrant/client";
import { EMBEDDING_DIMENSION, generateEmbedding } from "./qdrant/embeddings";

describe("Qdrant Embeddings & Client Resilience", () => {
  it("generates normalized 384-dimensional dense vectors", async () => {
    const text = "Hostel food and midnight canteen cravings near main building";
    const vector = await generateEmbedding(text);

    expect(vector).toBeDefined();
    expect(vector.length).toBe(EMBEDDING_DIMENSION);

    // Verify L2 normalization (sum of squares ~= 1.0)
    const sumSq = vector.reduce((acc, val) => acc + val * val, 0);
    expect(sumSq).toBeGreaterThan(0.95);
    expect(sumSq).toBeLessThan(1.05);
  });

  it("handles empty and special character input gracefully", async () => {
    const emptyVector = await generateEmbedding("");
    expect(emptyVector.length).toBe(EMBEDDING_DIMENSION);
    expect(emptyVector.every((v) => v === 0)).toBe(true);

    const specialVector = await generateEmbedding("### !!! ??? &&& $$$");
    expect(specialVector.length).toBe(EMBEDDING_DIMENSION);
  });

  it("produces higher cosine similarity for semantically related text", async () => {
    const v1 = await generateEmbedding("Machine learning deep neural networks python pytorch");
    const v2 = await generateEmbedding("Artificial intelligence neural network deep learning model");
    const v3 = await generateEmbedding("Hostel mess breakfast samosa chai tea canteen");

    // Dot product of normalized vectors equals Cosine Similarity
    const sim1_2 = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    const sim1_3 = v1.reduce((sum, val, i) => sum + val * v3[i], 0);

    expect(sim1_2).toBeGreaterThan(sim1_3);
  });

  it("client safely handles offline/unreachable conditions without throwing exceptions", async () => {
    // Attempting a search or upsert should return empty/false gracefully
    const searchHits = await qdrant.search(
      "non_existent_collection_test",
      new Array(EMBEDDING_DIMENSION).fill(0.1)
    );
    expect(Array.isArray(searchHits)).toBe(true);
  });
});
