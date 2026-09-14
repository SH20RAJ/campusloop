"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Can my professors, HODs, or college administration see who posted anonymously?",
    a: "No. CampusLoop is an independent student platform built with cryptographic identity escrow. Anonymous confessions store zero foreign-key references to your student profile or institutional email in public query layers. Even in the event of an administrative inquiry or database dump, your personal identity cannot be linked to anonymous posts.",
  },
  {
    q: "What if my college email isn't on the supported list yet?",
    a: "You can request your university hub in 30 seconds via the Colleges Directory or domain checker tool. If you have an active .ac.in or .edu.in email domain, our system automatically provisions your campus hub once 5 students verify interest.",
  },
  {
    q: "How is CampusLoop different from Reddit, Instagram, or WhatsApp?",
    a: "WhatsApp is noisy, unindexed, and leaks personal phone numbers to 500+ strangers. Instagram confession pages are run by unverified admins who post screenshots for clout and coaching ads. Reddit has no verified campus boundary. CampusLoop combines institutional email verification, dual-mode privacy, and structured utilities like PYQs, lost & found, and hostel marketplace.",
  },
  {
    q: "Can high school or JEE/NEET/CUET aspirants join CampusLoop?",
    a: "Yes, through Viewer Mode! Aspirants can explore verified campus feeds, read authentic senior discussions about placements and faculty, and follow dream colleges in read-only mode. Once you receive your college email upon admission, your account seamlessly upgrades to full posting and matchmaking capabilities.",
  },
  {
    q: "How does Match Mode work without making things awkward?",
    a: "Match Mode is 18+ and opt-in. Because students participate for hackathon squads, study partners, and campus friends, having a profile doesn't announce romantic intent. Furthermore, the Secret Crush Matcher is capped at 5 intents per semester: neither person is ever notified unless you both secretly pick each other. Zero awkward encounters in the library.",
  },
  {
    q: "Is CampusLoop completely free for students?",
    a: "Yes, 100% free for verified college students forever. There are no paywalls for reading feeds, downloading PYQs, posting confessions, or matching with campus peers.",
  },
];

export function LandingFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <LandingSection id="faq" bg="subtle">
      <LandingContainer className="max-w-4xl">
        <LandingSectionHeader
          badge="Frequently Asked Questions"
          headlineMain="Everything you need"
          headlineHighlight="to know."
          description="Clear answers regarding student privacy, email gating, anonymous accountability, and university coverage."
          align="center"
        />

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#111622] transition-all overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/30"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-foreground pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-blue-600"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
