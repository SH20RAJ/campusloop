import { LegalNav } from "@/components/marketing/legal-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import {
  AlertOctagon,
  Flag,
  Heart,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety & Community Standards | CampusLoop",
  description:
    "Community safety guidelines, zero-tolerance anti-ragging protocols under UGC regulations, automated doxxing filters, and student reporting mechanisms.",
  keywords: [
    "Safety Guidelines",
    "Anti-Ragging UGC",
    "CampusLoop Safety",
    "Student Protection",
    "Cyberbullying Prevention",
    "Dating Safety Rules",
    "Emergency Support India",
  ],
  alternates: { canonical: "https://campusloop.space/safety" },
  openGraph: {
    title: "Safety & Community Standards | CampusLoop",
    description: "Learn how CampusLoop protects students with zero-tolerance anti-ragging and AI safety shields.",
    url: "https://campusloop.space/safety",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Safety & Community Standards | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Safety & Community Standards | CampusLoop",
    description: "Learn how CampusLoop protects students with zero-tolerance anti-ragging and AI safety shields.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function SafetyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CampusLoop Safety & Community Standards",
    url: "https://campusloop.space/safety",
    description:
      "Community safety guidelines and anti-ragging protocols under UGC regulations for CampusLoop.",
    publisher: {
      "@type": "Organization",
      name: "CampusLoop Inc.",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
    },
    inLanguage: "en-IN",
    datePublished: "2026-01-01",
    dateModified: "2026-08-28",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-x-hidden select-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />
      <LegalNav />

      {/* Main Content Container (Twitter / X Document Layout) */}
      <main className="flex-1 w-full max-w-4xl px-4 sm:px-6 pt-10 pb-20 mx-auto space-y-8">
        {/* Header Title & Badges */}
        <div className="space-y-3 border-b border-border/40 pb-6">
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="size-4" />
            <span>Community Trust, Safety &amp; Anti-Ragging Protocols</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Safety &amp; Community Standards
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground font-medium">
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
              UGC Anti-Ragging Guidelines 2009
            </span>
            <span>•</span>
            <span>Last Updated: August 28, 2026</span>
            <span>•</span>
            <span>CampusLoop Inc.</span>
          </div>
        </div>

        {/* Quick Jump Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {[
            { id: "#anti-ragging", label: "1. Anti-Ragging Policy" },
            { id: "#doxxing", label: "2. Doxxing Shield" },
            { id: "#moderation", label: "3. Quarantine & Reports" },
            { id: "#dating-safety", label: "4. Campus Match Safety" },
            { id: "#emergency", label: "5. Helplines & SOS" },
          ].map((item) => (
            <a
              key={item.id}
              href={item.id}
              className="rounded-full border border-border/60 bg-card px-3 py-1 font-semibold text-muted-foreground hover:text-foreground hover:border-border transition-colors shrink-0"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Zero-Tolerance Callout */}
        <div id="anti-ragging" className="scroll-mt-28 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-500">
            <AlertOctagon className="size-4" />
            <span>Strict Zero Tolerance for Ragging &amp; Cyberbullying</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            In compliance with the <strong>UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009</strong>, CampusLoop enforces a zero-tolerance policy against digital hazing, intimidation, blackmail, or non-consensual harassment. Violators face immediate permanent ban, forfeiture of Loop Points, and direct escalation to university administration and law enforcement.
          </p>
        </div>

        {/* Section 1: Doxxing Shield */}
        <section id="doxxing" className="space-y-4 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <ShieldAlert className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              1. Automated Doxxing &amp; Personal Info Shield
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            To safeguard students inside and outside hostels, our real-time moderation engine flags or redacts content containing:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">
            <li>10-digit mobile phone numbers or personal WhatsApp chat links.</li>
            <li>Hostel room numbers coupled with student roll numbers or names.</li>
            <li>Personal email addresses or handles used for targeted brigading.</li>
            <li>Unauthorized photographs captured in private hostel spaces without consent.</li>
          </ul>
        </section>

        {/* Section 2: Dual-Layer Moderation */}
        <section id="moderation" className="space-y-4 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Flag className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              2. Dual-Layer Moderation &amp; 3-Flag Escrow
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Every discussion, post, or confession on CampusLoop can be reported by any verified student with 1 tap:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">🚩 3-Flag Instant Quarantine</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Posts receiving 3 independent student reports are automatically hidden from the public campus radius feed pending moderator review.
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">🛡️ Audit Logs &amp; Account Bans</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Moderation decisions are logged cryptographically. Malicious repeat offenders receive temporary timeouts or permanent IP bans.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Campus Match Safety */}
        <section id="dating-safety" className="space-y-4 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <Heart className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              3. Campus Match &amp; Secret Crush Safety
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            CampusLoop Match and Secret Crush are strictly 18+ and restricted to verified peers.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">
            <li><strong>Zero-Doxxing Secret Crush:</strong> Crushes added to your vault remain completely invisible unless there is a mutual double-blind lock.</li>
            <li><strong>Unmatch &amp; Block:</strong> Students can unmatch or block users instantly, preventing further messages or discovery across the platform.</li>
          </ul>
        </section>

        {/* Section 4: Helplines */}
        <section id="emergency" className="space-y-4 scroll-mt-28 rounded-2xl border border-primary/30 bg-card p-6 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs">
            <PhoneCall className="size-4" />
            <span>Emergency Student Helplines (India)</span>
          </div>
          <h2 className="text-lg font-black text-foreground">
            4. Emergency Support &amp; Institutional Contacts
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            If you or a fellow student are experiencing severe distress, harassment, or need immediate assistance:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground">National Anti-Ragging Helpline (UGC):</span>
              <p className="font-mono text-primary font-bold text-sm">1800-180-5522</p>
              <p className="text-[10px] text-muted-foreground">Toll-free 24/7 support across India</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground">KIRAN Mental Health Helpline:</span>
              <p className="font-mono text-primary font-bold text-sm">1800-599-0019</p>
              <p className="text-[10px] text-muted-foreground">Govt. of India psychological counseling</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground">Women Helpline (National):</span>
              <p className="font-mono text-primary font-bold text-sm">1091 / 112</p>
              <p className="text-[10px] text-muted-foreground">Emergency police response</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground">CampusLoop Safety Desk:</span>
              <p className="font-mono text-primary font-bold text-sm">safety@campusloop.space</p>
              <p className="text-[10px] text-muted-foreground">Priority escalation turnaround &lt; 12 hours</p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
