import type { Metadata } from "next";
import {
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CleanFooter } from "@/components/landing/clean-footer";
import { MinimalLandingNavbar } from "@/components/landing/minimal-landing-navbar";
import { hexclaveServerApp } from "@/hexclave/server";

interface CollegeData {
  name: string;
  slug: string;
  location: string;
  state: string;
  category: string;
  domain: string;
  status: "active" | "waitlist";
  students: string;
  year: number;
  nirf?: number;
  summary: string;
}

const COLLEGE_DATA: Record<string, CollegeData> = {
  "bit-mesra": {
    name: "Birla Institute of Technology, Mesra",
    slug: "bit-mesra",
    location: "Mesra, Ranchi",
    state: "Jharkhand",
    category: "Deemed University",
    domain: "bitmesra.ac.in",
    status: "active",
    students: "4,890+",
    year: 1955,
    nirf: 53,
    summary:
      "Premier engineering institution known for its sprawling 780-acre lush green campus, thriving tech societies, Robosoc, and active hostel culture.",
  },
  "iit-delhi": {
    name: "Indian Institute of Technology Delhi",
    slug: "iit-delhi",
    location: "Hauz Khas, New Delhi",
    state: "Delhi",
    category: "Institute of National Importance (IIT)",
    domain: "iitd.ac.in",
    status: "active",
    students: "4,310+",
    year: 1961,
    nirf: 2,
    summary:
      "India's premier institute of technology, celebrated for startup incubation, competitive programming, and groundbreaking engineering research.",
  },
  "iit-bombay": {
    name: "Indian Institute of Technology Bombay",
    slug: "iit-bombay",
    location: "Powai, Mumbai",
    state: "Maharashtra",
    category: "Institute of National Importance (IIT)",
    domain: "iitb.ac.in",
    status: "active",
    students: "4,950+",
    year: 1958,
    nirf: 3,
    summary:
      "Renowned technological university situated alongside Powai Lake, home to Techfest, Mood Indigo, and world-class alumni.",
  },
  "bits-pilani": {
    name: "BITS Pilani (Pilani Campus)",
    slug: "bits-pilani",
    location: "Pilani, Rajasthan",
    state: "Rajasthan",
    category: "Deemed University",
    domain: "bits-pilani.ac.in",
    status: "active",
    students: "3,780+",
    year: 1964,
    nirf: 20,
    summary:
      "Trailblazing private research university famous for its zero-attendance policy, legendary OASIS cultural fest, and startup-founding culture.",
  },
  "nit-surathkal": {
    name: "National Institute of Technology Karnataka, Surathkal",
    slug: "nit-surathkal",
    location: "Surathkal, Mangalore",
    state: "Karnataka",
    category: "National Institute of Technology (NIT)",
    domain: "nitk.edu.in",
    status: "active",
    students: "3,420+",
    year: 1960,
    nirf: 12,
    summary:
      "Top-ranked NIT with its own private Arabian Sea beach, lighthouse, and premier engineering laboratories.",
  },
  "nit-trichy": {
    name: "National Institute of Technology Tiruchirappalli",
    slug: "nit-trichy",
    location: "Tiruchirappalli, Tamil Nadu",
    state: "Tamil Nadu",
    category: "National Institute of Technology (NIT)",
    domain: "nitt.edu",
    status: "active",
    students: "3,890+",
    year: 1964,
    nirf: 9,
    summary:
      "#1 NIT in India, renowned for academic rigor, Pragyan techno-managerial fest, and top tier placement records.",
  },
  "delhi-university": {
    name: "Delhi University (North Campus)",
    slug: "delhi-university",
    location: "New Delhi",
    state: "Delhi",
    category: "Central University",
    domain: "du.ac.in",
    status: "active",
    students: "7,200+",
    year: 1922,
    nirf: 11,
    summary:
      "Historic central collegiate university hosting St. Stephen's, SRCC, Hindu College, and vibrant student politics.",
  },
  "vit-vellore": {
    name: "Vellore Institute of Technology",
    slug: "vit-vellore",
    location: "Vellore, Tamil Nadu",
    state: "Tamil Nadu",
    category: "Deemed University",
    domain: "vit.ac.in",
    status: "active",
    students: "6,100+",
    year: 1984,
    nirf: 11,
    summary:
      "High-energy technological university with massive student population, Rivera fest, and extensive hackathon circuits.",
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const college = COLLEGE_DATA[slug] || {
    name: slug.replace(/-/g, " ").toUpperCase(),
    slug,
    location: "India",
    summary: "Verified campus hub and student community on CampusLoop.",
  };

  const title = `${college.name} Campus Hub & Student Feed | CampusLoop`;
  const description = `Join the verified ${college.name} campus network. Anonymous confessions, live polls, hostel marketplace, and student discussions for @${college.slug}.`;

  return {
    title,
    description,
    keywords: [
      college.name,
      `${college.name} confessions`,
      `${college.name} campus feed`,
      `${college.name} notes`,
      `${college.name} student loop`,
    ],
    alternates: {
      canonical: `https://campusloop.space/colleges/${college.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://campusloop.space/colleges/${college.slug}`,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "https://campusloop.space/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: `${college.name} Campus Hub`,
        },
      ],
    },
  };
}

