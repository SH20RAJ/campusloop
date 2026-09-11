import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, ExternalLink, FlaskConical, GraduationCap, Heart, LayoutGrid } from "lucide-react";
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
import { buttonVariants } from "@/components/ui/button";
import { NOTEBOOK_URL, PRODUCTS } from "@/constants/products";
import { hexclaveServerApp } from "@/hexclave/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products — CampusLoop App & Free Student JupyterLab",
  description:
    "Explore CampusLoop products: the verified student-only campus network for 1,350+ Indian colleges, plus CampusLoop Notebook — free browser-based JupyterLab sessions for students.",
  keywords: [
    "CampusLoop products",
    "CampusLoop Notebook",
    "free JupyterLab for students",
    "student Jupyter notebook",
    "verified student network",
    "college social network India",
  ],
  alternates: { canonical: "https://campusloop.space/products" },
  openGraph: {
    title: "CampusLoop Products",
    description:
      "The verified campus network plus CampusLoop Notebook — free JupyterLab sessions for students, right in the browser.",
    url: "https://campusloop.space/products",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Products",
    description:
      "The verified campus network plus CampusLoop Notebook — free JupyterLab sessions for students.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const SECTIONS: DocSectionRef[] = [
  { id: "social-app", label: "CampusLoop Social" },
  { id: "notebook", label: "CampusLoop Notebook" },
  { id: "vault", label: "Academic Vault & PYQs" },
  { id: "dating", label: "Campus Match" },
  { id: "matrix", label: "Product matrix" },
];

