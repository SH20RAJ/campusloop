/**
 * Utility to generate world-class, structured study prompts for AI agents (ChatGPT, Claude)
 * based on verified CampusLoop academic resources and course syllabi.
 */

export interface AcademicResourcePromptContext {
  title: string;
  subjectCode: string;
  courseCode?: string;
  department?: string;
  semester?: number | string;
  description?: string;
  materialUrl: string;
  pageUrl?: string;
  collegeName?: string;
}

export function buildAcademicStudyPrompt(ctx: AcademicResourcePromptContext): string {
  const code = ctx.subjectCode || ctx.courseCode || "General Academic";
  const college = ctx.collegeName ? ` at ${ctx.collegeName}` : "";

  return [
    `You are an elite university professor and private academic tutor specializing in ${code}.`,
    `I am preparing for my semester examinations and studying this verified course material:`,
    ``,
    `📚 COURSE DETAILS:`,
    `• Subject / Code: ${code}`,
    `• Topic: ${ctx.title}`,
    ctx.department ? `• Branch / Discipline: ${ctx.department}` : null,
    ctx.semester ? `• Semester: ${ctx.semester}` : null,
    ctx.description ? `• Overview: ${ctx.description}` : null,
    `• Direct Material Link: ${ctx.materialUrl}`,
    ctx.pageUrl ? `• Verified CampusLoop Link: ${ctx.pageUrl}` : null,
    ``,
    `🎯 YOUR TUTORING OBJECTIVES (Please structure your response clearly):`,
    `1. 🧠 INTUITIVE BREAKDOWN: Explain the foundational concepts of this topic with simple, high-impact real-world analogies.`,
    `2. 📐 KEY FORMULAS & THEOREMS: List every essential formula, definition, theorem, and derivation with variable explanations and SI units.`,
    `3. 📝 5 HIGH-YIELD EXAM QUESTIONS: Provide 5 representative semester exam questions (ranging from numerical problems to conceptual derivations) with detailed step-by-step model solutions.`,
    `4. ⚡ 15-MINUTE EXAM CRAM CHEAT SHEET: Give me a concise, bulleted revision summary to memorize right before entering the exam hall.`,
    `5. 💡 COMMON PITFALLS & EXAM TRICKS: Point out the typical mistakes students make in this subject during midsems and endsems, and how to avoid them.`,
    ``,
    `Begin by introducing the topic and teaching Module 1 in a clear, friendly, and rigorous manner.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function getChatGptStudyUrl(prompt: string): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}

export function getClaudeStudyUrl(prompt: string): string {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}
