export type AiMode = "campus" | "study" | "search" | "create" | "random_loop" | "personal";

export type AiSource = {
  type: "post" | "comment" | "community" | "event" | "marketplace" | "housing" | "ride" | "academic";
  id: string;
  title?: string | null;
  excerpt?: string | null;
};

export type AiToolContext = {
  userId: string;
  institutionId: string | null;
  mode: AiMode;
  route?: string;
  entityType?: string;
  entityId?: string;
};

export type AiResponse = {
  answer: string;
  sources: AiSource[];
  suggestedActions: Array<{
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }>;
};
