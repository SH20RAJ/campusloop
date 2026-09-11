"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/landing/reveal";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does college email verification work?",
    a: "You enter your official university email (e.g. roll_number@bitmesra.ac.in). We dispatch a single-use 6-digit OTP to your college inbox. Once entered, your student enrollment is cryptographically verified without sharing any institutional passwords.",
  },
  {
    q: "Is my anonymity safe from professors, HODs, and classmates?",
    a: "Yes. When posting in anonymous mode, your real name and profile are never displayed to peers or faculty. Posts carry a randomized pseudonym and avatar. Anonymity is enforced at the database layer (zero foreign key joins), while our safety system prevents toxic harassment.",
  },
  {
    q: "What is Viewer Mode and who is it for?",
    a: "Viewer Mode is designed for high school students and JEE/NEET/CUET aspirants who want to see authentic campus discussions before choosing a college. You can read threads, follow clubs, and bookmark posts. Posting and interacting unlock once you enroll and verify your university email.",
  },
  {
    q: "What if my college domain isn't recognized yet?",
    a: "We are currently live in pilot testing at BIT Mesra and progressively activating new university hubs based on student demand. You can submit your college domain through our directory request form and our team verifies the registrar domain within 24 hours.",
  },
  {
    q: "Is CampusLoop free for college students?",
    a: "Yes, CampusLoop is 100% free for verified students. There are no subscriptions, ads, or paywalls on reading campus feeds, voting on canteen polls, or downloading peer study notes.",
  },
];

export function LandingFAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  function toggle(idx: number) {
    sounds.tap();
    haptics.light();
    setOpenIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <section className="border-t border-border/40 bg-background py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-4xl space-y-12">
        {/* Section Heading */}
        <Reveal className="space-y-3 text-center max-w-xl mx-auto">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
            {"KNOWLEDGE_BASE // FREQUENTLY_ASKED_QUESTIONS"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Got questions? We&apos;ve got answers.
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know about student verification, privacy guarantees, and campus
            communities.
          </p>
        </Reveal>

        {/* Grok-Style Hairline Accordion */}
        <div className="space-y-2.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <Reveal key={faq.q} delay={i * 0.05}>
                <div className="rounded-xl border border-border/40 bg-card overflow-hidden transition-colors hover:border-border/80">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-foreground">{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-[#1D9BF0]"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
