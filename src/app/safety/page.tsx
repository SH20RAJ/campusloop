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
import { MarketingFooter,MarketingHeader } from "@/components/marketing/system";
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


const SECTIONS: DocSectionRef[] = [
  { id: "standards", label: "Community standards" },
  { id: "ragging", label: "Anti-ragging policy" },
  { id: "doxxing", label: "Personal information" },
  { id: "moderation", label: "Reporting & moderation" },
  { id: "match", label: "Campus Match safety" },
  { id: "helplines", label: "Emergency helplines" },
];

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
            eyebrow="Trust & Safety"
            title="Safety and community standards"
            summary="CampusLoop is limited to students with a verified college email. These are the rules everyone agrees to, how we enforce them, and where to get help when something goes wrong."
            meta={["Last updated 28 August 2026", "UGC Anti-Ragging Regulations, 2009", "CampusLoop Inc."]}
          />

          <DocSection id="standards" number={1} title="What we expect">
            <p>
              Every account belongs to a real student at a real institution. That verification is
              what makes the network worth being part of, and it is also what makes misuse
              traceable. Treat people the way you would in a shared hostel corridor.
            </p>
            <DocList
              items={[
                "Post as yourself, or under your anonymous handle — never as someone else.",
                "Disagree with the argument, not the person behind it.",
                "Do not share anything about another student that they have not chosen to share.",
                "Content involving minors, sexual coercion, or credible threats is removed and reported.",
              ]}
            />
          </DocSection>

          <DocSection id="ragging" number={2} title="Anti-ragging: zero tolerance">
            <p>
              In line with the{" "}
              <span className="text-foreground">
                UGC Regulations on Curbing the Menace of Ragging in Higher Educational
                Institutions, 2009
              </span>
              , CampusLoop treats digital hazing as the same offence as its physical counterpart.
              This covers intimidation, coerced tasks, blackmail, and targeted humiliation of
              juniors, whether it happens in a public hub or a private message.
            </p>
            <DocNote>
              A confirmed ragging report results in immediate permanent removal, forfeiture of all
              Loop Points, and escalation to the institution&apos;s anti-ragging committee — and to
              law enforcement where the conduct is criminal.
            </DocNote>
          </DocSection>

          <DocSection id="doxxing" number={3} title="Personal information">
            <p>
              Our moderation engine flags or redacts content that exposes a student&apos;s physical
              location or private contact details, because on a residential campus that information
              carries real risk.
            </p>
            <DocList
              items={[
                "Mobile numbers and personal WhatsApp invite links.",
                "Hostel room numbers paired with a name or roll number.",
                "Personal email addresses shared to direct pile-ons.",
                "Photographs taken in hostels or private spaces without the subject's consent.",
              ]}
            />
          </DocSection>

          <DocSection id="moderation" number={4} title="Reporting and moderation">
            <p>
              Any verified student can report any post, comment, or confession in one tap. Reports
              are weighted, not counted blindly — a brigade cannot bury a post it simply disagrees
              with.
            </p>
            <DocTable
              rows={[
                {
                  label: "Automatic quarantine",
                  value: "Three independent reports",
                  note: "The post is hidden from campus feeds pending human review, and the author is notified.",
                },
                {
                  label: "Review turnaround",
                  value: "Under 24 hours",
                  note: "Reports involving safety of a person are escalated ahead of the queue.",
                },
                {
                  label: "Repeat offenders",
                  value: "Timeout, then permanent removal",
                  note: "Moderation decisions are logged and auditable, including the moderator who made them.",
                },
              ]}
            />
          </DocSection>

          <DocSection id="match" number={5} title="Campus Match and Secret Crush">
            <p>
              Match and Secret Crush are restricted to verified students aged 18 and over. They are
              built so that interest is never disclosed one-sidedly.
            </p>
            <DocList
              items={[
                <>
                  <span className="text-foreground">Secret Crush stays sealed.</span> A crush is
                  invisible to its subject unless both students independently add each other.
                </>,
                <>
                  <span className="text-foreground">Unmatch and block are immediate.</span> Blocking
                  removes the other student from your feeds, search, and discovery entirely.
                </>,
                <>
                  <span className="text-foreground">Meeting in person is your call.</span> Choose a
                  public place on campus, and tell a friend where you will be.
                </>,
              ]}
            />
          </DocSection>

          <DocSection id="helplines" number={6} title="If you need help now">
            <p>
              If you or another student is in immediate danger, contact emergency services first.
              These lines are free and staffed around the clock.
            </p>
            <DocTable
              rows={[
                {
                  label: "National Anti-Ragging Helpline",
                  value: <span className="font-mono">1800-180-5522</span>,
                  note: "UGC, toll-free, 24×7, all India.",
                },
                {
                  label: "KIRAN Mental Health Helpline",
                  value: <span className="font-mono">1800-599-0019</span>,
                  note: "Government of India counselling support, 13 languages.",
                },
                {
                  label: "Women Helpline",
                  value: <span className="font-mono">1091 · 112</span>,
                  note: "Emergency police response.",
                },
                {
                  label: "CampusLoop Safety Desk",
                  value: (
                    <a
                      href="mailto:safety@campusloop.space"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      safety@campusloop.space
                    </a>
                  ),
                  note: "Priority escalation, answered within 12 hours.",
                },
              ]}
            />
          </DocSection>
        </DocLayout>
      </main>

      <MarketingFooter />
    </div>
  );
}
