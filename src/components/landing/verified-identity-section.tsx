import { MailCheck, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

export function VerifiedIdentitySection() {
  return (
    <section className="border-t border-border/60 py-24 px-4 sm:px-6 bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-16">
        {/* Section Heading */}
        <Reveal className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The Core Differentiator</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Verified at the door.
            <br />
            <span className="text-primary">Anonymous when you need it.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Most social apps force an all-or-nothing choice between complete surveillance and toxic anonymity.
            CampusLoop combines institutional student verification with context-aware privacy.
          </p>
        </Reveal>

        {/* Visual Architecture Diagram */}
        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg space-y-8">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                CampusLoop Privacy &amp; Trust Model
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                Anonymous to the campus. Accountable to the safety system.
              </h3>
            </div>

            {/* Architecture Steps Flow */}
            <div className="grid gap-4 md:grid-cols-4 items-center">
              {/* Step 1 */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center space-y-2.5">
                <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <MailCheck className="size-5" />
                </div>
                <div className="font-bold text-sm text-foreground">College Email</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Institutional address (.ac.in / .edu.in) verified via OTP
                </p>
                <span className="inline-block text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Gatekept at Entry
                </span>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center space-y-2.5">
                <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <UserCheck className="size-5" />
                </div>
                <div className="font-bold text-sm text-foreground">Verified Student</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Assigned exclusively to your registered campus community
                </p>
                <span className="inline-block text-[10px] font-mono text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Zero Outsiders
                </span>
              </div>

              {/* Step 3: Dual Identity Choice */}
              <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-5 text-center space-y-2.5 shadow-sm">
                <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                  <Users className="size-5" />
                </div>
                <div className="font-bold text-sm text-foreground">Contextual Identity</div>
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-foreground">Real Name (Clubs &amp; Match)</div>
                  <div className="text-muted-foreground">or Anonymous (Confessions &amp; Polls)</div>
                </div>
                <span className="inline-block text-[10px] font-mono text-primary font-bold bg-primary/15 px-2 py-0.5 rounded-full">
                  Student Switcher
                </span>
              </div>

              {/* Step 4: Safety Vault */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center space-y-2.5">
                <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="font-bold text-sm text-foreground">Safety Vault</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Harassment or illegal activity traces to account strike, not public exposure
                </p>
                <span className="inline-block text-[10px] font-mono text-purple-500 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Accountable Safety
                </span>
              </div>
            </div>

            {/* 3 Detail Cards */}
            <div className="grid gap-6 md:grid-cols-3 pt-6 border-t border-border/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-primary">01</span>
                  <h4 className="font-bold text-sm text-foreground">Verify once at the door</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  One-time verification through your college domain grants lifetime student access. No
                  recurring passwords or cumbersome daily checks.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-primary">02</span>
                  <h4 className="font-bold text-sm text-foreground">Choose your persona</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Toggle seamlessly between your real student profile for clubs, study groups, and
                  matchmaking, and an anonymous avatar for candid feedback and confessions.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-primary">03</span>
                  <h4 className="font-bold text-sm text-foreground">Stay mutually accountable</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Peers never see who wrote an anonymous post, but the platform safety system ensures abusive
                  bad actors face real campus bans, keeping discussions clean.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
