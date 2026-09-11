"use client";

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

const SECTIONS: DocSectionRef[] = [
  { id: "problem", label: "The campus problem" },
  { id: "solution", label: "The verified layer" },
  { id: "flywheel", label: "Network flywheel" },
  { id: "market", label: "Market & demographics" },
  { id: "business", label: "Monetization model" },
  { id: "architecture", label: "Technical stack" },
];

export function OverviewClient() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader />
      <CompanyNav />

      <main className="flex-1 pt-14">
        <DocLayout sections={SECTIONS}>
          <LegalDocHeader
            eyebrow="Architecture & Strategy"
            title="Platform Overview & Strategic Thesis"
            summary="A comprehensive architectural brief on CampusLoop's verified student graph, multi-product network density flywheel, addressable higher education market, and infrastructure invariants."
            meta={["Strategic Whitepaper", "43.3M Student Addressable Market", "Edge Architecture", "Zero Data Reselling"]}
          />

          {/* 01. The Campus Problem */}
          <DocSection id="problem" number={1} title="The fragmented campus reality">
            <p>
              Higher education in India encompasses over 43 million students across 55,000 institutions, yet student
              digital life remains completely fragmented across disjointed, unverified tools:
            </p>

            <DocList
              items={[
                "Unregulated WhatsApp Groups: Hundreds of unread messages every evening, critical notices lost in noise, and mobile numbers exposed to unvetted strangers.",
                "Syllabus & Notes Rot: Students scramble during midsem and endsem exam weeks searching for syllabus packs, only to find dead Google Drive links and incomplete notes.",
                "Toxic Anonymous Outlets: Unchecked confession pages on Instagram or Reddit lead to cyberbullying, hazing, and UGC anti-ragging violations.",
                "Unsafe Dating Platforms: Mainstream dating applications in India suffer from severe catfishing, non-student infiltration, and mismatched intent.",
              ]}
            />

            <p>
              When campus communication is distributed across five different generic platforms, students lose context,
              privacy, and peer safety.
            </p>
          </DocSection>

          {/* 02. The Verified Solution */}
          <DocSection id="solution" number={2} title="The unified verified student layer">
            <p>
              CampusLoop creates a closed, trusted digital campus graph by tying every account to a verified college
              domain (<code className="font-mono text-xs">.ac.in</code> /{" "}
              <code className="font-mono text-xs">.edu.in</code>).
            </p>

            <DocTable
              rows={[
                {
                  label: "100% Student Verified",
                  value: "Strict Institutional Gating",
                  note: "Zero non-student strangers, marketing bots, or unverified accounts.",
                },
                {
                  label: "Dual Scoping Engine",
                  value: "Local Campus + All-India Hub",
                  note: "Instant toggle between your immediate college radius and nationwide university trends.",
                },
                {
                  label: "Identity Escrow Protection",
                  value: "Pseudonymous Expression with Accountability",
                  note: "Students can post candid confessions safely while protected from unmonitored harassment.",
                },
              ]}
            />
          </DocSection>

          {/* 03. Network Flywheel */}
          <DocSection id="flywheel" number={3} title="Campus density and network flywheel">
            <p>
              Unlike generic social networks that struggle with cold starts, CampusLoop leverages campus physical
              proximity to ignite a self-reinforcing engagement loop:
            </p>

            <DocList
              items={[
                "Academics (High Utility): Students join to access 100,000+ verified notes and past exam papers for their specific branch and semester.",
                "Campus Pulse (High Frequency): Daily confessions, trending polls, and hostel announcements keep students returning multiple times a day.",
                "Social & Discovery (High Affinity): Campus Match and student community sub-hubs facilitate meaningful peer friendships and study partnerships.",
                "Utility & Commerce (High Retention): On-campus student marketplace and hostel deliveries provide durable long-term stickiness throughout all 4 years of college.",
              ]}
            />

            <DocNote>
              Because colleges are geographically dense micro-communities, once 15% of a student batch joins
              CampusLoop, network effects rapidly drive adoption past 60% within 14 days of campus launch.
            </DocNote>
          </DocSection>

          {/* 04. Market & Demographics */}
          <DocSection id="market" number={4} title="Addressable market & demographics">
            <p>
              India represents the second-largest higher education market in the world:
            </p>

            <DocTable
              rows={[
                {
                  label: "Higher Education Enrollment",
                  value: "43.3 Million Students (AISHE Report)",
                  note: "Growing at a compound annual growth rate of 4.5% year over year.",
                },
                {
                  label: "Colleges & Universities",
                  value: "1,350+ Targeted Hubs / 55,000+ Total",
                  note: "Tier-1 and Tier-2 engineering, medical, management, and central universities prioritized.",
                },
                {
                  label: "Mobile Penetration",
                  value: "98%+ Smartphone Ownership",
                  note: "Average student screen time exceeding 4.2 hours daily on mobile devices.",
                },
                {
                  label: "Annual Student Living Spend",
                  value: "$2.4B+ Campus Ecosystem Spend",
                  note: "Covering books, study gear, hostel amenities, electronics, dining, and campus services.",
                },
              ]}
            />
          </DocSection>

          {/* 05. Monetization Model */}
          <DocSection id="business" number={5} title="Sustainable monetization framework">
            <p>
              CampusLoop rejects predatory surveillance advertising and data reselling. The platform operates on
              sustainable, privacy-first monetization streams:
            </p>

            <DocList
              items={[
                "Verified Campus Recruitment: Direct talent discovery pipelines for tech enterprises and startups to post internships and hire verified college developers.",
                "Local Merchant Student Deals: Exclusive student discounts from food vendors, bookstores, and student housing providers surrounding campus perimeters.",
                "CampusLoop Pro & Notebook Compute: Optional power-user tiers for unlimited cloud compute in CampusLoop Notebook and priority academic AI cram tokens.",
              ]}
            />

            <DocNote>
              Student personal data, confession history, and private messages are strictly confidential and will never
              be packaged, shared, or monetized for third-party commercial profiling.
            </DocNote>
          </DocSection>

          {/* 06. Technical Architecture Invariants */}
          <DocSection id="architecture" number={6} title="Technical architecture & engineering invariants">
            <p>
              CampusLoop is built for extreme performance, regional low latency, and zero-downtime resilience:
            </p>

            <DocTable
              rows={[
                {
                  label: "Application Framework",
                  value: "Next.js 16 (App Router) on Cloudflare Edge",
                  note: "Sub-50ms TTFB across all Indian regions with hybrid static and dynamic edge rendering.",
                },
                {
                  label: "Primary Database",
                  value: "Neon Serverless PostgreSQL + Drizzle ORM",
                  note: "Full relational integrity, connection pooling, and automated schema migrations.",
                },
                {
                  label: "Vector Recommendations",
                  value: "Qdrant Cloud with 600ms Relational Fallback",
                  note: "Semantic matching for dating and related posts; automatically degrades gracefully to SQL if vector timeout triggers.",
                },
                {
                  label: "Realtime & Signaling",
                  value: "Upstash Redis + Durable PostgreSQL Sessions",
                  note: "Under 5ms affinity indexing and real-time WebRTC calling signaling.",
                },
                {
                  label: "P2P WebRTC Plane",
                  value: "Direct Browser-to-Browser PeerJS",
                  note: "All audio/video calling media streams connect direct P2P with zero server relaying for maximum privacy.",
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
