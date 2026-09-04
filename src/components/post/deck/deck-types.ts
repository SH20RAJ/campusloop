import type { FeedPost } from "@/hooks/use-feed";

export interface DeckUserSuggestion {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  branch?: string | null;
  year?: number | null;
  institutionName?: string;
  isFollowing?: boolean;
}

export interface DeckAcademicResource {
  id: string;
  slug?: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  resourceType: string;
  fileUrl?: string | null;
  driveUrl?: string | null;
  downloadsCount: number;
  institutionName?: string;
}

export type LoopDeckItem =
  | { type: "POST"; post: FeedPost }
  | { type: "USER_SUGGESTIONS"; id: string; users: DeckUserSuggestion[] }
  | { type: "ACADEMIC_DROP"; id: string; resource: DeckAcademicResource }
  | { type: "POLL_SPOTLIGHT"; id: string; post: FeedPost };
