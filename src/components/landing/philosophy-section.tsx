"use client";

import { CheckCircle2, Lock, MapPin } from "lucide-react";
import {
  LandingContainer,
  LandingSection,
} from "@/components/landing/landing-design-system";

export function PhilosophySection() {
  return (
    <LandingSection id="philosophy" bg="default" className="py-24 sm:py-32">
      <LandingContainer>
        <div className="mx-auto max-w-4xl space-y-12 text-center sm:text-left">
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
              Product Philosophy
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Built for how campus life{" "}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                actually works.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4 text-left border-t border-border/50">
            {/* Principle 1 */}
            <div className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="size-4" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Verified by default.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Trust begins at the perimeter. Everyone you interact with carries an
                active university email, shutting out outsiders, creeps, and spam bots.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Lock className="size-4" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Anonymous when you need it.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                True honesty requires privacy. Speak candidly without fear of
                judgment, faculty repercussions, or social anxiety — backed by
                isolated escrow.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="space-y-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <MapPin className="size-4" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Connected to your real campus.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Social media is disconnected from reality; CampusLoop is hyperlocal.
                The people you talk to share your classrooms, hostels, mess halls, and
                labs.
              </p>
            </div>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
