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

  // ─── Core engineering disciplines ───
  { name: "Production & Industrial Engineering", slug: "production-and-industrial-engineering", category: "TECH", icon: "🏭" },
  { name: "Metallurgical & Materials Engineering", slug: "metallurgical-and-materials-engineering", category: "TECH", icon: "🔩" },
  { name: "Aerospace & Aeronautical Engineering", slug: "aerospace-and-aeronautical-engineering", category: "TECH", icon: "✈️" },
  { name: "Automobile Engineering", slug: "automobile-engineering", category: "TECH", icon: "🚗" },
  { name: "Mining Engineering", slug: "mining-engineering", category: "TECH", icon: "⛏️" },
  { name: "Petroleum Engineering", slug: "petroleum-engineering", category: "TECH", icon: "🛢️" },
  { name: "Instrumentation & Control Engineering", slug: "instrumentation-and-control-engineering", category: "TECH", icon: "🎛️" },
  { name: "Robotics & Automation", slug: "robotics-and-automation", category: "TECH", icon: "🦾" },
  { name: "Mechatronics Engineering", slug: "mechatronics-engineering", category: "TECH", icon: "🤖" },
  { name: "Environmental Engineering", slug: "environmental-engineering", category: "TECH", icon: "🌱" },
  { name: "Agricultural Engineering", slug: "agricultural-engineering", category: "TECH", icon: "🌾" },
  { name: "Food Technology & Processing", slug: "food-technology", category: "TECH", icon: "🍲" },
  { name: "Textile Engineering", slug: "textile-engineering", category: "TECH", icon: "🧵" },
  { name: "Marine Engineering", slug: "marine-engineering", category: "TECH", icon: "🚢" },
  { name: "Ocean Engineering & Naval Architecture", slug: "ocean-engineering-and-naval-architecture", category: "TECH", icon: "⚓" },
  { name: "Nuclear Engineering", slug: "nuclear-engineering", category: "TECH", icon: "☢️" },
  { name: "Ceramic Engineering", slug: "ceramic-engineering", category: "TECH", icon: "🏺" },
  { name: "Polymer & Plastics Engineering", slug: "polymer-engineering", category: "TECH", icon: "🧫" },
  { name: "Energy & Renewable Engineering", slug: "energy-and-renewable-engineering", category: "TECH", icon: "🔋" },
  { name: "Transportation Engineering", slug: "transportation-engineering", category: "TECH", icon: "🛣️" },
  { name: "Water Resources Engineering", slug: "water-resources-engineering", category: "TECH", icon: "💧" },
  { name: "Biomedical Engineering", slug: "biomedical-engineering", category: "TECH", icon: "🩻" },

  // ─── Computing specialisations ───
  { name: "Cyber Security & Forensics", slug: "cyber-security", category: "TECH", icon: "🔐" },
  { name: "Data Science & Analytics", slug: "data-science-and-analytics", category: "TECH", icon: "📊" },
  { name: "Internet of Things (IoT)", slug: "internet-of-things", category: "TECH", icon: "📡" },
  { name: "Cloud Computing & DevOps", slug: "cloud-computing", category: "TECH", icon: "☁️" },
  { name: "Electronics & Instrumentation", slug: "electronics-and-instrumentation", category: "TECH", icon: "🔦" },

  // ─── Medical & life sciences ───
  { name: "Dental Sciences (BDS)", slug: "dental-sciences", category: "MEDICAL", icon: "🦷" },
  { name: "Pharmacy & Pharmaceutical Sciences", slug: "pharmacy", category: "MEDICAL", icon: "💊" },
  { name: "Nursing & Allied Health", slug: "nursing-and-allied-health", category: "MEDICAL", icon: "🏥" },
  { name: "Physiotherapy & Rehabilitation", slug: "physiotherapy", category: "MEDICAL", icon: "🦴" },
  { name: "Veterinary Sciences", slug: "veterinary-sciences", category: "MEDICAL", icon: "🐾" },
  { name: "Ayurveda, Homeopathy & AYUSH", slug: "ayush", category: "MEDICAL", icon: "🌿" },
  { name: "Microbiology & Life Sciences", slug: "microbiology-and-life-sciences", category: "SCIENCE", icon: "🦠" },
  { name: "Zoology & Botany", slug: "zoology-and-botany", category: "SCIENCE", icon: "🌸" },
  { name: "Geology & Earth Sciences", slug: "geology-and-earth-sciences", category: "SCIENCE", icon: "🪨" },
  { name: "Statistics & Actuarial Science", slug: "statistics-and-actuarial-science", category: "SCIENCE", icon: "📉" },
  { name: "Environmental Science", slug: "environmental-science", category: "SCIENCE", icon: "🌍" },

  // ─── Design, arts & humanities ───
  { name: "Industrial & Product Design", slug: "industrial-and-product-design", category: "DESIGN", icon: "🪑" },
  { name: "Interior & Spatial Design", slug: "interior-and-spatial-design", category: "DESIGN", icon: "🛋️" },
  { name: "Fashion & Textile Design", slug: "fashion-and-textile-design", category: "DESIGN", icon: "👗" },
  { name: "Fine Arts & Visual Arts", slug: "fine-arts", category: "ARTS", icon: "🖼️" },
  { name: "Journalism & Mass Communication", slug: "journalism-and-mass-communication", category: "ARTS", icon: "📰" },
  { name: "Film, Media & Performing Arts", slug: "film-and-performing-arts", category: "ARTS", icon: "🎬" },
  { name: "Sociology & Political Science", slug: "sociology-and-political-science", category: "ARTS", icon: "🏛️" },
  { name: "History & Archaeology", slug: "history-and-archaeology", category: "ARTS", icon: "📜" },
  { name: "Languages & Linguistics", slug: "languages-and-linguistics", category: "ARTS", icon: "🗣️" },
  { name: "Education & Teaching (B.Ed)", slug: "education-and-teaching", category: "ARTS", icon: "🎓" },

  // ─── Business & services ───
  { name: "Marketing & Business Analytics", slug: "marketing-and-business-analytics", category: "BUSINESS", icon: "📣" },
  { name: "Human Resources Management", slug: "human-resources-management", category: "BUSINESS", icon: "🤝" },
  { name: "Supply Chain & Operations", slug: "supply-chain-and-operations", category: "BUSINESS", icon: "📦" },
  { name: "Hotel Management & Hospitality", slug: "hotel-management", category: "BUSINESS", icon: "🏨" },
  { name: "Tourism & Travel Management", slug: "tourism-and-travel", category: "BUSINESS", icon: "🧳" },
  { name: "Agriculture & Allied Sciences", slug: "agriculture-and-allied-sciences", category: "SCIENCE", icon: "🚜" },

  { name: "Other / Not listed", slug: "other", category: "TECH", icon: "✨" },
];

