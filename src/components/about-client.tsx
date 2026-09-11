"use client";

import Link from "next/link";
import {
  DocLayout,
  DocList,
  DocNote,
  DocSection,
  type DocSectionRef,
  DocTable,
  LegalDocHeader,
} from "@/components/marketing/legal-doc";
import { CompanyNav } from "@/components/marketing/company-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { SOCIAL_LINKS } from "@/constants/socials";

const SECTIONS: DocSectionRef[] = [
  { id: "mission", label: "Student-only mandate" },
  { id: "origins", label: "Origins and thesis" },
  { id: "trust-model", label: "Trust architecture" },
  { id: "ecosystem", label: "Platform ecosystem" },
  { id: "moderation", label: "Reporting & UGC rules" },
  { id: "scale", label: "Scale and density" },
  { id: "contact", label: "Contact and team" },
];

export function AboutClient() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader />
      <CompanyNav />

      <main className="flex-1 pt-14">
        <DocLayout sections={SECTIONS}>
          <LegalDocHeader
            eyebrow="Company & Mission"
            title="About CampusLoop"
            summary="CampusLoop is India's verified, student-only campus social network connecting students across 1,350+ institutions. Built to replace chaotic WhatsApp groups and toxic anonymous boards with a trusted, closed campus graph."
            meta={["Founded at BIT Mesra", "1,350+ Indexed Colleges", "100% Student-Only", "UGC Compliant"]}
          />

          {/* 01. The Student-Only Mandate */}
          <DocSection id="mission" number={1} title="The student-only mandate">
            <p>
              Traditional social platforms treat college students as just another demographic cohort to serve ads
              to. Public feeds are overwhelmed by non-student strangers, predatory recruiters, crypto spammers, and
              unaccountable trolls. Meanwhile, campus communications remain fractured across dozens of noisy,
              unregulated WhatsApp groups.
            </p>
            <p>
              CampusLoop was created on a single, uncompromising principle:{" "}
              <strong className="text-foreground">every single participant must be a verified college student</strong>.
              Access to campus feeds, confessions, dating decks, and community hubs is permanently gated behind an
              active institutional email address (<code className="font-mono text-xs">.ac.in</code> or{" "}
              <code className="font-mono text-xs">.edu.in</code>).
            </p>
            <DocList
              items={[
                "Verified institutional gating ensures 100% of participants are genuine peers.",
                "Zero commercial bots, random internet lurkers, or non-student bad actors.",
                "Zero-tolerance digital anti-ragging safeguards in full alignment with UGC regulations.",
                "High-signal local campus radius feeds scoped strictly to your university and adjacent hostels.",
              ]}
            />
          </DocSection>

          {/* 02. Origins & Thesis */}
          <DocSection id="origins" number={2} title="Origins and thesis">
            <p>
              CampusLoop originated in the hostel rooms of Birla Institute of Technology, Mesra. Like millions of
              college students across India, we witnessed first-hand the daily frustrations of student life:
            </p>
            <DocList
              items={[
                "500+ unread WhatsApp pings burying critical exam dates, club notices, and mess updates.",
                "Exam night panic when seniors' semester notes on Google Drive links suddenly 404.",
                "Dating platforms dominated by fake profiles, catfishes, and external non-students.",
                "Students afraid to ask academic questions or share genuine campus feedback without judgment.",
              ]}
            />
            <p>
              Previous attempts at campus anonymity—such as YikYak, Ask.fm, or anonymous Instagram confession
              pages—inevitably failed because absolute anonymity without accountability turns toxic. CampusLoop solves
              this through <strong className="text-foreground">cryptographic identity escrow</strong>: students can
              express themselves freely under dynamic pseudonym handles, while the platform maintains verifiable
              accountability against cyberbullying, harassment, or ragging.
            </p>
            <DocNote>
              Anonymity gives students the freedom to speak truth to power and seek mental health or academic help
              without fear. Identity escrow guarantees that this freedom cannot be weaponized to harm others.
            </DocNote>
          </DocSection>

          {/* 03. Three-Tier Trust Architecture */}
          <DocSection id="trust-model" number={3} title="Three-tier trust architecture">
            <p>
              Every interaction on CampusLoop operates under a transparent, multi-layered identity model designed to
              balance authentic peer connection with total privacy:
            </p>

            <DocTable
              rows={[
                {
                  label: "Public Student Persona",
                  value: "Verified Real Identity",
                  note: "Displays real name, department, batch year, and verified college badge. Used for marketplace listings, club announcements, academic uploads, and peer chats.",
                },
                {
                  label: "Pseudonymous Persona",
                  value: "Cryptographic Handle (e.g. anon_#8f3a)",
                  note: "Enables students to post confessions, questions, and sensitive campus queries without attaching their real identity to public timelines.",
                },
                {
                  label: "Identity Escrow Layer",
                  value: "AES-GCM Identity Vault",
                  note: "Student identity mapping is sealed at rest. Deanonymization can only occur in response to a confirmed, escalated UGC ragging or criminal investigation.",
                },
              ]}
            />
          </DocSection>

          {/* 04. Platform Ecosystem */}
          <DocSection id="ecosystem" number={4} title="Platform ecosystem">
            <p>
              CampusLoop combines all critical facets of campus living into a single, unified digital campus layer:
            </p>

            <DocList
              items={[
                "Campus Feed & Confessions: Live campus pulse featuring dynamic polls, questions, media sharing, and instant campus-wide announcements.",
                "Campus Radius & Discovery: Instant switcher between local college timeline and national cross-campus feed connecting all universities.",
                "Academic Vault: Over 100,000 indexed past-year questions (PYQs), professor-verified lecture notes, and formula sheets with 1-click downloads.",
                "Campus Match: Verified peer dating and study-buddy swipe deck with mutual opt-in and zero catfish guarantee.",
                "Sub-Hubs & Communities: Student-created spaces for competitive coding, hostel councils, cultural societies, and placement preparation.",
                "Student Marketplace: Peer-to-peer buy/sell exchange for textbooks, cycles, room essentials, and electronics with on-campus handoffs.",
              ]}
            />
          </DocSection>

          {/* 05. Reporting & UGC Compliance */}
          <DocSection id="moderation" number={5} title="Decentralized reporting & anti-ragging">
            <p>
              CampusLoop operates in strict compliance with the{" "}
              <strong className="text-foreground">
                UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions, 2009
              </strong>
              . Digital hazing, intimidation, or harassment is treated with zero tolerance.
            </p>
            <p>
              Our automated moderation pipeline scans submissions for private personal information (phone numbers,
              hostel room details, personal addresses) and redacts them in real-time before publication. In addition,
              every verified student holds weighted reporting authority to flag non-compliant content immediately.
            </p>
            <DocNote>
              Confirmed instances of ragging or hate speech result in permanent ban, forfeiture of Loop Points, and
              formal referral to the institution&apos;s anti-ragging cell.
            </DocNote>
          </DocSection>

          {/* 06. Scale and Density */}
          <DocSection id="scale" number={6} title="Scale and campus network density">
            <p>
              CampusLoop is architected for rapid horizontal expansion across Indian higher education:
            </p>

            <DocTable
              rows={[
                {
                  label: "Indexed Institutions",
                  value: "1,350+ Colleges & Universities",
                  note: "Including IITs, NITs, IIITs, BITS campuses, state technical boards (AKTU, VTU, JNTU), and central universities.",
                },
                {
                  label: "Academic Resources",
                  value: "100,000+ Verified Study Materials",
                  note: "Directly synchronized from official university archives and student open-source repositories.",
                },
                {
                  label: "Infrastructure",
                  value: "Cloudflare Edge + Neon Postgres",
                  note: "Sub-50ms latency across India, backed by Qdrant vector search and Upstash Redis caching.",
                },
                {
                  label: "Student Access",
                  value: "100% Free Forever",
                  note: "Direct downloads, notes sync, and campus networking are completely free for all verified students.",
                },
              ]}
            />
          </DocSection>

          {/* 07. Contact & Team */}
          <DocSection id="contact" number={7} title="Direct student team support">
            <p>
              CampusLoop is actively built by students and engineers who understand the campus ecosystem from within.
              We welcome partnerships with student councils, campus ambassadors, university administrations, and
              educators.
            </p>

            <DocTable
              rows={[
                {
                  label: "General & Student Inquiries",
                  value: (
                    <a href="mailto:support@campusloop.space" className="text-foreground underline hover:opacity-80">
                      support@campusloop.space
                    </a>
                  ),
                  note: "Fast response within 24 hours for student account queries and hub requests.",
                },
                {
                  label: "Campus Ambassador Program",
                  value: (
                    <a href="mailto:reps@campusloop.space" className="text-foreground underline hover:opacity-80">
                      reps@campusloop.space
                    </a>
                  ),
                  note: "Lead CampusLoop launches, organize campus events, and earn Loop Points bonuses.",
                },
                {
                  label: "Official Instagram",
                  value: (
                    <a
                      href={SOCIAL_LINKS.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline hover:opacity-80"
                    >
                      {SOCIAL_LINKS.instagram.handle}
                    </a>
                  ),
                  note: "Direct campus updates, student vibes, feature releases, and community highlights.",
                },
                {
                  label: "Official LinkedIn",
                  value: (
                    <a
                      href={SOCIAL_LINKS.linkedin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline hover:opacity-80"
                    >
                      {SOCIAL_LINKS.linkedin.handle}
                    </a>
                  ),
                  note: "Company announcements, engineering teardowns, and recruitment updates.",
                },
                {
                  label: "Official X (Twitter)",
                  value: (
                    <a
                      href={SOCIAL_LINKS.x.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline hover:opacity-80"
                    >
                      {SOCIAL_LINKS.x.handle}
                    </a>
                  ),
                  note: "Live platform changelog and engineering discussions.",
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
