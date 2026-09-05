import { describe, expect, it } from "bun:test";
import {
  createGoogleCalendarUrl,
  createIcsContent,
  formatCalendarDate,
} from "./calendar";

describe("Calendar Integration Engine", () => {
  const sampleEvent = {
    id: "evt_12345",
    slug: "hack-misra-2026",
    title: "HackBIT Misra 2026",
    description: "Annual hackathon hosted by ACM Student Chapter at BIT Mesra.",
    venue: "CAT Hall, BIT Mesra",
    mode: "OFFLINE",
    startDate: "2026-10-15T09:00:00.000Z",
    endDate: "2026-10-16T18:00:00.000Z",
    clubName: "ACM Student Chapter",
  };

  it("formatCalendarDate produces valid UTC ISO string without separators", () => {
    const formatted = formatCalendarDate("2026-10-15T09:00:00.000Z");
    expect(formatted).toBe("20261015T090000Z");
  });

  it("createGoogleCalendarUrl encodes TEMPLATE parameters correctly", () => {
    const url = createGoogleCalendarUrl(sampleEvent);
    expect(url).toContain("https://calendar.google.com/calendar/render?");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("text=HackBIT+Misra+2026");
    expect(url).toContain("dates=20261015T090000Z%2F20261016T180000Z");
    expect(url).toContain("location=CAT+Hall%2C+BIT+Mesra+%28OFFLINE%29");
    expect(url).toContain("details=Annual+hackathon");
  });

  it("createGoogleCalendarUrl falls back to 2-hour window if endDate is missing or invalid", () => {
    const eventWithoutEnd = {
      ...sampleEvent,
      endDate: null,
    };
    const url = createGoogleCalendarUrl(eventWithoutEnd);
    expect(url).toContain("dates=20261015T090000Z%2F20261015T110000Z");
  });

  it("createIcsContent generates valid RFC 5545 format with VCALENDAR and VEVENT", () => {
    const ics = createIcsContent(sampleEvent);
    expect(ics).toContain("BEGIN:VCALENDAR\r\n");
    expect(ics).toContain("VERSION:2.0\r\n");
    expect(ics).toContain("PRODID:-//CampusLoop//Campus Events//EN\r\n");
    expect(ics).toContain("BEGIN:VEVENT\r\n");
    expect(ics).toContain("UID:evt_12345@campusloop.space\r\n");
    expect(ics).toContain("DTSTART:20261015T090000Z\r\n");
    expect(ics).toContain("DTEND:20261016T180000Z\r\n");
    expect(ics).toContain("SUMMARY:HackBIT Misra 2026\r\n");
    expect(ics).toContain("LOCATION:CAT Hall\\, BIT Mesra (OFFLINE)\r\n");
    expect(ics).toContain("BEGIN:VALARM\r\n");
    expect(ics).toContain("END:VEVENT\r\n");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("createIcsContent handles missing description and venue gracefully", () => {
    const minimalEvent = {
      title: "Campus Orientation",
      startDate: new Date("2026-08-01T10:00:00.000Z"),
    };
    const ics = createIcsContent(minimalEvent);
    expect(ics).toContain("SUMMARY:Campus Orientation\r\n");
    expect(ics).toContain("LOCATION:CampusLoop\r\n");
    expect(ics).toContain("END:VCALENDAR");
  });
});
