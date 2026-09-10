import { ArrowRight, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

interface FinalCTASectionProps {
  isAuthenticated: boolean;
}

export function FinalCTASection({ isAuthenticated }: FinalCTASectionProps) {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-8 sm:p-14 text-center shadow-xl space-y-8">
            {/* Ambient Background Gradient Glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

            <div className="max-w-xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="size-3.5" />
                <span>Verified Student Network</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                Your campus is waiting.
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Join the verified student network built for real campus life. Connect with classmates, speak
                freely, and never miss what happens in your university.
              </p>
            </div>

            {/* Dual CTA Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  href="/app"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-primary hover:bg-primary/90 px-8 text-sm sm:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-98"
                >
                  <span>Open Campus Feed</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              ) : (
                <Link
                  href="/handler/sign-up"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-primary hover:bg-primary/90 px-8 text-sm sm:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-98"
                >
                  <span>Get verified with college email</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              )}

              <Link
                href="/colleges"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border bg-muted/60 hover:bg-muted px-6 text-sm sm:text-base font-bold text-foreground transition-all active:scale-98"
              >
                <Compass className="mr-2 size-4 text-primary" />
                <span>Not in college yet? Explore CampusLoop</span>
              </Link>
            </div>

            {/* Credible Footer Attribution */}
            <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground font-medium">
              <span>Built at BIT Mesra · Ranchi, India</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
