import { LegalNav } from "@/components/marketing/legal-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import {
  Database,
  EyeOff,
  Key,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CampusLoop",
  description:
    "Learn how CampusLoop protects student data, cryptographic anonymity, and complies with the Digital Personal Data Protection Act (DPDP Act 2023) and IT Act 2000.",
  keywords: [
    "Privacy Policy",
    "CampusLoop Privacy",
    "DPDP Act 2023",
    "Data Principal Rights",
    "Student Data Protection",
    "Anonymous Cryptography",
    "Data Protection Officer India",
  ],
  alternates: { canonical: "https://campusloop.space/privacy" },
  openGraph: {
    title: "Privacy Policy | CampusLoop",
    description: "Learn how CampusLoop protects student data and cryptographic anonymity.",
    url: "https://campusloop.space/privacy",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Privacy Policy | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | CampusLoop",
    description: "Learn how CampusLoop protects student data and cryptographic anonymity.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CampusLoop Privacy Policy",
    url: "https://campusloop.space/privacy",
    description:
      "Privacy Policy of CampusLoop detailing data handling, cryptographic anonymity, and compliance with the Digital Personal Data Protection Act 2023.",
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
        {/* Header Header & Badge */}
        <div className="space-y-3 border-b border-border/40 pb-6">
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="size-4" />
            <span>Data Protection &amp; Confidentiality Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground font-medium">
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
              DPDP Act 2023 Compliant
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
            { id: "#data", label: "1. Data We Collect" },
            { id: "#anon", label: "2. Cryptographic Anonymity" },
            { id: "#rights", label: "3. Data Principal Rights" },
            { id: "#security", label: "4. Security & Storage" },
            { id: "#dpo", label: "5. Grievance & DPO" },
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

        {/* Core Architecture Callout */}
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
            <Lock className="size-4" />
            <span>Privacy-By-Design Architecture</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            At CampusLoop, privacy is not a decorative policy; it is our foundation. We enforce verified college email gating while guaranteeing that anonymous student discourse and confessions cannot be linked back to individual student records by unauthorized parties.
          </p>
        </div>

        {/* Section 1 */}
        <section id="data" className="space-y-4 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Database className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              1. Data We Collect (Data Fiduciary Notice)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Under Section 5 of the Digital Personal Data Protection Act, 2023, we collect only the minimal data strictly necessary to deliver verified, safe campus networking:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">📧 College Email ID</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Used solely to verify affiliation with an accredited college domain (e.g. <code className="text-primary font-mono">.ac.in</code>, <code className="text-primary font-mono">.edu</code>). Never sold or rented to commercial third parties.
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">👤 Student Profile Data</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Display name, username, department, branch, graduating batch, bio, and optional profile picture/banner uploaded by you.
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">💬 User Content &amp; Polls</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Campus posts, votes, poll responses, comment threads, dating preferences, and community discussions published on the platform.
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 space-y-1">
              <span className="font-extrabold text-foreground text-xs block">🛡️ Security Telemetry</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Hashed session tokens, IP rate-limiting signatures, and DDoS telemetry processed via Cloudflare Workers edge nodes.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section id="anon" className="space-y-3 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <EyeOff className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              2. Cryptographic Anonymity Separation
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            When you publish a post or confession under <strong>Anonymous Mode 🙈</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">
            <li>The API and database layers automatically strip relational foreign keys to your real student profile before publishing to the campus feed.</li>
            <li>Other students, seniors, and campus faculty can never inspect the author&apos;s real name, email, or profile handle.</li>
            <li>Client-side PII redactor automatically warns you if your post contains phone numbers, roll numbers, or personal email addresses.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="rights" className="space-y-3 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <UserCheck className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              3. Your Rights as a Data Principal (DPDP Act 2023)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            As a Data Principal under Indian data protection law, you possess full statutory sovereignty over your personal records:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-foreground/80 leading-relaxed">
            <li><strong>Right to Access &amp; Summary:</strong> You can review all personal data linked to your account via Profile Settings.</li>
            <li><strong>Right to Correction &amp; Erasure:</strong> Edit your information anytime or request permanent account erasure by emailing <a href="mailto:privacy@campusloop.space" className="text-primary hover:underline font-bold">privacy@campusloop.space</a>.</li>
            <li><strong>Right of Grievance Redressal:</strong> Escalate any data governance concern directly to our designated Grievance Officer.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="security" className="space-y-3 scroll-mt-28 rounded-2xl border border-border/60 bg-card p-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Key className="size-4.5" />
            </span>
            <h2 className="text-lg font-black text-foreground">
              4. Storage &amp; Encryption Standards
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            All user data is encrypted in transit via Transport Layer Security (TLS 1.3) and at rest utilizing AES-256 encryption within Neon serverless PostgreSQL and Cloudflare edge networks deployed in compliant data centers.
          </p>
        </section>

        {/* Section 5: Grievance Officer */}
        <section id="dpo" className="space-y-4 scroll-mt-28 rounded-2xl border border-primary/30 bg-card p-6 shadow-xs">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs">
            <Mail className="size-4" />
            <span>Designated Data Protection Officer</span>
          </div>
          <h2 className="text-lg font-black text-foreground">
            5. Grievance Officer Contact Details
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            In accordance with the DPDP Act 2023 and Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
          </p>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Officer Name:</span>
              <span className="font-bold text-foreground">Data Protection &amp; Grievance Officer</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Email:</span>
              <a href="mailto:privacy@campusloop.space" className="font-bold text-primary hover:underline">
                privacy@campusloop.space
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Response Turnaround:</span>
              <span className="font-bold text-foreground">Within 24 to 48 working hours</span>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
