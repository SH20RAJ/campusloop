"use client";

import { CheckCircle2, ExternalLink, FileText, Globe, GraduationCap, Search, Sparkles, UploadCloud, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export interface AcademicSource {
  id: string;
  name: string;
  university: string;
  category: "Official University Archive" | "Curated Student Hub" | "National Repository" | "State Tech Board";
  description: string;
  coverage: string;
  indexedCount: string;
  status: "ACTIVE_INDEXED" | "AGGREGATING";
  officialUrl: string;
  campusLoopFilterUrl: string;
  highlights: string[];
}

export const VERIFIED_ACADEMIC_SOURCES: AcademicSource[] = [
  {
    id: "bit-mesra-archive",
    name: "BIT Mesra Examination Section Archive",
    university: "Birla Institute of Technology, Mesra",
    category: "Official University Archive",
    description:
      "Official repository of past examination question papers spanning 8+ years (Monsoon & Spring 2018–2025) across all 25 academic departments.",
    coverage: "CSE, ECE, EEE, Mech, Civil, BioTech, Chemical, Architecture, HMCT, Management, Pharmacy & Basic Sciences",
    indexedCount: "7,800+ Official PYQs",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://bitmesra.ac.in/Other-Department-Pages/content/1/258/361",
    campusLoopFilterUrl: "/app/academics?scope=campus",
    highlights: ["Official Mid-Sem & End-Sem Papers", "Direct PDF Downloads", "Covers Semesters 1 to 8"],
  },
  {
    id: "bithub",
    name: "BitHub Academic Repository",
    university: "BIT Mesra Student Community",
    category: "Curated Student Hub",
    description:
      "Student-run digital vault providing syllabus notes, lab manuals, Multisim electrical schematics, NSS reports, and semester study guides.",
    coverage: "Physics Cycle, Chemistry Cycle, 2nd–4th Year Engineering Core Subjects",
    indexedCount: "250+ Notes & Lab Manuals",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://bithub.co.in",
    campusLoopFilterUrl: "/app/academics?resourceType=NOTES",
    highlights: ["Verified Lab Manuals", "Multisim Circuits", "First Year Cycles"],
  },
  {
    id: "bitsyll",
    name: "BitSyll Syllabus Network",
    university: "BIT Mesra CBCS Program",
    category: "Curated Student Hub",
    description:
      "Comprehensive CBCS course curriculum catalog with credit breakdowns, elective choices, and syllabus outcomes.",
    coverage: "All B.Tech, B.Arch, B.Pharm, M.Tech & MBA Programs",
    indexedCount: "Complete CBCS Catalog",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://bitsyll.com",
    campusLoopFilterUrl: "/app/academics",
    highlights: ["Subject Codes Mapping", "Credit Schemes", "Prerequisite Tracking"],
  },
  {
    id: "semester-notes",
    name: "Semester-Notes Engineering Vault",
    university: "All-India B.Tech Network",
    category: "National Repository",
    description:
      "Handwritten and verified digital lecture notes, algorithmic implementations, and formula cheat sheets for core computer science and engineering disciplines.",
    coverage: "Data Structures, Algorithms, OS, DBMS, Networks, TOC, Compiler Design & Maths",
    indexedCount: "500+ Curated Files",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://github.com/madhurimarawat/Semester-Notes",
    campusLoopFilterUrl: "/app/academics?branch=Computer%20Science",
    highlights: ["Handwritten Unit Notes", "Visual Diagram Guides", "Quick Revision Sheets"],
  },
  {
    id: "csai-archive",
    name: "BTech CSAI Coursework Archive",
    university: "AI & Data Science Hub",
    category: "Curated Student Hub",
    description:
      "Specialized academic notes, numerical mathematics problem sets, and practical assignments for Artificial Intelligence & Machine Learning degrees.",
    coverage: "Machine Learning, Deep Learning, Numerical Methods (CNM), Computer Vision & NLP",
    indexedCount: "120+ Specialized Notes",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://github.com/ashishtiwari-07/BTech-CSAI-Study-Archive",
    campusLoopFilterUrl: "/app/academics?branch=Computer%20Science",
    highlights: ["AI/ML Notebooks", "Solved Numerical Methods", "Unit Question Banks"],
  },
  {
    id: "aktu-quantum",
    name: "AKTU Quantum & Notes Network",
    university: "Dr. A.P.J. Abdul Kalam Technical University",
    category: "State Tech Board",
    description:
      "State technical board quantum revision modules, 10-year previous questions, and unit-by-unit solved notes for 800+ affiliated colleges.",
    coverage: "CSE, IT, ECE, EE, ME, Civil & Allied Engineering (Semesters 1–8)",
    indexedCount: "Quantum Series & PYQs",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://aktu.ac.in",
    campusLoopFilterUrl: "/app/academics?scope=global",
    highlights: ["10-Year Question Bank", "Unit-Wise Quantum Prep", "Exam Oriented Answers"],
  },
  {
    id: "vtu-resource",
    name: "VTU Resource Hub",
    university: "Visvesvaraya Technological University",
    category: "State Tech Board",
    description:
      "CBCS scheme model papers, solved question papers, and lecturer notes for VTU Belagavi affiliated colleges across Karnataka.",
    coverage: "Scheme 2018/2021/2022 Engineering Programs",
    indexedCount: "Model Papers & Notes",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://vturesource.com",
    campusLoopFilterUrl: "/app/academics?scope=global",
    highlights: ["CBCS Model Question Papers", "Scheme-Aligned Notes", "Semester Solved Papers"],
  },
  {
    id: "jntuh-notes",
    name: "JNTUH Fast Updates & Notes Hub",
    university: "JNTU Hyderabad Network",
    category: "State Tech Board",
    description:
      "R18 & R22 regulation semester lecture notes, previous question papers, and lab manuals for Telangana engineering colleges.",
    coverage: "B.Tech & B.Pharmacy (All Branches)",
    indexedCount: "Regulation Modules",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://jntuhnotes.net",
    campusLoopFilterUrl: "/app/academics?scope=global",
    highlights: ["R18 / R22 Regulation Notes", "Important Questions List", "Lab Experiments Manuals"],
  },
  {
    id: "anna-univ-brainkart",
    name: "Anna University BrainKart",
    university: "Anna University Chennai",
    category: "State Tech Board",
    description:
      "Regulation 2021 & 2017 lecture notes, 2-mark solved questions with answers, 16-mark essay questions, and lab observation sheets.",
    coverage: "Aerospace, Mechanical, ECE, CSE, IT, Civil, EEE & Biotechnology",
    indexedCount: "Lecture Notes & 2-Marks",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://brainkart.com",
    campusLoopFilterUrl: "/app/academics?scope=global",
    highlights: ["2-Mark & 16-Mark Solved Bank", "Regulation 2021 Syllabi", "Step-by-Step Derivations"],
  },
  {
    id: "nptel-iit",
    name: "NPTEL & SWAYAM OpenCourseWare",
    university: "IIT & IISc National Consortium",
    category: "National Repository",
    description:
      "Official academic course transcripts, lecture slides, and assignment solutions from premier IITs and IISc Bangalore professors.",
    coverage: "Advanced Engineering, Computer Science, Sciences, Management & Humanities",
    indexedCount: "National IIT Modules",
    status: "ACTIVE_INDEXED",
    officialUrl: "https://nptel.ac.in",
    campusLoopFilterUrl: "/app/academics",
    highlights: ["IIT Professor Lectures", "Verified Assignments", "Comprehensive Transcripts"],
  },
];

interface AcademicSourcesDirectoryProps {
  onOpenUploadModal?: () => void;
}

export function AcademicSourcesDirectory({ onOpenUploadModal }: AcademicSourcesDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categories = [
    { id: "all", label: "All Repositories (10)" },
    { id: "Official University Archive", label: "University Archives 🏛️" },
    { id: "Curated Student Hub", label: "Student Hubs 🎒" },
    { id: "State Tech Board", label: "Tech Boards 🏫" },
    { id: "National Repository", label: "National IIT/NIT 🇮🇳" },
  ];

  const filteredSources = VERIFIED_ACADEMIC_SOURCES.filter((s) => {
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.university.toLowerCase().includes(search.toLowerCase()) ||
      s.coverage.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pt-2 select-none">
      {/* Promotion & Ingestion Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-background to-purple-950/20 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Globe className="size-4" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                Connected Academic Knowledge Vault
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-foreground">
              Official University Archives &amp; Open Engineering Sources
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              CampusLoop continuously crawls, organizes, and verifies past examination papers and study notes from
              India&apos;s leading engineering institutions. <strong>All materials are 100% free with direct downloads</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenUploadModal && (
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  onOpenUploadModal();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <UploadCloud className="size-4" />
                <span>Submit Missing Source / Notes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-700 text-[10px] font-mono">+20 LP</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Aggregation Badges */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">BIT Mesra:</span>
            <strong className="text-foreground font-mono">7,800+ PYQs</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Engineering Branches:</span>
            <strong className="text-foreground font-mono">25 Depts</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Exam Years:</span>
            <strong className="text-foreground font-mono">2018–2025</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-indigo-400" />
            <span className="text-muted-foreground">Direct Download:</span>
            <strong className="text-indigo-400 font-mono">100% Free</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sounds.tap();
                setActiveCategory(cat.id);
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                activeCategory === cat.id
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search university or portal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-muted/40 border border-border/40 text-xs focus:outline-hidden focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <div
            key={source.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-border/50 bg-card p-5 hover:border-indigo-500/40 hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {source.category}
                  </span>
                  <h3 className="text-base font-black text-foreground mt-1 group-hover:text-indigo-400 transition-colors">
                    {source.name}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground/90">{source.university}</p>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="size-3" />
                  <span>{source.indexedCount}</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">{source.description}</p>

              {/* Highlights Pill Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {source.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Scope note */}
              <div className="pt-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Covers:</span> {source.coverage}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-border/30">
              <Link
                href={source.campusLoopFilterUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                <FileText className="size-3.5" />
                <span>Browse Materials</span>
              </Link>

              <a
                href={source.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
              >
                <span>Visit Source</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
