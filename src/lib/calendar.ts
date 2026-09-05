import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { stripMarkdown } from "@/lib/utils";

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string | null;
  venue?: string | null;
  mode?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  slug?: string | null;
  clubName?: string | null;
  url?: string | null;
}

/**
 * Format a Date object into UTC ISO string format required by iCalendar and Google Calendar:
 * YYYYMMDDTHHmmssZ
 */
export function formatCalendarDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return new Date().toISOString().replace(/-|:|\.\d\d\d/g, "");
  }
  return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

/**
 * Generate a pre-filled Google Calendar event creation URL.
 */
export function createGoogleCalendarUrl(event: CalendarEvent): string {
  const start = typeof event.startDate === "string" ? new Date(event.startDate) : event.startDate;
  let end = event.endDate ? (typeof event.endDate === "string" ? new Date(event.endDate) : event.endDate) : null;

  // Fallback end date to start date + 2 hours if missing or before start
  if (!end || isNaN(end.getTime()) || end <= start) {
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  }

  const startIso = formatCalendarDate(start);
  const endIso = formatCalendarDate(end);

  const cleanDesc = stripMarkdown(event.description || "");
  const origin = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";
  const eventLink = event.url || (event.slug ? `${origin}/app/events/${event.slug}` : window.location.href);

  const detailsText = [
    cleanDesc ? cleanDesc.slice(0, 1000) : "",
    event.clubName ? `Organized by: ${event.clubName}` : "",
    `Event Details & RSVP: ${eventLink}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const locationText = [event.venue, event.mode ? `(${event.mode})` : ""].filter(Boolean).join(" ");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "Campus Event",
    dates: `${startIso}/${endIso}`,
    details: detailsText,
    location: locationText || "CampusLoop",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Open Google Calendar event creation in a new browser window/tab.
 */
export function openGoogleCalendar(event: CalendarEvent): void {
  haptics.light();
  const url = createGoogleCalendarUrl(event);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening Google Calendar 📅");
  }
}

/**
 * Generate standard RFC 5545 compliant iCalendar (.ics) content.
 * Compatible with Apple Calendar, iOS, macOS, Outlook, and Google Calendar import.
 */
export function createIcsContent(event: CalendarEvent): string {
  const start = typeof event.startDate === "string" ? new Date(event.startDate) : event.startDate;
  let end = event.endDate ? (typeof event.endDate === "string" ? new Date(event.endDate) : event.endDate) : null;

  if (!end || isNaN(end.getTime()) || end <= start) {
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  }

  const startIso = formatCalendarDate(start);
  const endIso = formatCalendarDate(end);
  const nowIso = formatCalendarDate(new Date());

  const origin = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";
  const eventLink = event.url || (event.slug ? `${origin}/app/events/${event.slug}` : `${origin}/app/events`);
  const uid = `${event.id || event.slug || Date.now()}@campusloop.space`;

  const cleanDesc = stripMarkdown(event.description || "").replace(/\r?\n/g, "\\n");
  const locationText = [event.venue, event.mode ? `(${event.mode})` : ""]
    .filter(Boolean)
    .join(" ")
    .replace(/,/g, "\\,");

  const summary = (event.title || "Campus Event").replace(/,/g, "\\,");

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CampusLoop//Campus Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${cleanDesc}\\n\\nEvent Link: ${eventLink}`,
    `LOCATION:${locationText || "CampusLoop"}`,
    `URL:${eventLink}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${summary}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return icsLines.join("\r\n");
}

/**
 * Trigger an RFC 5545 `.ics` file download.
 * On Apple devices (iOS Safari and macOS), this natively prompts:
 * "Add to Apple Calendar".
 */
export function downloadAppleCalendarIcs(event: CalendarEvent): void {
  haptics.light();
  if (typeof window === "undefined") return;

  try {
    const icsContent = createIcsContent(event);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeSlug = (event.slug || event.title || "campus-event")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    link.setAttribute("download", `${safeSlug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Apple Calendar invite ready (.ics) 🍏📅");
  } catch {
    toast.error("Failed to generate calendar invite");
  }
}
