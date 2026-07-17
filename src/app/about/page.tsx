import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, School, ShieldCheck, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | CampusLoop",
  description: "Learn more about the verified social network built exclusively for college students.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-12">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/join">
            <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
              Join CampusLoop
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl px-6 pt-28 mx-auto space-y-8">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            About <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">CampusLoop</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            CampusLoop is the social Layer built exclusively for college students. We believe campus life should be connected, authentic, and fun, while ensuring safety and privacy.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <School className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Verified Student Communities</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By restricting access to official college email domains (e.g. `.edu`, `.ac.in`), we ensure every member is a verified student. No spammers, no corporate recruiters, no outsiders.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Privacy & Anonymity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your verification email is strictly hashed. Our cryptographic model ensures that anonymous confessions and posts can never be reverse-mapped back to your real-world identity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Interactive Matches</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Meet verified classmates in a safe, swipe-to-match dating platform. Start conversations only after a mutual interest check to keep chats safe and clean.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-6">
          <p className="text-[11px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-primary fill-primary" /> by verified students for the student network.
          </p>
        </div>
      </main>
    </div>
  );
}
