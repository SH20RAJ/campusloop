import { MarketingFooter,MarketingHeader } from "@/components/marketing/system";
import { ArrowLeft,Database,EyeOff,Key,Lock,Mail,ShieldCheck,UserCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
            <ShieldCheck className="size-4" /> Data Protection &amp; Confidentiality
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Privacy <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
            Last Updated: August 24, 2026. Formulated in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
          </p>
        </div>

        {/* Commitment Banner */}
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
            <Lock className="size-4" /> Privacy-First Architecture
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            At CampusLoop, privacy is not a checkbox; it is our core engineering philosophy. We ensure verified campus access while guaranteeing that anonymous student discourse cannot be linked back to individual profiles by unauthorized third parties.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Database className="size-5 text-blue-500" /> 1. Data We Collect (Data Fiduciary Notice)
            </h2>
            <p>
              Under Section 5 of the DPDP Act 2023, we collect only the minimum data necessary to deliver verified campus connectivity:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">📧 Institutional Email ID</span>
                <p className="text-[11px] text-muted-foreground">
                  Used solely to verify your affiliation with an accredited college domain (e.g. <code className="text-primary">.edu</code>, <code className="text-primary">.ac.in</code>). Never sold or shared with commercial marketers.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">👤 Student Profile Data</span>
                <p className="text-[11px] text-muted-foreground">
                  Display name, handle, batch, branch, graduation year, bio, and optional profile picture/banner uploaded by you.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">💬 User-Generated Posts &amp; Polls</span>
                <p className="text-[11px] text-muted-foreground">
                  Campus discussions, poll responses, comment threads, dating preferences, and community messages created on the platform.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">🛡️ Security &amp; Device Telemetry</span>
                <p className="text-[11px] text-muted-foreground">
                  Hashed session tokens, IP logs for DDoS mitigation, and worker error telemetry to prevent bot abuse and spam.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <EyeOff className="size-5 text-purple-500" /> 2. Cryptographic Anonymity Separation
            </h2>
            <p>
              When you choose to publish a post or confession under <strong>Anonymous Mode 🙈</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-foreground/80">
              <li>The API and database layers strip relational pointers to your identity before sending data to the client feed.</li>
              <li>Other students and campus administrators can never view the author&apos;s real name, email, or handle.</li>
              <li>Anonymity is preserved across feed cards, comment lists, and poll votes.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <UserCheck className="size-5 text-emerald-500" /> 3. Your Rights as a Data Principal (DPDP Act 2023)
            </h2>
            <p>
              As a Data Principal under the Digital Personal Data Protection Act, 2023, you are entitled to the following statutory rights:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-foreground/80">
              <li><strong>Right to Access:</strong> You can view and download all personal information associated with your account from your Profile Settings.</li>
              <li><strong>Right to Correction:</strong> You can edit or correct your profile details, department, course, and headline at any time.</li>
              <li><strong>Right to Erasure / Deletion:</strong> You have the right to request permanent deletion of your account and all associated personal data by emailing <a href="mailto:privacy@campusloop.space" className="text-primary hover:underline font-bold">privacy@campusloop.space</a>.</li>
              <li><strong>Right to Grievance Redressal:</strong> You can escalate data protection concerns directly to our Data Protection Officer.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Key className="size-5 text-amber-500" /> 4. Data Storage &amp; Encryption Standards
            </h2>
            <p>
              All user data is encrypted in transit using Transport Layer Security (TLS 1.3) and at rest utilizing AES-256 encryption within Neon serverless PostgreSQL and Cloudflare edge networks located in secure data centers.
            </p>
          </section>

          {/* Section 5 - DPO & Grievance Contact */}
          <section className="space-y-4 rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs">
              <Mail className="size-4" /> Data Protection Officer
            </div>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              5. Contacting the Data Protection Officer (DPO)
            </h2>
            <p className="text-xs">
              If you have any questions, requests for data deletion, or privacy inquiries under the DPDP Act 2023:
            </p>

            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 text-xs text-foreground">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Officer:</span>
                <span className="font-extrabold">Data Protection &amp; Privacy Officer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Email:</span>
                <a href="mailto:privacy@campusloop.space" className="font-extrabold text-primary hover:underline">
                  privacy@campusloop.space
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Response SLA:</span>
                <span className="font-extrabold">Within 48 hours for data requests</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
