"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { FAQ_CONTENT } from "@/constants/landing";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export function LandingFAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  function toggle(idx: number) {
    sounds.tap();
    haptics.light();
    setOpenIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <LandingSection bg="default">
      <LandingContainer className="max-w-4xl">
        {/* Section Heading */}
        <LandingSectionHeader
          eyebrow={FAQ_CONTENT.eyebrow}
          headlineMain={FAQ_CONTENT.headline}
          description={FAQ_CONTENT.subheadline}
          align="center"
        />

        {/* Hairline Accordion */}
        <div className="space-y-2.5">
          {FAQ_CONTENT.faqs.map((faq, i) => {
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
      </LandingContainer>
    </LandingSection>
  );
}
