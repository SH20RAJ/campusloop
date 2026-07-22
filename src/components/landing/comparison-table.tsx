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
    feature: "Automatic PII Scrubbing (Phone/Email Stripped)",
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
    feature: "Zero Catfish, Bots, or Creepy Alumni",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
  {
    feature: "Canteen Polls & Hostel Community Hubs",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
  {
    feature: "Gamified Loop Points & Campus Leaderboard",
    campusloop: true,
    reddit: false,
    instagram: false,
    datingApps: false,
  },
];

export function ComparisonShowcase() {
  return (
    <section className="border-t border-border/60 bg-muted/10 py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="size-3.5 text-primary" />
            Built Different
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Why students choose CampusLoop.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Because Reddit is full of random uncles and Instagram is way too fake.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                  <th className="p-4 w-2/5 font-bold text-foreground">Features & Guardrails</th>
                  <th className="p-4 text-center bg-primary/10 text-primary font-bold w-1/5 border-x border-primary/20">
                    <div className="flex items-center justify-center gap-1">
                      <ShieldCheck className="size-4" /> CampusLoop
                    </div>
                  </th>
                  <th className="p-4 text-center w-1/5">Reddit / Forums</th>
                  <th className="p-4 text-center w-1/5">Insta / Tinder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {COMPARISONS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-foreground font-semibold">
                      {row.feature}
                    </td>

                    {/* CampusLoop Column */}
                    <td className="p-4 text-center bg-primary/[0.03] border-x border-primary/10 font-bold">
                      <div className="flex justify-center">
                        <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                          <Check className="size-3.5" />
                        </span>
                      </div>
                    </td>

                    {/* Reddit Column */}
                    <td className="p-4 text-center text-muted-foreground">
                      <div className="flex justify-center">
                        {row.reddit ? (
                          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <Check className="size-3.5" />
                          </span>
                        ) : (
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                            <X className="size-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Instagram/Tinder Column */}
                    <td className="p-4 text-center text-muted-foreground">
                      <div className="flex justify-center">
                        {row.datingApps ? (
                          <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <Check className="size-3.5" />
                          </span>
                        ) : (
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40">
                            <X className="size-3.5" />
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
