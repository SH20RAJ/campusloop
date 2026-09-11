"use client";

import { Lock, MailCheck, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/landing/reveal";

const PHONE_RE = /\b\d{10}\b/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function VerifiedIdentitySection() {
  const [inputText, setInputText] = useState(
    "Lost my calculator near CAT Hall. Call 9876543210 or mail senior@bitmesra.ac.in!"
  );

  const scrubbedText = inputText.replace(PHONE_RE, "[PHONE_REDACTED]").replace(EMAIL_RE, "[EMAIL_REDACTED]");
  const hadPii = scrubbedText !== inputText;

  return (
    <section className="border-t border-border/40 py-20 sm:py-28 px-4 sm:px-6 bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Section Heading */}
        <Reveal className="space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
            {"IDENTITY_ARCHITECTURE // ACCOUNTABLE_ANONYMITY"}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
            Verified at the door.
            <br />
            <span className="text-[#1D9BF0]">Anonymous when you need it.</span>
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            Most social apps force an all-or-nothing choice between complete surveillance and toxic anonymity.
            CampusLoop combines institutional student verification with cryptographic privacy.
          </p>
        </Reveal>

        {/* 4-Step Verification Protocol Architecture */}
        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Cryptographic Identity Pipeline
              </span>
              <span className="font-mono text-[11px] text-[#1D9BF0] font-bold">
                OTP → ENROLLMENT_CHECK → ISOLATED_RADIUS → AES_SEAL
              </span>
            </div>

            {/* Steps Flow Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                  <MailCheck className="size-4.5" />
                </div>
                <div className="font-bold text-sm text-foreground">01. College Email</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Institutional address (.ac.in / .edu.in) verified with a single-use OTP.
                </p>
                <span className="inline-block font-mono text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Gatekept at Entry
                </span>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                  <UserCheck className="size-4.5" />
                </div>
                <div className="font-bold text-sm text-foreground">02. Verified Hub</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mapped exclusively to your campus radius. Zero outsiders or bots.
                </p>
                <span className="inline-block font-mono text-[10px] text-[#1D9BF0] font-bold bg-[#1D9BF0]/10 px-2 py-0.5 rounded-full">
                  Zero Outsiders
                </span>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-[#1D9BF0]/30 bg-[#1D9BF0]/5 p-4 space-y-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#1D9BF0]/15 text-[#1D9BF0] border border-[#1D9BF0]/30">
                  <Users className="size-4.5" />
                </div>
                <div className="font-bold text-sm text-foreground">03. Dual Persona</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Toggle between Real Profile (Clubs &amp; Match) or Anonymous (Confessions &amp; Polls).
                </p>
                <span className="inline-block font-mono text-[10px] text-[#1D9BF0] font-bold bg-[#1D9BF0]/15 px-2 py-0.5 rounded-full">
                  Contextual Switcher
                </span>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div className="font-bold text-sm text-foreground">04. Safety Escrow</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Peers never see author identity. Abusive actors face real strikes and campus bans.
                </p>
                <span className="inline-block font-mono text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Accountable Shield
                </span>
              </div>
            </div>

            {/* Interactive Micro-Artifact: Live PII-Scrubber Sandbox */}
            <div className="pt-2 border-t border-border/40">
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-[#1D9BF0]" />
                    <span className="font-mono text-xs font-bold text-foreground">
                      LIVE ARTIFACT: AUTOMATIC CLIENT-SIDE PII SCRUBBER
                    </span>
                  </div>
                  {hadPii && (
                    <span className="font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      ✓ PII Intercepted &amp; Neutralized
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="pii-input"
                      className="font-mono text-[10px] font-semibold text-muted-foreground uppercase"
                    >
                      Raw Student Input (Try editing)
                    </label>
                    <textarea
                      id="pii-input"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      rows={2}
                      className="w-full bg-background border border-border/60 rounded-lg p-2.5 text-xs text-foreground font-mono focus:border-[#1D9BF0] outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase">
                      Sealed Post Payload (What reaches peers)
                    </span>
                    <div className="w-full bg-background/50 border border-border/40 rounded-lg p-2.5 text-xs font-mono text-foreground/90 min-h-[58px]">
                      {scrubbedText}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Pillar Guarantees */}
            <div className="grid gap-6 md:grid-cols-3 pt-2 border-t border-border/40">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#1D9BF0]">01</span>
                  <h4 className="font-bold text-sm text-foreground">One-Time Verification</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verify once with your student domain for uninterrupted access. No recurring daily checks or
                  annoying re-logins.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#1D9BF0]">02</span>
                  <h4 className="font-bold text-sm text-foreground">Zero Author Foreign Keys</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anonymous posts store no user ID relation in the database timeline row. No SQL query can
                  join the post back to you.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#1D9BF0]">03</span>
                  <h4 className="font-bold text-sm text-foreground">Safety System Accountability</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Peers never see your identity, but the platform safety system guarantees bad actors and
                  harassers face real campus strikes.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
