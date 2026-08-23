/**
 * CampusLoop Academic Degrees & Disciplines Catalog
 * Organized for UG, Masters, PhD, Engineering, Medical, Architecture, Arts, and Commerce.
 */

export type DegreeLevel = "BACHELORS" | "MASTERS" | "DOCTORATE" | "DIPLOMA" | "OTHER";

export interface DegreeOption {
  code: string;
  name: string;
  level: DegreeLevel;
  durationYears: number;
}

export const DEGREE_OPTIONS: DegreeOption[] = [
  // ─── Bachelors (UG) ───
  { code: "B.Tech", name: "Bachelor of Technology (B.Tech)", level: "BACHELORS", durationYears: 4 },
  { code: "B.E.", name: "Bachelor of Engineering (B.E.)", level: "BACHELORS", durationYears: 4 },
  { code: "B.Arch", name: "Bachelor of Architecture (B.Arch)", level: "BACHELORS", durationYears: 5 },
  { code: "MBBS", name: "Bachelor of Medicine & Surgery (MBBS)", level: "BACHELORS", durationYears: 5 },
  { code: "BDS", name: "Bachelor of Dental Surgery (BDS)", level: "BACHELORS", durationYears: 5 },
  { code: "BCA", name: "Bachelor of Computer Applications (BCA)", level: "BACHELORS", durationYears: 3 },
  { code: "BBA", name: "Bachelor of Business Administration (BBA)", level: "BACHELORS", durationYears: 3 },
  { code: "B.Com", name: "Bachelor of Commerce (B.Com)", level: "BACHELORS", durationYears: 3 },
  { code: "B.Sc", name: "Bachelor of Science (B.Sc)", level: "BACHELORS", durationYears: 3 },
  { code: "BA", name: "Bachelor of Arts (BA)", level: "BACHELORS", durationYears: 3 },
  { code: "B.Des", name: "Bachelor of Design (B.Des)", level: "BACHELORS", durationYears: 4 },
  { code: "B.Pharm", name: "Bachelor of Pharmacy (B.Pharm)", level: "BACHELORS", durationYears: 4 },
  { code: "LLB", name: "Bachelor of Laws (LLB / BA LLB)", level: "BACHELORS", durationYears: 5 },

  // ─── Masters (PG) ───
  { code: "M.Tech", name: "Master of Technology (M.Tech)", level: "MASTERS", durationYears: 2 },
  { code: "MBA", name: "Master of Business Administration (MBA / PGDM)", level: "MASTERS", durationYears: 2 },
  { code: "MCA", name: "Master of Computer Applications (MCA)", level: "MASTERS", durationYears: 2 },
  { code: "M.Arch", name: "Master of Architecture (M.Arch)", level: "MASTERS", durationYears: 2 },
  { code: "MD/MS", name: "Doctor of Medicine / Master of Surgery (MD/MS)", level: "MASTERS", durationYears: 3 },
  { code: "M.Sc", name: "Master of Science (M.Sc)", level: "MASTERS", durationYears: 2 },
  { code: "MA", name: "Master of Arts (MA)", level: "MASTERS", durationYears: 2 },
  { code: "M.Des", name: "Master of Design (M.Des)", level: "MASTERS", durationYears: 2 },
  { code: "M.Com", name: "Master of Commerce (M.Com)", level: "MASTERS", durationYears: 2 },
  { code: "LLM", name: "Master of Laws (LLM)", level: "MASTERS", durationYears: 2 },

  // ─── Doctorate & Research ───
  { code: "PhD", name: "Doctor of Philosophy (PhD Scholar)", level: "DOCTORATE", durationYears: 5 },
  { code: "PostDoc", name: "Post-Doctoral Fellow (PostDoc)", level: "DOCTORATE", durationYears: 2 },

  // ─── Diploma & Dual Degree ───
  { code: "Dual Degree", name: "Integrated Dual Degree (B.Tech + M.Tech/MBA)", level: "OTHER", durationYears: 5 },
  { code: "Diploma", name: "Polytechnic / Advanced Diploma", level: "DIPLOMA", durationYears: 3 },
];

export const DEGREE_CATEGORIES: { category: string; degrees: DegreeOption[] }[] = [
  {
    category: "Bachelors / Undergraduate (UG)",
    degrees: DEGREE_OPTIONS.filter((d) => d.level === "BACHELORS"),
  },
  {
    category: "Masters / Postgraduate (PG)",
    degrees: DEGREE_OPTIONS.filter((d) => d.level === "MASTERS"),
  },
  {
    category: "Doctorate & Research (PhD)",
    degrees: DEGREE_OPTIONS.filter((d) => d.level === "DOCTORATE"),
  },
  {
    category: "Diploma & Dual Degrees",
    degrees: DEGREE_OPTIONS.filter((d) => d.level === "DIPLOMA" || d.level === "OTHER"),
  },
];

