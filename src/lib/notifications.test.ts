import { describe,expect,it } from "vitest";
import { cleanNotificationSnippet,extractMentionUsernames } from "./notifications";

describe("notifications helpers", () => {
  it("extracts unique lowercased usernames from text", () => {
    const text = "Hey @shaswat_raj and @ANANYA_MBA, did you see @shaswat_raj's post?";
    const handles = extractMentionUsernames(text);
    expect(handles).toEqual(["shaswat_raj", "ananya_mba"]);
  });

  it("handles text with no mentions", () => {
    const text = "Just a regular campus update with #hashtag";
    const handles = extractMentionUsernames(text);
    expect(handles).toEqual([]);
  });

  it("cleans and truncates notification snippets", () => {
    const markdown = "Check this out ![image](https://example.com/pic.png) [cool link](https://test.com) and some very long details about the exam schedule.";
    const snippet = cleanNotificationSnippet(markdown, 40);
    expect(snippet).not.toContain("![image]");
    expect(snippet).not.toContain("https://test.com");
    expect(snippet.endsWith("...")).toBe(true);
    expect(snippet.length).toBeLessThanOrEqual(40);
  });
});