/**
 * Branches offered for a degree, filtered by discipline rather than a hardcoded
 * shortlist so the full catalog stays reachable as it grows.
 */
export function getBranchOptionsForDegree(degreeCode?: string): BranchOption[] {
  const all = BRANCH_OPTIONS;
  const other = all.filter((b) => b.slug === "other");
  const byCategory = (...categories: BranchOption["category"][]) =>
    all.filter((b) => categories.includes(b.category) && b.slug !== "other");

  if (!degreeCode) return all;

  const upper = degreeCode.toUpperCase();
  let matched: BranchOption[];

  if (upper.includes("ARCH")) {
    matched = all.filter(
      (b) => b.category === "DESIGN" || b.slug === "civil-and-structural-engineering"
    );
  } else if (upper.includes("MBBS") || upper.includes("MD") || upper.includes("BDS")) {
    matched = byCategory("MEDICAL");
  } else if (upper.includes("PHARM")) {
    matched = all.filter((b) => b.category === "MEDICAL" || b.category === "SCIENCE");
  } else if (upper.includes("MBA") || upper.includes("BBA") || upper.includes("COM")) {
    matched = byCategory("BUSINESS");
  } else if (upper.includes("MCA") || upper.includes("BCA")) {
    matched = byCategory("TECH");
  } else if (upper.includes("LAW") || upper.includes("LLB") || upper.includes("LLM")) {
    matched = byCategory("LAW", "ARTS");
  } else if (upper.includes("DES")) {
    matched = byCategory("DESIGN", "ARTS");
  } else if (upper === "B.SC" || upper === "M.SC") {
    matched = byCategory("SCIENCE", "TECH");
  } else if (upper === "BA" || upper === "MA") {
    matched = byCategory("ARTS");
  } else {
    // Engineering degrees and anything unrecognised see the whole catalog.
    return all;
  }

  // "Other / Not listed" is always available so nobody is forced into a wrong
  // branch just because their programme is unusual.
  return matched.length > 0 ? [...matched, ...other] : all;
}

export function getBranchesForDegree(degreeCode?: string): string[] {
  return getBranchOptionsForDegree(degreeCode).map((b) => b.name);
}

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
  return "🎓";
}
