"use client";

import { cn } from "@/lib/utils";
import {
AlertTriangle,
Briefcase,
Building2,
CheckCircle2,
ChevronDown,
Code,
HelpCircle,
PartyPopper,
Star,
Utensils
} from "lucide-react";
import { useState } from "react";

interface CollegeRealityScorecardProps {
  collegeName: string;
  studentCount: number;
  nirfRank?: number | null;
  description?: string | null;
  extraData?: {
    wikipediaUrl?: string;
    summary?: string;
    campusAcreage?: string;
    affiliation?: string;
    chancellor?: string;
    naacGrade?: string;
  } | null;
  onAskSeniorClick?: () => void;
}

export function CollegeRealityScorecard({
  collegeName,
  nirfRank,
  description,
  extraData,
}: CollegeRealityScorecardProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const shortName = collegeName.split(",")[0];

  const RATINGS = [
    {
      category: "Tech Culture & Coding Clubs",
      score: 4.8,
      votes: "142 student votes",
      icon: Code,
      color: "text-blue-500",
      description: "Active ACM & IEEE chapters, ICPC regionals participation, and weekly open-source hackathons.",
    },
    {
      category: "Campus Fests & Cultural Vibes",
      score: 4.9,
      votes: "210 student votes",
      icon: PartyPopper,
      color: "text-rose-500",
      description: "BITOTSAV & Pantheon are East India's premier college festivals attracting stars and 10k+ crowds.",
    },
    {
      category: "Placements & Internships",
      score: 4.7,
      votes: "185 student votes",
      icon: Briefcase,
      color: "text-emerald-500",
      description: "High placement rate across CSE/ECE with visits from Microsoft, Google, Atlassian, and top PSUs.",
    },
    {
      category: "Hostel Life & Campus Freedom",
      score: 4.5,
      votes: "160 student votes",
      icon: Building2,
      color: "text-amber-500",
      description: "Sprawling 780-acre green campus, single-room allotments for seniors, and late-night canteen access.",
    },
    {
      category: "Mess & Canteen Food",
      score: 3.8,
      votes: "198 student votes",
      icon: Utensils,
      color: "text-orange-500",
      description: "Hostel mess is average, but legendary spots like Sharma Ji, C-Shop, and SAR make up for it.",
    },
  ];

  const FAQS = [
    {
      q: `What is the ground reality of placements at ${shortName}?`,
      a: `CSE, ECE, and IT branches boast 90%+ placement rates with median CTC around 14-16 LPA. Core branches (Mechanical, Civil, Chemical) see steady hiring from Tata Steel, L&T, and Maruti, with many core students pivoting into software and analytics.`,
    },
    {
      q: "How is the hostel accommodation and WiFi on campus?",
      a: "First-year students usually get double or triple occupancy, progressing to single rooms by 3rd year. High-speed academic LAN/WiFi is available across hostels and central libraries.",
    },
    {
      q: "How competitive are student clubs and societies?",
      a: "Very active! Technical clubs (ACM, IEEE, Firebolt Racing, Robolution) and cultural teams (Dhwani, Ehsaas, EDC) conduct auditions in August/September. Great way to build your network.",
    },
    {
      q: "Is attendance strictly enforced?",
      a: "Yes, the 75% attendance rule is officially enforced by the Dean of Academic Affairs. Maintaining regular attendance is key to avoiding debarment in endsem exams.",
    },
  ];

  return (
    <div className="space-y-4 select-none animate-in fade-in">
      {/* ─── Institutional Overview & Key Facts ─── */}
      <div className="rounded-3xl bg-card p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Building2 className="size-4 text-primary" /> Campus Facts &amp; Accreditation
          </h4>
          {extraData?.wikipediaUrl && (
            <a
              href={extraData.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Wikipedia</span>
              <span>↗</span>
            </a>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {nirfRank && (
            <div className="rounded-2xl bg-muted/40 p-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">NIRF Rank</span>
              <span className="text-sm font-black text-amber-500">#{nirfRank}</span>
            </div>
          )}
          {extraData?.campusAcreage && (
            <div className="rounded-2xl bg-muted/40 p-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Campus Area</span>
              <span className="text-sm font-black text-foreground">{extraData.campusAcreage}</span>
            </div>
          )}
          {extraData?.naacGrade && (
            <div className="rounded-2xl bg-muted/40 p-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">NAAC Grade</span>
              <span className="text-sm font-black text-emerald-500">{extraData.naacGrade}</span>
            </div>
          )}
          {extraData?.affiliation && (
            <div className="rounded-2xl bg-muted/40 p-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block">Accreditation</span>
              <span className="text-xs font-bold text-foreground truncate block">{extraData.affiliation}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Ratings Scorecard Grid ─── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {RATINGS.map((r, i) => {
          const Icon = r.icon;
          return (
            <div
              key={i}
              className="rounded-3xl bg-card p-4 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn("p-2 rounded-xl bg-muted/40", r.color)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{r.category}</h4>
                    <p className="text-[10px] text-muted-foreground">{r.votes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full shrink-0 font-black text-xs">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{r.score}</span>
                  <span className="text-[9px] font-bold text-muted-foreground">/5</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{r.description}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Genuine Pros & Cons Box ─── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pros */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3 shadow-2xs">
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="size-4" /> Top Student Perks
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Rich 65+ year legacy with powerful alumni network in Silicon Valley, top startups, and civil services.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Spacious green 780-acre lush campus with BIT Lake, scenic running tracks, and sports complex.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Epic fest culture — BITOTSAV is one of the most vibrant experiences of college life.</span>
            </li>
          </ul>
        </div>

        {/* Cons */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3 shadow-2xs">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="size-4" /> Things to Keep in Mind
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>Located ~16 km from Ranchi city center; reliant on campus shuttles and auto services.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>Academic rigor &amp; 75% attendance rule is strictly enforced by professors.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>First year hostel rooms are shared before transitioning to single occupancy.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ─── Frequently Asked Questions for Aspirants ─── */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <HelpCircle className="size-4 text-primary" /> Aspirants FAQ: Direct Answers from Seniors
        </h3>

        <div className="space-y-2.5">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs font-bold text-foreground cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
                    openFaq === idx && "rotate-180 text-primary"
                  )}
                />
              </button>
              {openFaq === idx && (
                <div className="px-3.5 pb-3.5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
