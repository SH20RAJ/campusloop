import type { Metadata } from "next";
import {
  DocLayout,
  DocList,
  DocNote,
  DocSection,
  type DocSectionRef,
  DocTable,
  LegalDocHeader,
} from "@/components/marketing/legal-doc";
import { LegalNav } from "@/components/marketing/legal-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";

export const metadata: Metadata = {
  title: "Privacy Policy",
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
    title: "Privacy Policy",
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
        alt: "Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description: "Learn how CampusLoop protects student data and cryptographic anonymity.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const SECTIONS: DocSectionRef[] = [
  { id: "collect", label: "What we collect" },
  { id: "anonymity", label: "How anonymity works" },
  { id: "sharing", label: "What we never do" },
  { id: "rights", label: "Your rights" },
  { id: "security", label: "Storage & encryption" },
  { id: "officer", label: "Grievance officer" },
];

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CampusLoop Privacy Policy",
    url: "https://campusloop.space/privacy",
    description: "How CampusLoop collects, uses, and protects student data under the DPDP Act 2023.",
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingHeader />
      <LegalNav />

      <main className="flex-1 pt-14">
        <DocLayout sections={SECTIONS}>
          <LegalDocHeader
            eyebrow="Legal"
            title="Privacy policy"
            summary="We ask for a college email because the network only works if everyone in it is a real student. This page explains exactly what that means for your data — what we hold, what we cannot see, and what you can make us delete."
            meta={["Last updated 28 August 2026", "DPDP Act, 2023", "CampusLoop Inc."]}
          />

          <DocSection id="collect" number={1} title="What we collect">
            <DocTable
              rows={[
                {
                  label: "College email address",
                  value: "Verification only",
                  note: "Used to confirm you belong to an accredited institution (.ac.in, .edu). Never displayed publicly, never sold or rented.",
                },
                {
                  label: "Profile details",
                  value: "Name, course, branch, year, photos, interests",
                  note: "Whatever you choose to fill in. All of it is editable, and most of it is optional.",
                },
                {
                  label: "Content you post",
                  value: "Posts, comments, polls, stories, messages",
                  note: "Stored so it can be shown back to the people you shared it with.",
                },
                {
                  label: "Security telemetry",
                  value: "Sign-in events, coarse device information",
                  note: "Kept to detect account takeover and abuse. Not used to build an advertising profile.",
                },
              ]}
            />
          </DocSection>

          <DocSection id="anonymity" number={2} title="How anonymity works">
            <p>
              Anonymous posts and confessions are not simply hidden in the interface — the link to your
              profile is removed before the post is written.
            </p>
            <DocList
              items={[
                "The stored post carries a pseudonym handle, not your profile ID. There is no foreign key left to join against.",
                "Recovering the author requires a separate encryption key held outside the database, and is limited to audited administrator actions for legal or safety escalations.",
                "No other student, senior, or faculty member can inspect the author of an anonymous post through any part of the product.",
                "Before you publish, a client-side check warns you if your text contains a phone number, roll number, or personal email that would identify you anyway.",
              ]}
            />
            <DocNote>
              Anonymity protects you from other students. It is not a shield against a court order, and it
              never covers threats, doxxing, or content involving minors.
            </DocNote>
          </DocSection>

          <DocSection id="sharing" number={3} title="What we never do">
            <DocList
              items={[
                "We do not sell or rent your personal data to anyone.",
                "We do not share your college email with other students, recruiters, or advertisers.",
                "We do not run third-party advertising trackers across the campus feed.",
                "We do not read your direct messages to train or target anything.",
              ]}
            />
          </DocSection>

          <DocSection id="rights" number={4} title="Your rights">
            <p>
              As a Data Principal under the Digital Personal Data Protection Act, 2023, you hold these rights,
              and you can exercise all of them without giving a reason.
            </p>
            <DocList
              items={[
                <>
                  <span className="text-foreground">Access.</span> Review everything linked to your account
                  from Profile Settings.
                </>,
                <>
                  <span className="text-foreground">Correction.</span> Edit any profile information at any
                  time.
                </>,
                <>
                  <span className="text-foreground">Erasure.</span> Request permanent deletion of your account
                  and its data at{" "}
                  <a
                    href="mailto:privacy@campusloop.space"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    privacy@campusloop.space
                  </a>
                  .
                </>,
                <>
                  <span className="text-foreground">Grievance redressal.</span> Escalate any concern to our
                  Grievance Officer, listed below.
                </>,
              ]}
            />
          </DocSection>

          <DocSection id="security" number={5} title="Storage and encryption">
            <p>
              Data is encrypted in transit with TLS 1.3 and at rest with AES-256, on Neon serverless
              PostgreSQL behind the Cloudflare edge network. Anonymous author identities are sealed with a
              separate key that the application database never holds.
            </p>
          </DocSection>

          <DocSection id="officer" number={6} title="Grievance officer">
            <p>
              Appointed under the DPDP Act, 2023 and Rule 3(2) of the IT (Intermediary Guidelines and Digital
              Media Ethics Code) Rules, 2021.
            </p>
            <DocTable
              rows={[
                { label: "Officer", value: "Data Protection & Grievance Officer" },
                {
                  label: "Email",
                  value: (
                    <a
                      href="mailto:privacy@campusloop.space"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      privacy@campusloop.space
                    </a>
                  ),
                },
                { label: "Response time", value: "24–48 working hours" },
              ]}
            />
          </DocSection>
        </DocLayout>
      </main>

      <MarketingFooter />
    </div>
  );
}