export function getBranchesForDegree(degreeCode?: string): string[] {
  if (!degreeCode) return BRANCH_OPTIONS.map((b) => b.name);
  const upper = degreeCode.toUpperCase();
  if (upper.includes("ARCH")) return ["Architecture & Urban Planning", "Interior & Spatial Design"];
  if (upper.includes("MBBS") || upper.includes("MD") || upper.includes("BDS")) return ["Medicine & Clinical Surgery (MBBS)", "Dental Sciences (BDS)", "Biotechnology & Bio-Engineering"];
  if (upper.includes("MBA") || upper.includes("BBA") || upper.includes("COM")) return ["Master of Business Administration (MBA)", "Finance, Banking & Economics", "Commerce & Chartered Accountancy"];
  if (upper.includes("MCA") || upper.includes("BCA")) return ["Master of Computer Applications (MCA)", "Computer Science & Engineering", "Artificial Intelligence & Data Science", "Information Technology (IT)"];
  if (upper.includes("LAW") || upper.includes("LLB") || upper.includes("LLM")) return ["Law & Constitutional Studies"];
  if (upper.includes("DES")) return ["Design, UI/UX & Animation", "Architecture & Urban Planning"];
  return BRANCH_OPTIONS.map((b) => b.name);
}

export interface BranchOption {
  name: string;
  slug: string;
  category: "TECH" | "DESIGN" | "BUSINESS" | "SCIENCE" | "MEDICAL" | "ARTS" | "LAW";
  icon: string;
}

export const BRANCH_OPTIONS: BranchOption[] = [
  { name: "Computer Science & Engineering", slug: "computer-science-and-engineering", category: "TECH", icon: "💻" },
  { name: "Artificial Intelligence & Data Science", slug: "ai-and-data-science", category: "TECH", icon: "🤖" },
  { name: "Architecture & Urban Planning", slug: "architecture-and-urban-planning", category: "DESIGN", icon: "🏛️" },
  { name: "Electronics & Communication (ECE)", slug: "electronics-and-communication", category: "TECH", icon: "⚡" },
  { name: "Electrical & Electronics (EEE)", slug: "electrical-and-electronics", category: "TECH", icon: "🔌" },
  { name: "Mechanical Engineering", slug: "mechanical-engineering", category: "TECH", icon: "⚙️" },
  { name: "Civil & Structural Engineering", slug: "civil-and-structural-engineering", category: "TECH", icon: "🏗️" },
  { name: "Information Technology (IT)", slug: "information-technology", category: "TECH", icon: "🌐" },
  { name: "Master of Computer Applications (MCA)", slug: "mca", category: "TECH", icon: "🖥️" },
  { name: "Master of Business Administration (MBA)", slug: "mba", category: "BUSINESS", icon: "📈" },
  { name: "Medicine & Clinical Surgery (MBBS)", slug: "medicine-and-surgery", category: "MEDICAL", icon: "🩺" },
  { name: "Design, UI/UX & Animation", slug: "design-and-ui-ux", category: "DESIGN", icon: "🎨" },
  { name: "Biotechnology & Bio-Engineering", slug: "biotechnology", category: "SCIENCE", icon: "🧬" },
  { name: "Finance, Banking & Economics", slug: "finance-and-economics", category: "BUSINESS", icon: "💰" },
  { name: "Law & Constitutional Studies", slug: "law-and-legal-studies", category: "LAW", icon: "⚖️" },
  { name: "Commerce & Chartered Accountancy", slug: "commerce-and-accounting", category: "BUSINESS", icon: "📊" },
  { name: "Humanities, Literature & Psychology", slug: "humanities-and-psychology", category: "ARTS", icon: "📚" },
  { name: "Physics & Material Sciences", slug: "physics-and-materials", category: "SCIENCE", icon: "🔬" },
  { name: "Mathematics & Scientific Computing", slug: "mathematics-and-computing", category: "SCIENCE", icon: "📐" },
  { name: "Chemical Engineering & Chemistry", slug: "chemical-engineering", category: "TECH", icon: "🧪" },
];

export function slugifyBranch(name: string): string {
  if (!name) return "general";
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findBranchBySlug(slug: string): BranchOption | undefined {
  const normalized = slug.toLowerCase().replace(/^-+|-+$/g, "");
  return BRANCH_OPTIONS.find((b) => b.slug === normalized);
}

export function getBranchIcon(branchName?: string | null): string {
  if (!branchName) return "🎓";
  const lower = branchName.toLowerCase();
  if (lower.includes("arch")) return "🏛️";
  if (lower.includes("comp") || lower.includes("cse") || lower.includes("mca") || lower.includes("it")) return "💻";
  if (lower.includes("ai") || lower.includes("data")) return "🤖";
  if (lower.includes("electr") || lower.includes("ece") || lower.includes("eee")) return "⚡";
  if (lower.includes("mech")) return "⚙️";
  if (lower.includes("civil") || lower.includes("struct")) return "🏗️";
  if (lower.includes("med") || lower.includes("mbbs") || lower.includes("doctor")) return "🩺";
  if (lower.includes("mba") || lower.includes("biz") || lower.includes("manag")) return "📈";
  if (lower.includes("design") || lower.includes("ux")) return "🎨";
  if (lower.includes("law") || lower.includes("llb")) return "⚖️";
  if (lower.includes("bio")) return "🧬";
  if (lower.includes("fin") || lower.includes("com")) return "📊";
  if (lower.includes("chem")) return "🧪";
  if (lower.includes("phys")) return "🔬";
  if (lower.includes("math")) return "📐";
  return "🎓";
}
