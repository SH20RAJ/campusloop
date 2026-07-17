import Link from "next/link";
import type { Metadata } from "next";
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  MessageCircle, 
  Heart, 
  HelpCircle, 
  Users
} from "lucide-react";
import { hexclaveServerApp } from "@/hexclave/server";
import { LandingInteractive } from "@/components/ui/landing-interactive";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "CampusLoop — Your Verified Campus Social Network",
  description:
    "Join your real campus. Speak freely. Stay safe. CampusLoop is the trusted student-only network. Share anonymous confessions, drop live polls, swipe to match — all gatekept by your college email.",
  keywords: [
    "campus social network",
    "college confessions",
    "anonymous posting app",
    "student community India",
    "college dating",
    "campus polls",
    "verified student network",
    "Indian college students",
    "campus gossip",
    "college matchmaking",
  ],
  openGraph: {
    title: "CampusLoop — Your Verified Campus Social Network",
    description:
      "The verified social layer for your campus. Confess. Poll. Match. All gatekept by college email.",
    url: "https://campusloop.in",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop — Your Verified Campus Social Network",
    description:
      "The verified social layer for your campus. Confess. Poll. Match. All gatekept by college email.",
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
        {/* Glow blur backgrounds */}
        <div className="absolute top-[-10%] left-[5%] right-[5%] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

        {/* ─── Header / Navbar ─── */}
        <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md lg:px-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md shadow-primary/5">
              <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
            </div>
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
              CampusLoop
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle className="border-border/60 bg-background/50" />
            {isAuthenticated ? (
              <Link href="/app">
                <button className="rounded-xl bg-primary/10 border border-primary/25 px-4.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer">
                  Go to Feeds
                </button>
              </Link>
            ) : (
              <>
                <Link href="/join?mode=signin">
                  <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Sign In
                  </button>
                </Link>
                <Link href="/join?mode=signup">
                  <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
                    Join Now
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* ─── Hero Section ─── */}
        <section className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto space-y-6">
          {/* Live Indicator capsule */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-extrabold text-primary uppercase tracking-wider animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Live Vibe Checker Active
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
            Your Campus. <br />
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Uncensored & Connected.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Welcome to the social layer built exclusively for college students. 
            Speak freely via anonymous confessions, vote on local drama, join hobby circles, and swipe to match with verified peers inside your lecture halls.
          </p>

          {/* Render interactive buttons and feed teaser widgets */}
          <LandingInteractive isAuthenticated={isAuthenticated} />
        </section>

        {/* ─── Infinite College Marquee ─── */}
        <section className="py-8 bg-muted/5 border-t border-b border-border/40 select-none overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="relative flex w-full overflow-x-hidden">
            <div className="flex shrink-0 gap-8 min-w-full justify-around animate-marquee [--duration:25s]">
              {mockColleges.map((uni) => (
                <span key={uni} className="text-xs font-bold text-muted-foreground/60 tracking-wider flex items-center gap-2 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-ping" />
                  {uni} Verified
                </span>
              ))}
            </div>
            <div className="flex shrink-0 gap-8 min-w-full justify-around animate-marquee [--duration:25s]" aria-hidden>
              {mockColleges.map((uni) => (
                <span key={uni} className="text-xs font-bold text-muted-foreground/60 tracking-wider flex items-center gap-2 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  {uni} Verified
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Core Pillars Section ─── */}
        <section className="py-24 px-6 max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Built for students. Safe by design.
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl mx-auto">
              Our safety layer scans and protects identities automatically, ensuring your campus experience stays raw but respectful.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-primary/25 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center transition-transform group-hover:scale-105">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-foreground">Anonymous Confessions</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spill the tea or ask genuine, awkward questions. Safe automated keyword screening filters out target doxxing.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-primary/25 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center transition-transform group-hover:scale-105">
                <Heart className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-foreground">Campus Dating Swiper</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Swipe on real profiles at your college. Zero catfishing. Direct encrypted DMs automatically spin up upon a mutual right-swipe.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-primary/25 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-foreground">Interactive Campus Polls</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Launch structured polls. Gauge campus sentiments on classes, canteen menus, or festival updates in seconds.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-primary/25 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center transition-transform group-hover:scale-105">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-foreground">Hobby Communities</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Start or join custom communities. Host game lobbies, study groups, coding clubs, or music jams with absolute ease.
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-primary/25 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-transform group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-foreground">Email Gatekeeping</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Only students with verified .edu or official college domains are allowed in. Outsiders and spammers are blocked by default.
              </p>
            </div>

            {/* Pillar 6 */}
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:border-primary/25 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center transition-transform group-hover:scale-105">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-foreground">Full Privacy Hash</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confessions are cryptographically separated from account info. Speak your heart without leaving trace signatures.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border/80 bg-muted/15 py-12 px-6 text-center text-xs font-semibold text-muted-foreground space-y-4 mt-16">
          <div className="flex justify-center gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/safety" className="hover:text-foreground transition-colors">Safety Guidelines</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p>© {new Date().getFullYear()} CampusLoop. Made with <Heart className="inline h-3.5 w-3.5 mx-1 text-primary align-middle" fill="currentColor" /> by verified students for the student network.</p>
        </footer>
      </div>
    </>
  );
}
