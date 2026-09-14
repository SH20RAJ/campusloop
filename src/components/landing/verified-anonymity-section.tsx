"use client";

import {
  Fingerprint,
  KeyRound,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
  StatusPill,
} from "@/components/landing/landing-design-system";

export function VerifiedAnonymitySection() {
  return (
    <LandingSection id="verified-anonymity" bg="default">
      <LandingContainer>
        <LandingSectionHeader
          badge="Privacy & Accountability"
          headlineMain="Anonymous doesn't have to mean"
          headlineHighlight="unaccountable."
          description="Legacy anonymous apps degrade into toxic trolling because nobody knows who enters. Full-identity networks stifle honesty because students fear faculty backlash. CampusLoop invents cryptographic identity escrow."
          align="center"
        />

        {/* ─── Visual Pipeline Flow (Reference-Grade Flow Diagram) ─── */}
        <div className="rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-white/60 dark:bg-[#0E131F]/60 p-6 sm:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-mono text-xs font-bold">
                  01
                </span>
                <StatusPill status="healthy" label="Gatekeeper" />
              </div>
              <Mail className="size-6 text-blue-600" />
              <h4 className="text-base font-bold text-foreground">Verify Once</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                6-digit OTP sent strictly to your official <code>.ac.in</code> or{" "}
                <code>.edu.in</code> college inbox. No outside bots or creeps.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-mono text-xs font-bold">
                  02
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <UserCheck className="size-6 text-emerald-600" />
              <h4 className="text-base font-bold text-foreground">Verified Student</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You receive a green badge and are automatically routed to your
                campus&apos;s private loop. Faculty cannot track or view.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600 font-mono text-xs font-bold">
                  03
                </span>
                <StatusPill status="live" label="Zero-Leak" />
              </div>
              <KeyRound className="size-6 text-purple-600" />
              <h4 className="text-base font-bold text-foreground">Identity Vault</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Anonymous posts carry no public foreign keys to your profile. The
                link is sealed cryptographically in isolated escrow.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-xl bg-zinc-500/10 text-zinc-600 font-mono text-xs font-bold">
                  04
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Dual State
                </span>
              </div>
              <Fingerprint className="size-6 text-blue-600" />
              <h4 className="text-base font-bold text-foreground">Speak Freely</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Switch between real name and anonymous with one tap. Bad actors are
                banned without exposing honest students.
              </p>
            </div>
          </div>

          {/* Bottom Security Assurance Summary */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
              <span>
                <strong>Zero Doxxing Architecture:</strong> Even in the event of a
                database query dump, anonymous confessions are mathematically
                disconnected from your student name and email.
              </span>
            </div>
            <span className="shrink-0 font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
              SHA-256 HMAC ESCROW
            </span>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