export default async function ProductsPage() {
  const user = await hexclaveServerApp.getUser();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CampusLoop Products",
    url: "https://campusloop.space/products",
    description:
      "CampusLoop products: the verified student-only campus network and CampusLoop Notebook, free JupyterLab sessions for students.",
    publisher: { "@type": "Organization", name: "CampusLoop", url: "https://campusloop.space" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MarketingHeader isAuthenticated={!!user} />
        <CompanyNav />

        <main className="flex-1 pt-14">
          <DocLayout sections={SECTIONS}>
            <LegalDocHeader
              eyebrow="Ecosystem & Tooling"
              title="CampusLoop Products"
              summary="The verified student-only campus network for Indian colleges — plus free standalone engineering tools like Notebook, an in-browser JupyterLab computing session for every verified student."
              meta={["Multi-Product Suite", "100% Student-Verified", "Free Academic Access", "Edge Infrastructure"]}
            />

            {/* 01. CampusLoop Social App */}
            <DocSection id="social-app" number={1} title="CampusLoop Social App (Core Platform)">
              <p>
                The flagship verified campus social network connecting students across 1,350+ institutions in India.
                It replaces fragmented, noisy WhatsApp groups with an authentic campus graph gated by your college
                email.
              </p>

              <DocList
                items={[
                  "Dual-Radius Feed: Seamlessly switch between your immediate local college timeline and the national cross-campus feed.",
                  "Confessions & Identity Escrow: Post candidly under cryptographically sealed pseudonym handles with zero risk of unmonitored cyberbullying.",
                  "Interactive Polls & Questions: Measure real-time campus sentiment regarding exam schedules, mess menus, and placement drives.",
                  "Peer Messenger & Calls: Low-latency direct messaging and direct browser-to-browser P2P WebRTC voice and video calls.",
                ]}
              />

              <div className="pt-2">
                <Link
                  href={user ? "/app" : "/handler/sign-up"}
                  className={cn(buttonVariants({ size: "default" }), "gap-2 cursor-pointer shadow-xs")}
                >
                  <span>{user ? "Open CampusLoop App" : "Get Verified on CampusLoop"}</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </DocSection>

            {/* 02. CampusLoop Notebook */}
            <DocSection id="notebook" number={2} title="CampusLoop Notebook (Free Browser JupyterLab)">
              <p>
                A high-performance JupyterLab computational workspace running directly in the browser with zero local
                setup. Designed specifically for Indian engineering, computer science, and data science students.
              </p>

              <DocList
                items={[
                  "Instant Cloud Runtime: Launch a full Jupyter environment in under 3 seconds without local Python, Anaconda, or dependency installation.",
                  "Pre-Configured Scientific Stack: Ready-to-code with NumPy, Pandas, Matplotlib, Scikit-learn, and PyTorch out of the box.",
                  "Zero Hardware Barrier: Enables students on low-spec budget laptops or college lab terminals to train machine learning models and run assignments.",
                  "Direct Assignment Sharing: Export notebooks as clean PDFs or share read-only executable links with batchmates and teaching assistants.",
                ]}
              />

              <DocNote>
                CampusLoop Notebook is completely free for students. Sessions persist securely and auto-save your
                code to cloud storage.
              </DocNote>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={NOTEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "default" }), "gap-1.5 cursor-pointer shadow-xs")}
                >
                  <span>Launch Free JupyterLab Notebook</span>
                  <ArrowUpRight className="size-3.5" />
                </a>
                <span className="font-mono text-xs text-muted-foreground">{NOTEBOOK_URL}</span>
              </div>
            </DocSection>

            {/* 03. Academic Vault & PYQs */}
            <DocSection id="vault" number={3} title="Academic Vault & Exam Repository">
              <p>
                The centralized repository of over 100,000 university past-year examination papers (PYQs), professor
                lecture notes, lab manuals, and formula sheets:
              </p>

              <DocList
                items={[
                  "Subject Code Indexing: Instant search by university course code (e.g. CS201, EC302, ME101) across 25+ engineering departments.",
                  "1-Click Full Semester Packs: Save your entire semester syllabus pack to your personal cloud locker in one tap with 0 MB phone storage consumed.",
                  "Built-in Academic PDF Viewer: High-speed document reader with dark mode, zoom presets, and keyboard navigation.",
                  "AI Study Bar: Instant 15-minute exam cram prompts formatted directly for ChatGPT and Claude with syllabus context.",
                ]}
              />

              <div className="pt-2">
                <Link
                  href="/app/academics"
                  className={cn(buttonVariants({ size: "default" }), "gap-2 cursor-pointer shadow-xs")}
                >
                  <span>Explore Academic Vault</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </DocSection>

            {/* 04. Campus Match */}
            <DocSection id="dating" number={4} title="Campus Match (Verified Dating Deck)">
              <p>
                A verified dating and peer connection deck built exclusively for college students. By requiring verified
                college email authentication, CampusLoop eliminates fake profiles, non-student infiltration, and
                unsolicited stranger DMs.
              </p>

              <DocList
                items={[
                  "Mutual Opt-in Requirement: Both students must explicitly like each other before any direct messaging connection opens.",
                  "Scope Filters: Filter matches within your own institution or expand radius to verified students across neighboring universities.",
                  "Compatibility Scoring: Powered by student interests, shared academic subjects, and campus preferences.",
                  "Zero Catfish Guarantee: Every student profile reflects verified college credentials and batch year.",
                ]}
              />

              <div className="pt-2">
                <Link
                  href="/app/dating"
                  className={cn(buttonVariants({ size: "default" }), "gap-2 cursor-pointer shadow-xs")}
                >
                  <span>Open Campus Match</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </DocSection>

            {/* 05. Product Capabilities Matrix */}
            <DocSection id="matrix" number={5} title="Product portfolio comparison matrix">
              <p>
                Summary of all tools, access requirements, pricing, and infrastructure tiers across the CampusLoop suite:
              </p>

              <DocTable
                rows={[
                  {
                    label: "CampusLoop Social App",
                    value: "Verified Student Network",
                    note: "100% Free · Requires college email (.ac.in / .edu.in) · Accessible on Web, iOS & Android PWA.",
                  },
                  {
                    label: "CampusLoop Notebook",
                    value: "Browser JupyterLab Compute",
                    note: "100% Free · Open to all students & researchers · Runs in browser via cloud container edge.",
                  },
                  {
                    label: "Academic Vault",
                    value: "100K+ Exam Papers & Notes",
                    note: "100% Free · Direct downloads · Offline sync · Integrated AI study prompts.",
                  },
                  {
                    label: "Campus Match",
                    value: "Verified Student Dating",
                    note: "100% Free · Mutual opt-in · Verified college students only · Zero stranger DMs.",
                  },
                  {
                    label: "Student Marketplace",
                    value: "Peer-to-Peer On-Campus Exchange",
                    note: "100% Free · Verified batchmates · Hostel handoffs · Zero intermediary transaction cuts.",
                  },
                ]}
              />
            </DocSection>
          </DocLayout>
        </main>

        <MarketingFooter />
      </div>
    </>
  );
}