export default async function ProgrammaticCollegePage({ params }: PageProps) {
  const { slug } = await params;
  const user = await hexclaveServerApp.getUser();

  // If known, use curated record; otherwise generate friendly fallback for any valid slug
  const college: CollegeData = COLLEGE_DATA[slug] || {
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug,
    location: "India",
    state: "India",
    category: "Higher Education Institution",
    domain: `${slug}.ac.in`,
    status: "waitlist",
    students: "Waitlist Active",
    year: 2000,
    summary: `Verified campus loop and community hub for students of ${slug.replace(/-/g, " ")}.`,
  };

  const isActive = college.status === "active";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        name: college.name,
        url: `https://campusloop.space/colleges/${college.slug}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: college.location,
          addressRegion: college.state,
          addressCountry: "India",
        },
      },
      {
        "@type": "Organization",
        name: "CampusLoop",
        url: "https://campusloop.space",
        logo: "https://campusloop.space/icons/icon-512x512.png",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MinimalLandingNavbar isAuthenticated={!!user} />

        <main className="flex-1 pt-12 pb-24">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 space-y-10">
            {/* ─── Breadcrumb ─── */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <span>/</span>
              <Link href="/colleges" className="hover:text-foreground">
                Colleges
              </Link>
              <span>/</span>
              <span className="text-foreground font-semibold">{college.name}</span>
            </div>

            {/* ─── Campus Header Card ─── */}
            <div className="relative rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#111622] p-6 sm:p-10 shadow-xs space-y-6 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {college.category}
                    </span>
                    {isActive ? (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Loop
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Pre-Launch Waitlist
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {college.name}
                  </h1>

                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-4 text-muted-foreground" />
                    {college.location} • Est. {college.year}
                    {college.nirf && (
                      <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                        NIRF #{college.nirf}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  {isActive ? (
                    <Link
                      href={`/handler/sign-up?college=${college.slug}`}
                      className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 text-xs shadow-xs text-center"
                    >
                      Verify & Join Campus Loop &rarr;
                    </Link>
                  ) : (
                    <Link
                      href="/contact"
                      className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 text-xs shadow-xs text-center"
                    >
                      Request Activation
                    </Link>
                  )}
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Official domain: @{college.domain}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                {college.summary}
              </p>

              {/* Quick Telemetry Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Verified Community
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {college.students}
                  </span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Access Requirement
                  </span>
                  <span className="text-base font-bold text-foreground font-mono text-xs">
                    @{college.domain}
                  </span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Identity Escrow
                  </span>
                  <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                    256-bit Encrypted
                  </span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Viewer Mode
                  </span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    Aspirants Welcome
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Hub Features Inside this Campus ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-2">
                <MessageSquare className="size-5 text-blue-600" />
                <h3 className="text-base font-bold text-foreground">
                  Confessions & Campus Feeds
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Candid hostel discussions, professor reviews, and exam week memes
                  free from administrative surveillance.
                </p>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-2">
                <Users className="size-5 text-purple-600" />
                <h3 className="text-base font-bold text-foreground">
                  Active Student Societies
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dedicated channels for tech teams, cultural societies, hostel wings,
                  and hackathon project matching.
                </p>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card p-6 space-y-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">
                  Zero Outside Creeps
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every account is verified through official institutional email.
                  Zero marketing agencies or coaching ads.
                </p>
              </div>
            </div>

            {/* ─── Final Join Banner ─── */}
            <div className="rounded-3xl border border-blue-500/30 bg-blue-500/5 p-8 text-center space-y-4">
              <h3 className="text-xl font-bold text-foreground">
                Study at {college.name}?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Unlock your college loop now. Enter your official university email to
                receive an instant one-time login OTP.
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <Link
                  href={`/handler/sign-up?college=${college.slug}`}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 text-xs shadow-xs"
                >
                  Verify With College Email &rarr;
                </Link>
              </div>
            </div>
          </div>
        </main>

        <CleanFooter />
      </div>
    </>
  );
}
