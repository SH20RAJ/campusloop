import { getDb } from "@/db";
import { events } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailClient } from "./event-detail-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();

  const event = await db.query.events.findFirst({
    where: or(eq(events.id, id), eq(events.slug, id)),
  });

  if (!event) {
    return {
      title: "Event Not Found | CampusLoop",
    };
  }

  return {
    title: `${event.title} | ${event.clubName} — CampusLoop Events`,
    description:
      event.tagline ||
      `${event.title} hosted by ${event.clubName}. Register solo or in teams on CampusLoop.`,
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.bannerUrl ? [{ url: event.bannerUrl }] : undefined,
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailClient eventId={id} />;
}
