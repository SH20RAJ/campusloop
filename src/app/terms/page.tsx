import {
DocLayout,
DocList,
DocNote,
DocSection,
DocTable,
LegalDocHeader,
type DocSectionRef,
} from "@/components/marketing/legal-doc";
import { LegalNav } from "@/components/marketing/legal-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
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


const SECTIONS: DocSectionRef[] = [
  { id: "eligibility", label: "Who can join" },
  { id: "account", label: "Your account" },
  { id: "prohibited", label: "Prohibited content" },
  { id: "anonymity", label: "Responsible anonymity" },
  { id: "moderation", label: "Moderation & takedown" },
  { id: "termination", label: "Suspension" },
  { id: "grievance", label: "Grievance officer" },
];

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CampusLoop Terms of Service",
    url: "https://campusloop.space/terms",
    description:
      "Terms governing use of CampusLoop, including eligibility, prohibited content under IT Rules 2021, and grievance redressal.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />
      <LegalNav />

      <main className="flex-1 pt-14">
        <DocLayout sections={SECTIONS}>
          <LegalDocHeader
            eyebrow="Legal"
            title="Terms of service"
            summary="By creating an account you agree to these terms. They are written to be read — if something here is unclear, write to us and we will explain it rather than hide behind it."
            meta={["Last updated 28 August 2026", "IT Rules, 2021", "CampusLoop Inc."]}
          />

          <DocSection id="eligibility" number={1} title="Who can join">
            <p>
              CampusLoop is for students, recent alumni, and campus community members at recognised
              Indian institutions. Posting requires a verified college email address.
            </p>
            <DocTable
              rows={[
                {
                  label: "Verified student",
                  value: "Full access",
                  note: "Post, vote, message, and use Campus Match. Requires a .ac.in / .edu address.",
                },
                {
                  label: "Viewer",
                  value: "Read-only",
                  note: "Prospective students and visitors can browse public college hubs without posting or voting.",
                },
                {
                  label: "Campus Match",
                  value: "18 and over",
                  note: "Dating features are unavailable to students under 18.",
                },
              ]}
            />
          </DocSection>

          <DocSection id="account" number={2} title="Your account">
            <p>
              One person, one account. You are responsible for what happens under yours, so keep
              your college email secure.
            </p>
            <DocList
              items={[
                "Do not create bot accounts, spoof verification tokens, or share your login.",
                "Do not impersonate another student, a faculty member, or an institution.",
                "Do not attempt to cross institutional boundaries you have not been verified into.",
              ]}
            />
          </DocSection>

          <DocSection id="prohibited" number={3} title="Prohibited content">
            <p>
              Under Rule 3(1)(b) of the IT (Intermediary Guidelines and Digital Media Ethics Code)
              Rules, 2021, you may not host, upload, publish, or transmit content that:
            </p>
            <DocList
              items={[
                "Exposes phone numbers, hostel room numbers, roll numbers, or contact details of any student, faculty, or staff member.",
                "Targets a person or community with abuse, bullying, defamation, threats of violence, or hate speech.",
                "Contains explicit adult material or non-consensual media, contrary to Sections 67 and 67A of the Information Technology Act.",
                "Sells exam leaks, runs impersonation scams, or phishes fellow students.",
                "Involves anyone under 18 in a sexual context, which we report without exception.",
              ]}
            />
          </DocSection>

          <DocSection id="anonymity" number={4} title="Responsible anonymity">
            <p>
              Anonymity exists so students can raise problems with hostel conditions, administration,
              or mental health without risking their standing. It is a shield, not a weapon.
            </p>
            <DocNote>
              Anonymity does not exempt a post from these terms. Accounts used for targeted
              harassment behind a pseudonym are suspended, and unmasked where the law requires it.
            </DocNote>
          </DocSection>

          <DocSection id="moderation" number={5} title="Moderation and takedown">
            <p>
              Content reaching three independent reports enters moderation escrow and is hidden from
              campus feeds pending review. Moderators and automated checks resolve reports within
              24 hours, as required by Rule 3(2) of the IT Rules, 2021.
            </p>
            <p>
              If your content is removed you are told which rule it broke, and you can reply to the
              decision. Moderator actions are logged.
            </p>
          </DocSection>

          <DocSection id="termination" number={6} title="Suspension and removal">
            <p>
              We may suspend or permanently remove an account that repeatedly breaks these terms.
              Serious cases — ragging, threats, sexual content involving minors — result in
              immediate removal on the first instance, with escalation to the institution and to law
              enforcement where applicable.
            </p>
            <p>
              You can delete your own account at any time from Settings. Deletion removes your
              profile and content, subject to any records we are legally required to retain.
            </p>
          </DocSection>

          <DocSection id="grievance" number={7} title="Grievance officer">
            <p>
              Appointed under Rule 3(2) of the IT (Intermediary Guidelines and Digital Media Ethics
              Code) Rules, 2021.
            </p>
            <DocTable
              rows={[
                { label: "Officer", value: "Grievance Redressal Officer" },
                {
                  label: "Email",
                  value: (
                    <a
                      href="mailto:grievance@campusloop.space"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      grievance@campusloop.space
                    </a>
                  ),
                },
                { label: "Acknowledgement", value: "Within 24 hours" },
                { label: "Resolution", value: "Within 15 days, per the IT Rules" },
              ]}
            />
          </DocSection>
        </DocLayout>
      </main>

      <MarketingFooter />
    </div>
  );
}
