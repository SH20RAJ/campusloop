"use client";

import {
  ArrowRight,
  Bot,
  Camera,
  Code,
  GraduationCap,
  Home,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import {
  LandingCard,
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";

const COMMUNITIES = [
  {
    name: "ACM / IEEE Student Chapter",
    category: "Technical Society",
    members: "420+ verified members",
    activity: "Daily algorithmic challenges & mock interviews",
    icon: Code,
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    tags: ["Competitive Programming", "SIH 2026", "Web3"],
  },
  {
    name: "Robotics & Automation Society",
    category: "Hardware & IoT",
    members: "280+ verified members",
    activity: "Workshops, 3D printer lab slots, and drone testing",
    icon: Bot,
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    tags: ["ROS2", "PCB Design", "Bot Fights"],
  },
  {
    name: "Hostel 7 Tech & Cultural Wing",
    category: "Hostel Community",
    members: "310+ hostel residents",
    activity: "Mess feedback, LAN tournament nights, room swaps",
    icon: Home,
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    tags: ["Mess Reform", "FIFA LAN", "Night Canteen"],
  },
  {
    name: "Hackathon Squad Hub",
    category: "Project Matching",
    members: "520+ builders",
    activity: "Instant team matchmaking for national hackathons",
    icon: Laptop,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    tags: ["SIH", "Kaggle", "Devfolio Bounties"],
  },
  {
    name: "Aperture Photography Club",
    category: "Creative Arts",
    members: "190+ creators",
    activity: "Fest coverage teams, photowalks, lightroom presets",
    icon: Camera,
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    tags: ["Fest Media", "Portraits", "Street Walk"],
  },
  {
    name: "GATE & CAT Prep Circle",
    category: "Academic Focus",
    members: "610+ aspirants",
    activity: "Mock test analysis, topper notes, test series reviews",
    icon: GraduationCap,
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    tags: ["GATE CS", "Quant Formulas", "IIM Shortlists"],
  },
];

export function CommunitiesShowcase() {
  return (
    <LandingSection id="communities" bg="subtle">
      <LandingContainer>
        <LandingSectionHeader
          badge="Campus Micro-Hubs"
          headlineMain="Your campus communities,"
          headlineHighlight="actually connected."
          description="Important announcements should never drown under 500 unread memes in chaotic WhatsApp groups. Purpose-built channels keep discussions, rosters, and updates cleanly categorized."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMUNITIES.map((c) => {
            const Icon = c.icon;
            return (
              <LandingCard
                key={c.name}
                className="flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex size-10 items-center justify-center rounded-2xl border ${c.badgeColor}`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {c.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold tracking-tight text-foreground">
                      {c.name}
                    </h4>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {c.members}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {c.activity}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground">Verified Student Roster</span>
                  <Link
                    href="/handler/sign-up"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Join Hub <ArrowRight className="size-3" />
                  </Link>
                </div>
              </LandingCard>
            );
          })}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
