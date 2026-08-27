import { LegalNav } from "@/components/marketing/legal-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import {
  AlertTriangle,
  Ban,
  FileText,
  Mail,
  MapPin,
  Scale,
  Shield,
  UserCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CampusLoop",
  description:
    "Terms of Service, Intermediary Guidelines under Rule 3(1) of Information Technology Rules 2021, and user agreement for CampusLoop.",
  keywords: [
    "Terms of Service",
    "CampusLoop Terms",
    "User Agreement",
    "IT Rules 2021",
    "Intermediary Guidelines",
    "Student Social Network Terms",
    "Grievance Officer India",
  ],
  alternates: { canonical: "https://campusloop.space/terms" },
  openGraph: {
    title: "Terms of Service | CampusLoop",
    description: "Terms of Service, Intermediary Guidelines, and user agreement for CampusLoop.",
    url: "https://campusloop.space/terms",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Terms of Service | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | CampusLoop",
    description: "Terms of Service, Intermediary Guidelines, and user agreement for CampusLoop.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CampusLoop Terms of Service & Intermediary Guidelines",
    url: "https://campusloop.space/terms",
    description:
      "Terms of Service, Intermediary Guidelines under Information Technology Act 2000 and IT Rules 2021 for CampusLoop.",
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
            <Scale className="size-4" />
            <span>Legal Agreement &amp; Intermediary Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Terms of Service
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground font-medium">
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
              Rule 3(1) IT Rules 2021 Compliant
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
            { id: "#eligibility", label: "1. Eligibility" },
            { id: "#prohibited", label: "2. Prohibited Content" },
            { id: "#anonymity", label: "3. Responsible Anonymity" },
            { id: "#moderation", label: "4. Moderation & Takendowns" },
            { id: "#grievance", label: "5. Grievance Redressal" },
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

        {/* Binding Notice Box */}
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
            <Shield className="size-4" />
            <span>Binding Legal Contract</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            By signing up, logging in, or using CampusLoop (&quot;Platform&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service, Privacy Policy, and Community Safety Guidelines.
          </p>
        </div>

        {/* Section 1 */}
        <section id="eligibility" className="space-y-4 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCheck className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              1. Eligibility &amp; Institutional Verification
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            CampusLoop is an exclusive network for verified college students, alumni, and campus community members in India:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">
            <li><strong>Official Email Gating:</strong> Full participation in campus radius feeds, marketplace, crush vaults, and confessions requires verifying an active college domain address (<code className="text-primary font-mono">.ac.in</code>, <code className="text-primary font-mono">.edu</code>).</li>
            <li><strong>Viewer Mode:</strong> Prospective students, JEE/NEET aspirants, and visitors may access public college hubs in read-only mode without voting or publishing privileges.</li>
            <li><strong>Single Student Account:</strong> Users are prohibited from creating fraudulent bots, spoofing identity tokens, or attempting to compromise institutional boundaries.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section id="prohibited" className="space-y-4 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Ban className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              2. Prohibited Content &amp; Intermediary Guidelines (Rule 3(1)(b), IT Rules 2021)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Under Rule 3(1)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, users shall not host, upload, modify, publish, or transmit any content that:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">🚫 Doxxing &amp; Non-Consensual PII</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Leaking phone numbers, hostel room numbers, roll numbers, or personal contact info of any student, faculty, or staff.
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">🚫 Harassment &amp; Defamation</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Targeted abuse, bullying, defamation, threats of violence, or hate speech targeting any person or community.
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">🚫 Non-Consensual Imagery</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Explicit adult content, non-consensual media, or content violating Section 67/67A of the Information Technology Act.
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">🚫 Fraud &amp; Academic Cheating</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Selling exam paper leaks, running impersonation scams, or executing phishing schemes targeting students.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section id="anonymity" className="space-y-3 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Shield className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              3. Responsible Anonymity
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Anonymity on CampusLoop is a tool for safe campus expression, feedback on campus infrastructure, and asking sensitive questions. Anonymity is not a license for illegality. CampusLoop reserves the right under Indian law to suspend accounts that attempt severe targeted harassment.
          </p>
        </section>

        {/* Section 4 */}
        <section id="moderation" className="space-y-3 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              4. Content Moderation &amp; Takedown Procedure
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Content flagged with 3+ reports automatically enters moderation escrow. Our automated safety algorithms and campus moderators review reports within 24 hours under Rule 3(2) of the Information Technology Rules 2021.
          </p>
        </section>

        {/* Section 5: Grievance Redressal */}
        <section id="grievance" className="space-y-4 scroll-mt-28 rounded-2xl border border-primary/30 bg-card p-6 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs">
            <Mail className="size-4" />
            <span>Designated Grievance Redressal Mechanism</span>
          </div>
          <h2 className="text-lg font-black text-foreground">
            5. Grievance Officer Contact Details
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
          </p>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Officer Name:</span>
              <span className="font-bold text-foreground">Grievance &amp; Compliance Officer</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Email:</span>
              <a href="mailto:grievance@campusloop.space" className="font-bold text-primary hover:underline">
                grievance@campusloop.space
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Address:</span>
              <span className="font-bold text-foreground">CampusLoop Inc., Ranchi / Bengaluru, India</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Acknowledgment SLA:</span>
              <span className="font-bold text-foreground">Within 24 hours of receipt</span>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
