"use client";

import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HeroMockup } from "@/components/landing/hero-mockup";
import { LandingBadge } from "@/components/landing/landing-design-system";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

const POPULAR_DOMAINS: Record<string, string> = {
  "bitmesra.ac.in": "BIT Mesra (Main Campus)",
  "iitd.ac.in": "IIT Delhi",
  "iitb.ac.in": "IIT Bombay",
  "iitm.ac.in": "IIT Madras",
  "iitkgp.ac.in": "IIT Kharagpur",
  "iitr.ac.in": "IIT Roorkee",
  "iitk.ac.in": "IIT Kanpur",
  "iitg.ac.in": "IIT Guwahati",
  "bits-pilani.ac.in": "BITS Pilani",
  "nitt.edu": "NIT Trichy",
  "nitk.edu.in": "NIT Surathkal",
  "du.ac.in": "Delhi University",
  "vit.ac.in": "VIT Vellore",
  "thapar.edu": "Thapar University",
  "manipal.edu": "Manipal Academy (MAHE)",
  "dtu.ac.in": "Delhi Technological University (DTU)",
  "nsut.ac.in": "Netaji Subhas University of Technology",
};

export function HeroSection({ isAuthenticated = false }: HeroSectionProps) {
  const [emailInput, setEmailInput] = useState("");
  const [checkResult, setCheckResult] = useState<{
    tested: boolean;
    valid: boolean;
    name?: string;
    domain?: string;
  }>({ tested: false, valid: false });

  const handleCheckEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const domainMatch = cleanEmail.split("@")[1];

    if (!domainMatch) {
      setCheckResult({ tested: true, valid: false });
      return;
    }

    if (POPULAR_DOMAINS[domainMatch]) {
      setCheckResult({
        tested: true,
        valid: true,
        name: POPULAR_DOMAINS[domainMatch],
        domain: domainMatch,
      });
      return;
    }

    // Generic rule: ends with .ac.in or .edu.in or .edu
    if (
      domainMatch.endsWith(".ac.in") ||
      domainMatch.endsWith(".edu.in") ||
      domainMatch.endsWith(".edu")
    ) {
      const parts = domainMatch.split(".");
      const inferredName = parts[0].toUpperCase() + " Campus";
      setCheckResult({
        tested: true,
        valid: true,
        name: inferredName,
        domain: domainMatch,
      });
      return;
    }

    setCheckResult({
      tested: true,
      valid: false,
      domain: domainMatch,
    });
  };

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-x-clip">
      {/* ─── Subtle Radial Background Glow ─── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-radial from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* ─── Hero Editorial Copy ─── */}
        <div className="mx-auto max-w-4xl text-center space-y-6">
          {/* Badge */}
          <div className="flex justify-center">
            <LandingBadge variant="default" dot>
              100% Student-Only Network • Zero Outsiders
            </LandingBadge>
          </div>

          {/* Huge Editorial Display Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight text-foreground leading-[1.06]">
            Your campus has a{" "}
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              social layer
            </span>{" "}
            now.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-normal">
            Drop confessions anonymously, vote on live polls, trade dorm gear, and
            find study circles. Strictly for verified college students with an
            institutional email.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link
                href="/app"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full px-7 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all hover:shadow-[0_4px_20px_rgba(0,145,255,0.35)]"
                )}
              >
                Go to Campus Feed <ArrowRight className="ml-2 size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full px-7 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all hover:shadow-[0_4px_20px_rgba(0,145,255,0.35)]"
                )}
              >
                Join your campus <ArrowRight className="ml-2 size-4" />
              </Link>
            )}

            <Link
              href="#ecosystem"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full px-7 border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-card/80 font-semibold text-foreground hover:bg-muted/60"
              )}
            >
              Explore CampusLoop
            </Link>
          </div>

          {/* Trust Statement */}
          <div className="flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              College email verified
            </span>
            <span>•</span>
            <span>Students only</span>
            <span>•</span>
            <span>100% free forever</span>
          </div>

          {/* ─── Interactive Domain Eligibility Verification Bar ─── */}
          <div className="mx-auto max-w-xl pt-4">
            <form
              onSubmit={handleCheckEligibility}
              className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full border border-zinc-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0E131F]/90 p-2 shadow-xs backdrop-blur-md"
            >
              <div className="flex w-full flex-1 items-center gap-2 px-3">
                <Mail className="size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@yourcollege.ac.in"
                  className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 rounded-xl sm:rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 text-xs font-bold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Check Campus Eligibility
              </button>
            </form>

            {/* Instant Validation Feedback */}
            {checkResult.tested && (
              <div className="mt-3 rounded-2xl border p-3.5 text-xs transition-all animate-in fade-in zoom-in-95">
                {checkResult.valid ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-left border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      <span>
                        <strong>Verified!</strong> {checkResult.name} is supported. Enter
                        your email to get a 6-digit OTP.
                      </span>
                    </div>
                    <Link
                      href={`/handler/sign-up?email=${encodeURIComponent(emailInput)}`}
                      className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700"
                    >
                      Get OTP &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-left border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="size-4 text-amber-500 shrink-0" />
                      <span>
                        Campus hub not active yet? Click to request your college and apply
                        for campus lead.
                      </span>
                    </div>
                    <Link
                      href="/colleges"
                      className="shrink-0 rounded-full bg-amber-600 px-3 py-1 font-bold text-white hover:bg-amber-700"
                    >
                      Request Hub &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Hero Product UI Mockup (The Visual Benchmark) ─── */}
        <div id="features" className="pt-4 scroll-mt-28">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
