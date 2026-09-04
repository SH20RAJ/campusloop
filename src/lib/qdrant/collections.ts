import { EMBEDDING_DIMENSION } from "./embeddings";
import type { QdrantCollectionConfig } from "./types";

export const COLLECTIONS = {
  POSTS: "campus_posts",
  DATING_PROFILES: "campus_dating_profiles",
  COMMUNITIES: "campus_communities",
  ACADEMIC_RESOURCES: "campus_academic_resources",
} as const;

export const COLLECTION_CONFIGS: Record<string, QdrantCollectionConfig> = {
  [COLLECTIONS.POSTS]: {
    name: COLLECTIONS.POSTS,
    vectorSize: EMBEDDING_DIMENSION,
    distance: "Cosine",
  },
  [COLLECTIONS.DATING_PROFILES]: {
    name: COLLECTIONS.DATING_PROFILES,
    vectorSize: EMBEDDING_DIMENSION,
    distance: "Cosine",
  },
  [COLLECTIONS.COMMUNITIES]: {
    name: COLLECTIONS.COMMUNITIES,
    vectorSize: EMBEDDING_DIMENSION,
    distance: "Cosine",
  },
  [COLLECTIONS.ACADEMIC_RESOURCES]: {
    name: COLLECTIONS.ACADEMIC_RESOURCES,
    vectorSize: EMBEDDING_DIMENSION,
    distance: "Cosine",
  },
};
