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
  const pageLink = ctx.pageUrl || ctx.materialUrl;
  const directMaterialLink = ctx.materialUrl && ctx.materialUrl !== pageLink ? ctx.materialUrl : null;

  return [
    `You are an elite university professor, academic researcher, and private exam tutor specializing in ${code}${college}.`,
    `I am preparing for my college semester examinations and studying this verified syllabus material:`,
    ``,
    `📚 VERIFIED COURSE & RESOURCE CONTEXT:`,
    `• Subject / Course Code: ${code}`,
    `• Topic / Title: ${ctx.title}`,
    ctx.department ? `• Department / Branch: ${ctx.department}` : null,
    ctx.semester ? `• Semester: ${ctx.semester}` : null,
    ctx.collegeName ? `• University / College: ${ctx.collegeName}` : null,
    ctx.description ? `• Syllabus Overview: ${ctx.description}` : null,
    `• Material URL: ${pageLink}`,
    `• Verified CampusLoop Course Page: ${pageLink}`,
    directMaterialLink ? `• Direct Cloud Storage / Document Link: ${directMaterialLink}` : null,
    ``,
    `🤖 AI AGENT WEB BROWSING & DATA EXTRACTION INSTRUCTIONS:`,
    `Please fetch and browse the verified CampusLoop resource page at:`,
    `${pageLink}`,
    `Extract the full syllabus breakdown, questions, formulas, module units, peer annotations, and exam pattern to answer my study requests with complete accuracy.`,
    directMaterialLink
      ? `You may also consult the direct document at ${directMaterialLink} if needed.`
      : null,
    ``,
    `🎯 YOUR COMPREHENSIVE TUTORING OBJECTIVES (Structure your response clearly):`,
    `1. 🧠 INTUITIVE CONCEPT BREAKDOWN: Explain the foundational concepts of this topic with simple, high-impact real-world engineering analogies.`,
    `2. 📐 COMPLETE FORMULA & THEOREM BANK: List every essential formula, definition, governing law, theorem, and derivation with variable explanations and SI units.`,
    `3. 📝 5 HIGH-YIELD EXAM QUESTIONS WITH DETAILED SOLUTIONS: Provide 5 representative university examination questions (including numerical problems with complete working, conceptual derivations, and short-answer viva questions) with step-by-step model solutions.`,
    `4. ⚡ 15-MINUTE LAST-MINUTE EXAM CRAM CHEAT SHEET: Give me a concise, bulleted revision summary to memorize right before entering the examination hall.`,
    `5. 💡 COMMON EXAM TRAPS & PROFESSOR SECRETS: Point out the typical mistakes students make in this subject during midsems and endsems, and how to score full marks.`,
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
