import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, Lock, EyeOff, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | CampusLoop",
  description: "Learn how CampusLoop protects student data and cryptographic anonymity.",
};

export default function PrivacyPage() {
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
            Privacy <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Privacy is not a feature; it is our foundation. Read how we treat your data, verify your accounts, and separate identities.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <EyeOff className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Cryptographic Separation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When you confess or comment anonymously, we hash the payload and store it separate from your authentication data. There is no relational map connecting your real name or email directly to the posts you publish anonymously.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Strict Access Keys</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Only verified students from the same campus can view local feeds. Outsiders or non-institutional scraper bots are restricted by our worker-level security policies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
              <Key className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-foreground">Account Information</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We store your profile username, custom avatar URL, bio, and points in Drizzle tables. You can update or request deletion of these fields at any time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
