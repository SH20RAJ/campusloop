import { describe, expect, it } from "bun:test";
import { slugifyAcademicResource } from "./slug";

describe("slugifyAcademicResource", () => {
  it("generates a clean slug with subject code prefix", () => {
    const slug = slugifyAcademicResource({
      id: "acad_os_notes_02",
      subjectCode: "CS304",
      title: "Operating Systems (CS304) Complete Handwritten Lecture Notes",
    });

    expect(slug).toBe("cs304-operating-systems-complete-handwritten-lecture-notes");
  });

  it("handles resource titles without parentheses or subject code cleanly", () => {
    const slug = slugifyAcademicResource({
      id: "acad_maths_01",
      subjectCode: "MA101",
      title: "Calculus & Linear Algebra Module 1 Notes",
    });

    expect(slug).toBe("ma101-calculus-and-linear-algebra-module-1-notes");
  });

  it("falls back to id if title and subject code are empty", () => {
    const slug = slugifyAcademicResource({
      id: "acad_fallback_123",
      title: "",
      subjectCode: null,
    });

    expect(slug).toBe("acad_fallback_123");
  });
});
