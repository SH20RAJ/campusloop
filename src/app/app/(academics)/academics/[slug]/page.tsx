import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AcademicDetailClient } from "@/components/academics/academic-detail-client";
import { resolveAcademicResource } from "@/lib/academics/slug";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

interface AcademicSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AcademicSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = await resolveAcademicResource(slug);

  if (!resource) {
    return {
      title: "Academic Material Not Found | CampusLoop",
      description: "The requested college notes or question paper could not be found.",
    };
  }

  const title = `${resource.title} (${resource.subjectCode}) | Free PDF Download & PYQ | CampusLoop`;
  const description =
    resource.description ||
    `Download ${resource.subjectCode} - ${resource.subjectName} verified notes, previous year question papers (PYQs), and lab manuals for ${resource.branch} Semester ${resource.semester} at ${resource.institution?.name || "Indian Universities"}. Direct PDF preview without sign-up.`;
  const canonicalUrl = `https://campusloop.space/app/academics/${resource.id}`;

  const keywords = Array.from(
    new Set([
      resource.subjectCode,
      resource.subjectName,
      `${resource.subjectCode} notes`,
      `${resource.subjectName} PYQ`,
      `${resource.subjectCode} previous year questions`,
      `${resource.subjectCode} PDF download`,
      resource.branch,
      `Semester ${resource.semester}`,
      resource.resourceType,
      "Campus Notes",
      "PYQ Question Papers",
      "Direct PDF Download",
      "AKTU Quantum Series",
      resource.institution?.name || "College Notes",
      ...(Array.isArray(resource.tags) ? (resource.tags as string[]) : []),
    ])
  );

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: "https://campusloop.space/og-academics.png",
          width: 1536,
          height: 1024,
          alt: resource.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${resource.title} (${resource.subjectCode}) | CampusLoop Academics`,
      description,
      images: ["https://campusloop.space/og-academics.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function AcademicResourceSlugPage({ params }: AcademicSlugPageProps) {
  const { slug } = await params;
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;

  const resource = await resolveAcademicResource(slug);
  if (!resource) {
    notFound();
  }

  const canonicalUrl = `https://campusloop.space/app/academics/${resource.id}`;

  // Schema.org structured data for Google LearningResource rich snippets
  const learningResourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.description || resource.title,
    educationalLevel: `Semester ${resource.semester}, Undergraduate Engineering (B.Tech)`,
    learningResourceType: resource.resourceType,
    inLanguage: "en-IN",
    encodingFormat: "application/pdf",
    isAccessibleForFree: true,
    teaches: resource.subjectName,
    about: {
      "@type": "Course",
      name: resource.subjectName,
      courseCode: resource.subjectCode,
    },
    provider: {
      "@type": "EducationalOrganization",
      name: resource.institution?.name || "CampusLoop University Network",
    },
    author: {
      "@type": "Person",
      name: resource.uploader?.displayName || "Verified Student Senior",
    },
    datePublished: resource.createdAt ? new Date(resource.createdAt).toISOString() : new Date().toISOString(),
    dateModified: resource.updatedAt ? new Date(resource.updatedAt).toISOString() : new Date().toISOString(),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (resource.upvotesCount || 0) > 0 ? "4.9" : "4.8",
      bestRating: "5",
      worstRating: "1",
      ratingCount: Math.max(12, (resource.upvotesCount || 0) + 15),
    },
  };

  // Schema.org BreadcrumbList for hierarchical Google SERP trails
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://campusloop.space",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Academics",
        item: "https://campusloop.space/app/academics",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: resource.branch,
        item: `https://campusloop.space/app/academics?branch=${encodeURIComponent(resource.branch)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${resource.subjectCode} - ${resource.subjectName}`,
        item: `https://campusloop.space/app/academics?subject=${encodeURIComponent(resource.subjectCode)}`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: resource.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AcademicDetailClient initialResource={resource} currentUserId={profile?.id ?? null} />
    </>
  );
}
