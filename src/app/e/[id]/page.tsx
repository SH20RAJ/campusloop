import { getDb } from "@/db";
import { events, institutions } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

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

  const title = `${event.title} | CampusLoop`;
  const description = event.description.slice(0, 160);
  const url = `https://campusloop.space/e/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: event.bannerUrl ? [{ url: event.bannerUrl }] : [{ url: "https://campusloop.space/og-image.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.bannerUrl ? [event.bannerUrl] : ["https://campusloop.space/og-image.png"],
    },
  };
}

export default async function EventShortLinkPage({ params }: EventShortLinkProps) {
  const { id } = await params;
  const db = getDb();
  const event = await db.query.events.findFirst({
    where: or(eq(events.id, id), eq(events.slug, id)),
  });

  if (!event) {
    notFound();
  }

  redirect(`/app/events/${event.slug || event.id}`);
}
