import { MarketingFooter,MarketingHeader } from "@/components/marketing/system";
import { AlertOctagon,ArrowLeft,Flag,Heart,PhoneCall,ShieldAlert,ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
    dateModified: "2026-08-24",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl px-4 sm:px-6 pt-28 pb-16 mx-auto space-y-10">
        <div className="space-y-4 text-center sm:text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="size-4" /> Zero-Tolerance Campus Safety
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Safety &amp; Community <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Standards</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
            CampusLoop was created to celebrate campus voice, camaraderie, and student empowerment — not fear, intimidation, or harm. Here is how we ensure a secure, respectful digital campus for all.
          </p>
        </div>

        {/* Highlight Notice */}
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-500">
            <AlertOctagon className="size-4" /> Strict Zero Tolerance for Ragging &amp; Cyberbullying
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            In compliance with the <strong>UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009</strong>, CampusLoop maintains a strict zero-tolerance policy against any form of ragging, digital hazing, intimidation, extortion, or non-consensual harassment. Violations lead to immediate permanent ban and direct escalation to college disciplinary authorities and law enforcement.
          </p>
        </div>

        {/* Safety Pillars */}
        <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {/* Pillar 1 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <ShieldAlert className="size-5 text-rose-500" /> 1. Automated Doxxing &amp; Personal Info Shield
            </h2>
            <p>
              To protect student privacy, our real-time edge filter automatically blocks or flags posts and confessions that contain:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-foreground/80">
              <li>10-digit mobile phone numbers or WhatsApp contact links.</li>
              <li>Hostel room numbers combined with student names.</li>
              <li>Personal email addresses or social handles used for targeted brigading.</li>
              <li>Unauthorized photos of individuals taken in private spaces without consent.</li>
            </ul>
          </section>

          {/* Pillar 2 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Flag className="size-5 text-amber-500" /> 2. Dual-Layer Moderation &amp; Community Flags
            </h2>
            <p>
              Every post and comment on CampusLoop can be reported in 1 click.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">🚩 5-Flag Auto Quarantine</span>
                <p className="text-[11px] text-muted-foreground">
                  If a post accumulates 5 independent student flags, it is instantly hidden from the campus feed pending manual admin review.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">🛡️ Admin &amp; Moderator Audit</span>
                <p className="text-[11px] text-muted-foreground">
                  Our 24/7 moderation console reviews flagged items, bans repeat offenders, and resets malicious or defamatory submissions.
                </p>
              </div>
            </div>
          </section>

          {/* Pillar 3 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Heart className="size-5 text-pink-500" /> 3. Campus Dating &amp; Match Safety
            </h2>
            <p>
              Connecting with peers should always be safe, consensual, and enjoyable:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-foreground/80">
              <li>Only verified college students appear in the Campus Dating deck.</li>
              <li>Direct messaging is enabled only after a mutual match is formed.</li>
              <li>You can unmatch or report any user inside the chat with one tap to immediately block future contact.</li>
            </ul>
          </section>

          {/* Pillar 4 - Emergency Helplines */}
          <section className="space-y-4 rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs">
              <PhoneCall className="size-4" /> Emergency Helplines &amp; Rapid Assistance (India)
            </div>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              4. National Crisis &amp; Support Resources
            </h2>
            <p className="text-xs">
              If you or someone you know is in distress or facing immediate danger, please reach out to the following official resources:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                <span className="font-black text-foreground text-xs block">UGC National Anti-Ragging Helpline</span>
                <p className="text-[11px] text-muted-foreground">Toll-Free: <strong>1800-180-5522</strong> (24x7 Helpline)</p>
                <p className="text-[11px] text-muted-foreground">Email: <a href="mailto:helpline@antiragging.in" className="text-primary hover:underline font-bold">helpline@antiragging.in</a></p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                <span className="font-black text-foreground text-xs block">National Cyber Crime Reporting Portal</span>
                <p className="text-[11px] text-muted-foreground">Helpline: <strong>1930</strong> (Cyber Financial &amp; General Crime)</p>
                <p className="text-[11px] text-muted-foreground">Portal: <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">cybercrime.gov.in</a></p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                <span className="font-black text-foreground text-xs block">KIRAN Mental Health Support (Govt of India)</span>
                <p className="text-[11px] text-muted-foreground">Toll-Free: <strong>1800-599-0019</strong> (24x7 Support)</p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                <span className="font-black text-foreground text-xs block">CampusLoop Safety Escalation Desk</span>
                <p className="text-[11px] text-muted-foreground">Emergency Safety: <a href="mailto:safety@campusloop.space" className="text-primary hover:underline font-bold">safety@campusloop.space</a></p>
                <p className="text-[11px] text-muted-foreground">Turnaround: Priority Review within 6 hours</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
