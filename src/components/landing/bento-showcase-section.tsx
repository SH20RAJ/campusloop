"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Heart,
  MessageCircle,
  Repeat2,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { AnimateHeart, AnimateRepeat2, AnimateShieldCheck } from "@/components/ui/animated-icon";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export function BentoShowcaseSection() {
  // Micro-state for confession card
  const [anonLiked, setAnonLiked] = useState(false);
  const [anonLikes, setAnonLikes] = useState(128);
  const [anonReposted, setAnonReposted] = useState(false);
  const [anonReposts, setAnonReposts] = useState(24);
  const [isAnonMode, setIsAnonMode] = useState(true);

  // Micro-state for dating match card
  const [matched, setMatched] = useState(false);

  // Micro-state for marketplace item
  const [inquired, setInquired] = useState(false);

  function handleToggleAnonLike() {
    sounds.pop();
    haptics.light();
    if (anonLiked) {
      setAnonLiked(false);
      setAnonLikes((c) => c - 1);
    } else {
      setAnonLiked(true);
      setAnonLikes((c) => c + 1);
    }
  }

  function handleToggleAnonRepost() {
    sounds.pop();
    haptics.light();
    if (anonReposted) {
      setAnonReposted(false);
      setAnonReposts((c) => c - 1);
    } else {
      setAnonReposted(true);
      setAnonReposts((c) => c + 1);
    }
  }

  const bentoItems: BentoItem[] = [
    // 01. Verified Campus Feed & Accountable Anonymity (ColSpan 2)
    {
      id: "feed-anon",
      title: "Verified Feed & Accountable Anonymity",
      description:
        "Speak your mind freely without fear of harassment. Post anonymously with cryptographically backed accountability — zero outside trolls or predators.",
      icon: <AnimateShieldCheck className="size-5 text-[#1D9BF0]" />,
      status: "Verified Pulse",
      meta: "Campus Feed",
      tags: ["Confessions", "No Outsiders", "Polls"],
      colSpan: 2,
      hasPersistentHover: true,
      cta: "Explore Feed",
      ctaHref: "/app",
      contentNode: (
        <div className="rounded-xl border border-border/50 bg-background/80 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                {isAnonMode ? "🎭" : "SR"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">
                    {isAnonMode ? "Anonymous Junior" : "Shaswat Raj"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {isAnonMode ? "@anon · 12m" : "@shaswat · 12m"}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">BIT Mesra · Computer Science</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                haptics.light();
                setIsAnonMode(!isAnonMode);
              }}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-border/60 hover:bg-muted transition-colors cursor-pointer"
            >
              {isAnonMode ? "Switch to Public" : "Switch to Anon"}
            </button>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed">
            "Honestly the best thing about end-sems is that tea stall outside Gate 2 at 2 AM with everyone debugging assignment code."
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleToggleAnonLike}
                className={cn(
                  "flex items-center gap-1 transition-colors cursor-pointer",
                  anonLiked ? "text-rose-500" : "hover:text-rose-500"
                )}
              >
                <AnimateHeart className="size-3.5" />
                <span className="font-mono text-[11px]">{anonLikes}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleAnonRepost}
                className={cn(
                  "flex items-center gap-1 transition-colors cursor-pointer",
                  anonReposted ? "text-emerald-500" : "hover:text-emerald-500"
                )}
              >
                <Repeat2 className="size-3.5" />
                <span className="font-mono text-[11px]">{anonReposts}</span>
              </button>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
              100% Student Verified
            </span>
          </div>
        </div>
      ),
    },

    // 02. Campus Match & Dating (ColSpan 1)
    {
      id: "dating-match",
      title: "Campus Match & Dating",
      description:
        "Swipe with confidence. Connect only with verified students from your own university or neighboring campuses in your city.",
      icon: <Heart className="size-5 text-rose-500" />,
      status: "Mutual Radius",
      meta: "100% Verified",
      tags: ["Dating", "Zero Catfish", "College Filter"],
      colSpan: 1,
      cta: "Discover Matches",
      ctaHref: "/app/dating",
      contentNode: (
        <div className="rounded-xl border border-border/50 bg-background/80 p-3.5 space-y-3 text-center">
          <div className="size-14 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-md">
            <div className="size-full rounded-full bg-card flex items-center justify-center font-bold text-sm text-foreground">
              Aanya, 21
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Aanya Sharma</div>
            <div className="text-[11px] text-muted-foreground font-mono">Economics · Miranda House</div>
            <div className="text-[10px] text-rose-500 font-semibold mt-0.5">94% Campus Compatibility</div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.success();
              haptics.success();
              setMatched(!matched);
            }}
            className={cn(
              "w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border",
              matched
                ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                : "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20"
            )}
          >
            {matched ? "It's a Mutual Match!" : "Connect on Campus"}
          </button>
        </div>
      ),
    },

    // 03. Academics Vault & Multi-File Notes (ColSpan 1)
    {
      id: "academics-vault",
      title: "Academics Vault & PYQs",
      description:
        "Previous year question papers, semester toppers' notes, lecture slides, and AI study prompts organized by course code.",
      icon: <BookOpen className="size-5 text-emerald-500" />,
      status: "Crowdsourced",
      meta: "Instant PDF Reader",
      tags: ["PYQs", "Notes", "AI Study"],
      colSpan: 1,
      cta: "Browse Notes",
      ctaHref: "/app/academics",
      contentNode: (
        <div className="rounded-xl border border-border/50 bg-background/80 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-foreground">CS301 · Operating Systems</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500">
              3 Files
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">Complete Endsem Handwritten Notes + Solved PYQs</div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted">Unit 1-5 PDF</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted">2023 Solved</span>
          </div>
        </div>
      ),
    },

    // 04. Student Marketplace & Rentals (ColSpan 2)
    {
      id: "marketplace-p2p",
      title: "Peer-to-Peer Campus Marketplace",
      description:
        "Buy and sell hostel essentials, cycles, graphing calculators, lab coats, and monitors directly with seniors and batchmates. Zero platform fees.",
      icon: <ShoppingBag className="size-5 text-amber-500" />,
      status: "Direct Chat",
      meta: "0% Fees",
      tags: ["Hostel Gear", "Books", "Cycles", "Rentals"],
      colSpan: 2,
      cta: "Explore Listings",
      ctaHref: "/app/marketplace",
      contentNode: (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/80 p-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Hero Sprint 21-Speed Mountain Cycle</span>
              <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                ₹3,200
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Hostel 4 Ground Floor · Perfect condition, departing senior sale
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setInquired(!inquired);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border",
              inquired
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-muted hover:bg-muted/80 text-foreground border-border/60"
            )}
          >
            {inquired ? "Chat Request Sent" : "Message Senior"}
          </button>
        </div>
      ),
    },

    // 05. 1,350+ Indexed College Hubs (ColSpan 3)
    {
      id: "college-directory",
      title: "1,350+ Indian College Hubs with Radius Discovery",
      description:
        "Every college gets its own private perimeter. Switch seamlessly between your local campus timeline and all-India trending topics.",
      icon: <GraduationCap className="size-5 text-indigo-500" />,
      status: "Pan-India",
      meta: "Live Directory",
      tags: ["IITs", "NITs", "BITS", "DU", "VIT", "SRMC", "State Unis"],
      colSpan: 3,
      cta: "Explore College Hubs",
      ctaHref: "/app/colleges",
      contentNode: (
        <div className="rounded-xl border border-border/50 bg-background/80 p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs text-muted-foreground">
            <Search className="size-3.5 text-primary shrink-0" />
            <span>Search any college (e.g. IIT Bombay, Delhi University, BITS Pilani)...</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {["IIT Bombay", "BITS Pilani", "Delhi University", "NIT Trichy", "BIT Mesra", "VIT Vellore", "IIT Madras"].map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 text-foreground text-[11px] font-semibold border border-border/40 hover:border-primary/40 transition-colors"
              >
                <ShieldCheck className="size-3 text-primary" />
                <span>{col}</span>
              </span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <LandingSection id="features" bg="muted">
      <LandingContainer>
        <LandingSectionHeader
          eyebrow="Architected for Campus Life"
          headlineMain="Everything you need in one verified network."
          headlineSub="No outside trolls. No advertising trackers. Just your college."
          align="center"
        />

        <BentoGrid items={bentoItems} className="pt-2" />
      </LandingContainer>
    </LandingSection>
  );
}
