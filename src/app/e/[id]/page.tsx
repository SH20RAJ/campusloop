import { eq, or } from "drizzle-orm";
import type { Metadata } from "next";
import EventDetailPage from "@/app/app/(main)/events/[id]/page";
import { getDb } from "@/db";
import { events } from "@/db/schema";

interface EventShortLinkProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventShortLinkProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const event = await db.query.events.findFirst({
    where: or(eq(events.id, id), eq(events.slug, id)),
    with: { institution: true },
  });

  if (!event) {
    return { title: "Event | CampusLoop" };
  }

  // The root layout's title template already appends " | CampusLoop".
  const title = event.title;
  const description = event.description.slice(0, 160);
  const url = `https://campusloop.space/e/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: event.bannerUrl
        ? [{ url: event.bannerUrl }]
        : [{ url: "https://campusloop.space/og-image.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.bannerUrl ? [event.bannerUrl] : ["https://campusloop.space/og-image.png"],
    },
  };
}

/**
 * Public event page. Outside the auth-gated `(main)` layout so a QR scan or a
 * shared link opens the event itself; registering still requires an account.
 */
export default EventDetailPage;
