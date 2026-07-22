"use client";

import { Check, X, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "./reveal";

const COMPARISONS = [
  {
    feature: "Verified Student-Only Access (Email OTP)",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
  {
    feature: "Cryptographic Anonymous Confessions",
    campusloop: true,
    reddit: true,
    instagram: false,
    datingApps: false,
  },
  {
    feature: "Automatic PII Scrubbing (Phone/Email Stripper)",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
  {
    feature: "Verified Campus Matchmaking & Chat",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: true,
  },
  {
    feature: "Zero Catfish or Fake Profiles",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
  {
    feature: "Dedicated Canteen Polls & Community Hubs",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
  {
    feature: "Gamified Loop Points & Campus Leaderboards",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
];

export function ComparisonShowcase() {
  return (
    <section className="border-t border-border/60 bg-muted/10 py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5 text-primary" />
            Built Different
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Why students choose CampusLoop.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            See how CampusLoop stacks up against public social networks and generic dating apps.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xl">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="p-4 md:p-5 w-2/5">Features & Guardrails</th>
                  <th className="p-4 md:p-5 text-center bg-primary/10 text-primary font-black w-1/5 border-x border-primary/20">
                    <div className="flex items-center justify-center gap-1">
                      <ShieldCheck className="size-4" /> CampusLoop
                    </div>
                  </th>
                  <th className="p-4 md:p-5 text-center w-1/5">Reddit / Forums</th>
                  <th className="p-4 md:p-5 text-center w-1/5">Insta / Tinder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {COMPARISONS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 md:p-5 text-foreground font-semibold flex items-center gap-2">
                      {row.feature}
                    </td>

                    {/* CampusLoop Column */}
                    <td className="p-4 md:p-5 text-center bg-primary/[0.04] border-x border-primary/10 font-bold">
                      <div className="flex justify-center">
                        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                          <Check className="size-4" />
                        </span>
                      </div>
                    </td>

                    {/* Reddit Column */}
                    <td className="p-4 md:p-5 text-center text-muted-foreground">
                      <div className="flex justify-center">
                        {row.reddit ? (
                          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <Check className="size-4" />
                          </span>
                        ) : (
                          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                            <X className="size-4" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Instagram/Tinder Column */}
                    <td className="p-4 md:p-5 text-center text-muted-foreground">
                      <div className="flex justify-center">
                        {row.datingApps ? (
                          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <Check className="size-4" />
                          </span>
                        ) : (
                          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                            <X className="size-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
