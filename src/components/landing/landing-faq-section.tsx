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
    a: "You enter your official university email (e.g. your_roll@bitmesra.ac.in). We dispatch a single-use 6-digit OTP to your college inbox. Once entered, your enrollment is verified without sharing any institutional passwords.",
  },
  {
    q: "Is my anonymity safe from professors, HODs, and classmates?",
    a: "Yes. When posting in anonymous mode, your real name and profile are never displayed to peers or faculty. Your posts carry a randomized avatar and handle. Anonymity is shielded publicly, while our safety system prevents toxic abuse or harassment.",
  },
  {
    q: "What is Viewer Mode and who is it for?",
    a: "Viewer Mode is designed for high school students and JEE/NEET/CUET aspirants who want to see what authentic campus life looks like before deciding on a college. You can read threads, follow clubs, and bookmark posts. Posting and interacting unlock once you enroll and verify your college email.",
  },
  {
    q: "What if my college domain isn't recognized yet?",
    a: "We are currently live in pilot testing at BIT Mesra and progressively activating new university hubs based on student demand. You can submit your college domain through our directory request form and we will verify the registrar domain.",
  },
  {
    q: "Is CampusLoop free for college students?",
    a: "Yes, CampusLoop is 100% free for verified students. There are no subscriptions or paywalls on reading campus feeds, voting on canteen polls, or downloading university study notes.",
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
    <section className="border-t border-border/60 bg-background py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-4xl space-y-12">
        {/* Section Heading */}
        <Reveal className="max-w-xl mx-auto text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Frequently Asked Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Got questions? We&apos;ve got answers.
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know about college verification, privacy, and campus communities.
          </p>
        </Reveal>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <Reveal key={faq.q} delay={i * 0.05}>
                <div className="rounded-2xl border border-border/80 bg-card transition-all overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-heading text-sm sm:text-base font-bold text-foreground">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
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
