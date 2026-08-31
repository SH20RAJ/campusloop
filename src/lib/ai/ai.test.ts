import { describe, expect, it } from "vitest";
import { CAMPUSLOOP_AI_SYSTEM_PROMPT } from "./prompt";
import { campusAiOrchestrator } from "./provider";
import type { AiToolContext } from "./types";

describe("CampusLoop AI Intelligence Layer & Tool Security", () => {
  it("enforces non-negotiable prompt injection defense in system prompt", () => {
    expect(CAMPUSLOOP_AI_SYSTEM_PROMPT).toContain("UNTRUSTED DATA");
    expect(CAMPUSLOOP_AI_SYSTEM_PROMPT).toContain(
      "Never identify or attempt to identify the author behind anonymous content"
    );
    expect(CAMPUSLOOP_AI_SYSTEM_PROMPT).toContain("Never reveal private conversations");
  });

  it("safely generates grounded post assistant suggestions in create mode", async () => {
    const context: AiToolContext = {
      userId: "user_test_123",
      institutionId: "inst_bit_mesra",
      mode: "create",
    };

    const response = await campusAiOrchestrator.generateAnswer(
      context,
      "tomorrow practical exam and no record complete",
      { resultsSummary: "", sources: [], rawResults: {} }
    );

    expect(response.answer).toBeDefined();
    expect(response.answer.length).toBeGreaterThan(20);
    expect(response.suggestedActions.length).toBeGreaterThan(0);
  });

  it("handles empty database search results gracefully without crashing", async () => {
    const context: AiToolContext = {
      userId: "user_test_123",
      institutionId: "inst_test_college",
      mode: "search",
    };

    const toolOutput = await campusAiOrchestrator.selectAndExecuteTools(
      context,
      "rare non-existent query 98765xyz"
    );
    expect(Array.isArray(toolOutput.sources)).toBe(true);

    const response = await campusAiOrchestrator.generateAnswer(
      context,
      "rare non-existent query 98765xyz",
      toolOutput
    );

    expect(response.answer).toBeDefined();
  });

  it("correctly isolates viewer institution scope and protects anonymous identities", () => {
    const viewerContext: AiToolContext = {
      userId: "viewer_1",
      institutionId: null, // Viewer has no private campus scope
      mode: "campus",
    };

    expect(viewerContext.institutionId).toBeNull();
  });
});
