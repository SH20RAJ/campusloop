import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Scale, Shield, AlertTriangle, UserCheck, FileText, Ban, Mail, MapPin } from "lucide-react";
import { MarketingHeader, MarketingFooter } from "@/components/marketing/system";

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
    dateModified: "2026-08-24",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      <main className="flex-1 w-full max-w-4xl px-4 sm:px-6 pt-28 pb-16 mx-auto space-y-10">
        {/* Header Title */}
        <div className="space-y-4 text-center sm:text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
            <Scale className="size-4" /> Legal &amp; Regulatory Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Terms of <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Last Updated: August 24, 2026. Published in compliance with Rule 3(1) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 under the Information Technology Act, 2000.
          </p>
        </div>

        {/* Highlight Notice */}
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
            <Shield className="size-4" /> Binding Legal Contract
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            By accessing, browsing, registering for, or using CampusLoop (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service, our Privacy Policy, and Community Safety Guidelines. If you do not agree to these terms, you must immediately discontinue use of the Platform.
          </p>
        </div>

        {/* Main Clauses */}
        <div className="space-y-8 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <UserCheck className="size-5 text-primary" /> 1. Eligibility &amp; Institutional Verification
            </h2>
            <p>
              CampusLoop is an exclusive network engineered exclusively for enrolled students, alumni, faculty, and verified members of recognized universities and colleges in India.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-foreground/80">
              <li>
                <strong>Official Email Verification:</strong> Access to campus-specific features (including local feeds, dating pools, and confessions) requires domain-level verification via an official institutional email address (e.g., <code className="bg-muted px-1.5 py-0.5 rounded text-primary">@bitmesra.ac.in</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-primary">@iitb.ac.in</code>).
              </li>
              <li>
                <strong>Minimum Age:</strong> You must be at least 17 years old or have reached the legal age of majority in your jurisdiction to register.
              </li>
              <li>
                <strong>Single Account Policy:</strong> Users are prohibited from creating multiple fraudulent accounts, spoofing identity tokens, or attempting to bypass institutional authentication boundaries.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Ban className="size-5 text-rose-500" /> 2. Prohibited Content &amp; Intermediary Guidelines (Rule 3(1)(b), IT Rules 2021)
            </h2>
            <p>
              Under Rule 3(1)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, users shall NOT host, display, upload, modify, publish, transmit, store, update, or share any information that:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">🚫 Harassment &amp; Doxxing</span>
                <p className="text-[11px] text-muted-foreground">
                  Publishing personal phone numbers, hostel room numbers, non-public photos, or targeted smear campaigns against fellow students or faculty.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">🚫 Anti-Ragging Violation</span>
                <p className="text-[11px] text-muted-foreground">
                  Content promoting ragging, hazing, intimidation, or coercion as prohibited by UGC Regulations on Curbing the Menace of Ragging, 2009.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">🚫 Obscene / Non-Consensual Media</span>
                <p className="text-[11px] text-muted-foreground">
                  Sexually explicit content, non-consensual intimate imagery (NCII), or content harmful to minors / CSAM.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="font-extrabold text-foreground text-xs block">🚫 Hate Speech &amp; Misinformation</span>
                <p className="text-[11px] text-muted-foreground">
                  Hate speech based on caste, religion, gender, sexual orientation, disability, or content threatening public order and national sovereignty.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <Shield className="size-5 text-emerald-500" /> 3. Anonymity &amp; User Liability
            </h2>
            <p>
              CampusLoop provides cryptographic pseudonymity for campus confessions, campus questions, and polling. While your identity is masked from public feed consumers, anonymity is not a license for criminal conduct or defamation.
            </p>
            <p className="text-xs">
              <strong>Legal Compliance:</strong> In the event of a valid court order, cognizable cybercrime report, or binding notice from authorized law enforcement agencies under Section 69 / Section 91 of the CrPC / Bharatiya Nagarik Suraksha Sanhita (BNSS), CampusLoop reserves the right to cooperate with lawful investigations in accordance with Section 79 of the Information Technology Act, 2000.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <FileText className="size-5 text-blue-500" /> 4. User-Generated Content &amp; Intellectual Property
            </h2>
            <p>
              You retain all ownership rights in the content, photos, text, and media you submit to CampusLoop. However, by uploading content, you grant CampusLoop a non-exclusive, royalty-free, transferable, worldwide license to host, store, cache, display, distribute, and format such content solely for the purpose of operating and promoting the Platform.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" /> 5. Account Suspension &amp; Termination
            </h2>
            <p>
              CampusLoop reserves the unilateral right to warn, temporarily suspend, or permanently terminate accounts, without prior notice, if a user violates these Terms, engages in automated bot scraping, or accumulates critical community moderation flags.
            </p>
          </section>

          {/* Section 6 - Grievance Officer */}
          <section className="space-y-4 rounded-3xl border border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-xs">
              <Mail className="size-4" /> Statutory Grievance Redressal Mechanism
            </div>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              6. Grievance Officer (Rule 3(2) of IT Rules, 2021 &amp; DPDP Act, 2023)
            </h2>
            <p className="text-xs">
              In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital Personal Data Protection Act, 2023, the details of the designated Grievance Officer are set out below:
            </p>

            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 text-xs text-foreground">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Designation:</span>
                <span className="font-extrabold">Grievance &amp; Compliance Officer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Entity:</span>
                <span className="font-extrabold">CampusLoop Technologies Private Limited</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Email:</span>
                <a href="mailto:grievance@campusloop.space" className="font-extrabold text-primary hover:underline">
                  grievance@campusloop.space
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Legal &amp; Takedown:</span>
                <a href="mailto:legal@campusloop.space" className="font-extrabold text-primary hover:underline">
                  legal@campusloop.space
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">Turnaround Time:</span>
                <span className="font-extrabold">Acknowledgment within 24h • Resolution within 15 days</span>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <MapPin className="size-5 text-indigo-500" /> 7. Governing Law &amp; Jurisdiction
            </h2>
            <p className="text-xs">
              These Terms shall be governed by, and construed in accordance with, the laws of the Republic of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts at Ranchi, Jharkhand, India.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
