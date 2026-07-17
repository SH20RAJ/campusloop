import Link from "next/link";
import type { Metadata } from "next";
import { hexclaveServerApp } from "@/hexclave/server";
import { LandingInteractive } from "@/components/ui/landing-interactive";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Sparkles, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "CampusLoop — The Verified Campus Social Layer",
  description:
    "An exclusive, domain-authenticated social network for college students. Share anonymous confessions, participate in campus polls, swipe to match, and earn Loop Points.",
  keywords: [
    "campus social network",
    "college confessions",
    "anonymous posting",
    "student verification",
    "college dating",
    "campus match",
    "Indian colleges"
  ],
  openGraph: {
    title: "CampusLoop — The Verified Campus Social Layer",
    description: "An exclusive, domain-authenticated social network for college students. Confess, match, and chat securely.",
    url: "https://campusloop.space",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop — The Verified Campus Social Layer",
    description: "An exclusive, domain-authenticated social network for college students. Confess, match, and chat securely.",
  },
  robots: { index: true, follow: true },
};

export default async function LandingPage() {
  const user = await hexclaveServerApp.getUser();
  const isAuthenticated = !!user;

  const mockColleges = [
    "IIT Delhi", "BIT Mesra", "BITS Pilani", "NIT Trichy", "Delhi University", 
    "IIT Bombay", "SRM Chennai", "VIT Vellore", "IIT Kharagpur", "RV College"
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CampusLoop",
            applicationCategory: "SocialNetworking",
            operatingSystem: "Web",
            description:
              "Verified student-only campus social network. Share confessions, drop polls, swipe to match across Indian colleges. Gatekept by college email.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          }),
        }}
      />

      <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden">
        {/* Ambient Blur Overlays */}
        <div className="absolute top-[-10%] left-[10%] right-[10%] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-[35%] right-[-15%] h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-15%] h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

        {/* ─── Premium Sticky Navbar ─── */}
        <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md lg:px-12">
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
            {isAuthenticated ? (
              <Link href="/app">
                <button className="rounded-xl bg-primary/10 border border-primary/25 px-4.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer">
                  Go to Feed ↗
                </button>
              </Link>
            ) : (
              <>
                <Link href="/join?mode=signin">
                  <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-2">
                    Sign In
                  </button>
                </Link>
                <Link href="/join?mode=signup">
                  <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
                    Verify Email 🚀
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* ─── Clean Creative Hero ─── */}
        <main className="flex-1 w-full max-w-5xl px-6 pt-32 mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            {/* Live verification count banner */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-[10px] font-bold text-violet-500 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-pulse" /> Domain-Verified Student network Only
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
              Your Campus. <br />
              <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Connected & Hashed.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Ditch the generic socials. Enter the exclusive layer for Indian colleges. 
              Drop anonymous confessions, check local sentiment via polls, swipe to match with verified students, and accumulate Loop Points. 100% email firewalled.
            </p>
          </div>

          {/* Render interactive sandbox widgets deck */}
          <LandingInteractive isAuthenticated={isAuthenticated} />
        </main>

        {/* ─── Infinite Campus Marquee ─── */}
        <section className="py-8 bg-muted/5 border-t border-b border-border/40 select-none overflow-hidden relative mt-16">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="relative flex w-full overflow-x-hidden">
            <div className="flex shrink-0 gap-8 min-w-full justify-around animate-marquee [--duration:25s]">
              {mockColleges.map((uni) => (
                <span key={uni} className="text-[10px] font-bold text-muted-foreground/60 tracking-wider flex items-center gap-2 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-ping" />
                  {uni} Verified
                </span>
              ))}
            </div>
            <div className="flex shrink-0 gap-8 min-w-full justify-around animate-marquee [--duration:25s]" aria-hidden>
              {mockColleges.map((uni) => (
                <span key={uni} className="text-[10px] font-bold text-muted-foreground/60 tracking-wider flex items-center gap-2 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  {uni} Verified
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Sleek Footer ─── */}
        <footer className="border-t border-border/80 bg-muted/15 py-12 px-6 text-center text-xs font-semibold text-muted-foreground space-y-4 mt-16">
          <div className="flex justify-center gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/safety" className="hover:text-foreground transition-colors">Safety Guidelines</Link>
            <Link href="/pitch" className="hover:text-foreground transition-colors">Pitch Deck</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p>© {new Date().getFullYear()} CampusLoop. Made with <Heart className="inline h-3.5 w-3.5 mx-1 text-primary align-middle" fill="currentColor" /> by verified students for the student network.</p>
        </footer>
      </div>
    </>
  );
}
