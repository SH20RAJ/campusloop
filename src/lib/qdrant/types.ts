/**
 * Qdrant Vector DB payload and configuration interfaces
 */

export interface QdrantPointPayload {
  [key: string]: unknown;
}

export interface QdrantPoint {
  id: string | number;
  vector: number[];
  payload?: QdrantPointPayload;
}

export interface QdrantSearchHit<T = QdrantPointPayload> {
  id: string | number;
  score: number;
  version?: number;
  payload?: T;
}

export interface PostVectorPayload extends QdrantPointPayload {
  postId: string;
  institutionId?: string | null;
  authorId?: string;
  type: string;
  scope: "CAMPUS" | "GLOBAL";
  isAnonymous: boolean;
  hashtags: string[];
  createdAt: number;
}

export interface ProfileVectorPayload extends QdrantPointPayload {
  profileId: string;
  institutionId?: string | null;
  gender?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  interests: string[];
  points?: number;
}

export interface AcademicResourceVectorPayload extends QdrantPointPayload {
  resourceId: string;
  institutionId?: string | null;
  uploaderId: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  resourceType: string;
}

export interface QdrantCollectionConfig {
  name: string;
  vectorSize: number;
  distance: "Cosine" | "Euclid" | "Dot";
}
