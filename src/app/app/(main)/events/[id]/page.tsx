import { eq, or } from "drizzle-orm";
import type { Metadata } from "next";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { EventDetailClient } from "./event-detail-client";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();

  const event = await db.query.events.findFirst({
    where: or(eq(events.id, id), eq(events.slug, id)),
    with: { institution: true },
  });

  if (!event) {
    return { title: "Event Not Found" };
  }

  const key = event.slug || event.id;
  const canonical = `https://campusloop.space/app/events/${key}`;
  const title = `${event.title} | ${event.clubName} — CampusLoop Events`;
  const description =
    event.tagline || `${event.title} hosted by ${event.clubName}. Register solo or in teams on CampusLoop.`;
  const images = event.bannerUrl
    ? [{ url: event.bannerUrl }]
    : [{ url: "https://campusloop.space/og-image.png" }];

  return {
    title,
    description,
    alternates: { canonical },
    keywords: [
      event.title,
      event.clubName,
      event.eventType.toLowerCase(),
      "college event",
      "campus hackathon",
      event.institution?.name || "India",
    ],
    openGraph: {
      type: "website",
      title: event.title,
      description: event.description.slice(0, 160),
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description.slice(0, 160),
      images: images.map((i) => i.url),
    },
  };
}

/** Maps our event mode onto the schema.org attendance vocabulary. */
function attendanceMode(mode: string) {
  if (mode === "ONLINE") return "https://schema.org/OnlineEventAttendanceMode";
  if (mode === "HYBRID") return "https://schema.org/MixedEventAttendanceMode";
  return "https://schema.org/OfflineEventAttendanceMode";
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const db = getDb();

  const event = await db.query.events.findFirst({
    where: or(eq(events.id, id), eq(events.slug, id)),
    with: { institution: true },
  });

  // The client component renders its own not-found state, so a missing event
  // here only means we skip the structured data.
  const jsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.description.slice(0, 500),
        image: event.bannerUrl || "https://campusloop.space/og-image.png",
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        eventAttendanceMode: attendanceMode(event.mode),
        eventStatus:
          event.status === "CANCELLED"
            ? "https://schema.org/EventCancelled"
            : "https://schema.org/EventScheduled",
        url: `https://campusloop.space/app/events/${event.slug || event.id}`,
        location:
          event.mode === "ONLINE"
            ? {
                "@type": "VirtualLocation",
                url: event.meetingUrl || `https://campusloop.space/app/events/${event.slug || event.id}`,
              }
            : {
                "@type": "Place",
                name: event.venue || event.institution?.name || "Campus",
                address: event.institution?.name || "India",
              },
        organizer: {
          "@type": "Organization",
          name: event.clubName,
          url: "https://campusloop.space",
        },
        offers: {
          "@type": "Offer",
          price: event.isPaid ? event.entryFee : "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `https://campusloop.space/app/events/${event.slug || event.id}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <EventDetailClient eventId={id} />
    </>
  );
}
