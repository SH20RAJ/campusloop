import type { AiToolContext } from "./types";

/**
 * AI tools are intentionally typed application operations rather than raw SQL.
 * Each implementation must authenticate and authorize again before querying data.
 */
export const CAMPUSLOOP_AI_TOOL_DEFINITIONS = [
  {
    name: "search_campus_posts",
    description:
      "Search posts the current user is allowed to read within their institution and requested scope.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        timeRange: { type: "string", enum: ["24h", "7d", "30d"] },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "search_communities",
    description: "Find communities visible to the current user.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_trending_topics",
    description: "Get safe public trending topics for the user's institution.",
    parameters: {
      type: "object",
      properties: {
        timeRange: { type: "string", enum: ["24h", "7d"] },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "get_upcoming_events",
    description: "Find public upcoming events visible to the current user.",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string" },
        to: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "search_academic_resources",
    description: "Search authorized academic resources and discussions.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        subject: { type: "string" },
        semester: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "search_marketplace",
    description: "Search visible CampusLoop marketplace listings.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: { type: "string" },
        minPrice: { type: "number" },
        maxPrice: { type: "number" },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "search_housing",
    description: "Find verified student flatmate openings, PG vacancies, and campus housing.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "search_rides",
    description: "Find airport, railway station cab shares and campus rideshares.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: "get_my_saved_posts",
    description: "Get the current user's personal saved posts and bookmarks.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: [],
      additionalProperties: false,
    },
  },
] as const;

export type CampusLoopAiToolName = (typeof CAMPUSLOOP_AI_TOOL_DEFINITIONS)[number]["name"];

export type CampusLoopAiToolExecutor = (
  context: AiToolContext,
  args: Record<string, unknown>
) => Promise<{ data: unknown; sources: import("./types").AiSource[] }>;

export function assertInstitutionScope(context: AiToolContext) {
  if (!context.userId) throw new Error("Unauthorized");
}
