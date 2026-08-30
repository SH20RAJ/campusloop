/**
 * Fast, zero-dependency serverless vector embedding pipeline.
 * Produces normalized 384-dimensional dense vectors compatible with Cosine distance.
 */

export const EMBEDDING_DIMENSION = 384;

/**
 * Deterministic MurmurHash-inspired 32-bit fast string hasher
 */
function hashString(str: string, seed: number): number {
  let h = seed ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995);
    h ^= h >>> 15;
  }
  return h >>> 0;
}

/**
 * Tokenizes and generates normalized dense 384-dim semantic embedding vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const clean = text.toLowerCase().trim();
  const vector = new Array<number>(EMBEDDING_DIMENSION).fill(0);

  if (!clean) {
    return vector;
  }

  // Tokenize words, character n-grams, and bi-grams
  const words = clean.split(/[\s,._\-#?!/\\()[\]{}":;+*=~`]+/g).filter(Boolean);
  const tokens: string[] = [...words];

  // Add word pairs (bi-grams) for phrase semantics
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }

  // Add character 3-grams for typo and sub-word resilience
  for (const word of words) {
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        tokens.push(word.slice(i, i + 3));
      }
    }
  }

  // Project tokens into dense vector space across dimensions with multiple hash seeds
  for (const token of tokens) {
    const idx1 = hashString(token, 42) % EMBEDDING_DIMENSION;
    const idx2 = hashString(token, 1337) % EMBEDDING_DIMENSION;
    const idx3 = hashString(token, 99991) % EMBEDDING_DIMENSION;

    const sign1 = (hashString(token, 7) & 1) === 0 ? 1 : -1;
    const sign2 = (hashString(token, 19) & 1) === 0 ? 1 : -1;
    const sign3 = (hashString(token, 31) & 1) === 0 ? 1 : -1;

    // Weight by token length & presence
    const weight = Math.min(Math.sqrt(token.length), 3.0);
    vector[idx1] += sign1 * weight;
    vector[idx2] += sign2 * weight * 0.7;
    vector[idx3] += sign3 * weight * 0.5;
  }

  // L2 Normalization (unit length for Cosine Similarity)
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    sumSq += vector[i] * vector[i];
  }

  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }
  }

  return vector;
}
