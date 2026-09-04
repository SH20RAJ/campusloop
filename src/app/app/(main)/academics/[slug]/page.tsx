import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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

  const title = `${resource.title} (${resource.subjectCode}) | CampusLoop Academics`;
  const description =
    resource.description ||
    `Download ${resource.subjectCode} - ${resource.subjectName} notes and question papers for ${resource.branch} Semester ${resource.semester}.`;
  const canonicalUrl = `https://campusloop.space/app/academics/${resource.id}`;

  return {
    title,
    description,
    keywords: [
      resource.subjectCode,
      resource.subjectName,
      resource.branch,
      `Semester ${resource.semester}`,
      resource.resourceType,
      "Campus Notes",
      "PYQ Question Papers",
      resource.institution?.name || "College Notes",
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function AcademicResourceSlugPage({ params }: AcademicSlugPageProps) {
  const { slug } = await params;
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  const resource = await resolveAcademicResource(slug);
  if (!resource) {
    notFound();
  }

  // Schema.org structured data for LearningResource
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.description || resource.title,
    educationalLevel: `Semester ${resource.semester}`,
    learningResourceType: resource.resourceType,
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
      name: resource.uploader?.displayName || "Verified Student",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AcademicDetailClient initialResource={resource} currentUserId={profile.id} />
    </>
  );
}
