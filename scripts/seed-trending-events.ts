/**
 * Seed Trending Campus Events & Registrations
 * Populates realistic college hackathons, cultural fests, workshops, and registrations.
 *
 * Run: bun run scripts/seed-trending-events.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  eventRegistrations,
  events,
  institutions,
  userProfiles,
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

const SEED_EVENTS = [
  {
    title: "HackLoop 2026: 36-Hour National Autonomous AI & Web3 Sprint",
    slug: "hackloop-2026-national-ai-hackathon",
    tagline: "Build production autonomous AI agents, edge apps, and compete for ₹3,00,000+ bounties.",
    description: "Join 500+ builders across 80+ universities in a high-intensity 36-hour physical & online hackathon. Tracks include Agentic AI, Distributed Cloud, Fintech, and Smart Campus Infra.",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=630&fit=crop",
    clubName: "Google Developer Student Club & ACM",
    eventType: "HACKATHON",
    mode: "HYBRID",
    venue: "Main Auditorium & Innovation Center",
    startDaysFromNow: 5,
    durationHours: 36,
    isPaid: false,
    entryFee: "Free",
    prizesDescription: "₹3,00,000 Cash Pool + Cloud Credits + Fast-track Summer Internship Interviews",
    perks: ["Certificates", "Cash Prizes", "Swag Kits", "Food & Midnight Snacks", "25 LP"],
    simulatedAttendees: 84,
  },
  {
    title: "Bitotsav 2026: Annual Cultural & Rock Music Extravaganza",
    slug: "bitotsav-2026-annual-cultural-fest",
    tagline: "Eastern India's biggest university cultural fest featuring battle of the bands, EDM night & drama.",
    description: "Three electrifying nights of pure music, dance battles, stand-up comedy, street plays, and celebrity artist performances on the grand amphitheatre stage.",
    bannerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=630&fit=crop",
    clubName: "Music Club & Cultural Society",
    eventType: "FEST",
    mode: "OFFLINE",
    venue: "Open Air Amphitheatre & Quad",
    startDaysFromNow: 9,
    durationHours: 72,
    isPaid: false,
    entryFee: "Free for verified students",
    prizesDescription: "₹1,50,000 in competition trophies and gift hampers",
    perks: ["Celebrity EDM Night Access", "Certificates", "After-party Passes", "25 LP"],
    simulatedAttendees: 142,
  },
  {
    title: "Hands-on PyTorch & LLM Fine-Tuning Workshop (LoRA / QLoRA)",
    slug: "pytorch-llm-fine-tuning-lora-workshop-2026",
    tagline: "Build, quantize, and deploy a custom 7B open-source reasoning model on Google Colab / GPU pods.",
    description: "A 4-hour hands-on technical masterclass by seniors placed in AI research labs. We will fine-tune Llama-3 with PEFT/LoRA, build synthetic datasets, and deploy an OpenAI-compatible FastAPI endpoint.",
    bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop",
    clubName: "AI Research & Machine Learning Group",
    eventType: "WORKSHOP",
    mode: "HYBRID",
    venue: "CSE Department Seminar Hall 2",
    startDaysFromNow: 3,
    durationHours: 4,
    isPaid: false,
    entryFee: "Free",
    prizesDescription: "Free GPU Cloud Credits for top 3 benchmark submissions",
    perks: ["Hands-on Code Notebooks", "Verified Workshop Certificate", "25 LP"],
    simulatedAttendees: 67,
  },
  {
    title: "Campus Chess Championship & Blitz Knockout 2026",
    slug: "campus-chess-championship-blitz-knockout-2026",
    tagline: "FIDE-rated blitz format (3+2) with live chess engine analysis and grand final broadcast.",
    description: "Prove your strategic mastery across 7 swiss rounds + top 8 blitz knockout bracket. Open to all branches and years. Clocks and boards provided at venue.",
    bannerUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1200&h=630&fit=crop",
    clubName: "Campus Sports & Chess Club",
    eventType: "COMPETITION",
    mode: "OFFLINE",
    venue: "Student Activity Center (SAC) 1st Floor",
    startDaysFromNow: 12,
    durationHours: 8,
    isPaid: false,
    entryFee: "Free",
    prizesDescription: "₹25,000 Cash + Championship Trophy + Wooden Tournament Board",
    perks: ["Official Rating Recognition", "Medals", "Refreshments", "25 LP"],
    simulatedAttendees: 38,
  },
];

async function seedTrendingEvents() {
  console.log("🌱 Starting Trending Events Seeder...");

  const dbUrl = requireDatabaseUrl();
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client);

  try {
    const allInstitutions = await db.select().from(institutions).limit(50);
    const allProfiles = await db.select().from(userProfiles).limit(100);

    if (allInstitutions.length === 0 || allProfiles.length === 0) {
      console.error("❌ Need institutions and profiles.");
      return;
    }

    const primaryCollege = allInstitutions.find((i) =>
      i.slug?.includes("bit") || i.name?.toLowerCase().includes("technology")
    ) || allInstitutions[0];

    let insertedEventsCount = 0;
    let insertedRegsCount = 0;

    for (const ev of SEED_EVENTS) {
      const organizer = allProfiles[Math.floor(Math.random() * allProfiles.length)];
      const targetInst = primaryCollege;
      const eventId = crypto.randomUUID();

      const startDate = new Date(Date.now() + ev.startDaysFromNow * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + ev.durationHours * 60 * 60 * 1000);
      const regDeadline = new Date(startDate.getTime() - 12 * 60 * 60 * 1000);

      await db
        .insert(events)
        .values({
          id: eventId,
          slug: ev.slug,
          title: ev.title,
          tagline: ev.tagline,
          description: ev.description,
          bannerUrl: ev.bannerUrl,
          clubName: ev.clubName,
          organizerProfileId: organizer.id,
          institutionId: targetInst.id,
          eligibleInstitutionIds: ["ALL"],
          eventType: ev.eventType,
          mode: ev.mode,
          venue: ev.venue,
          startDate,
          endDate,
          registrationDeadline: regDeadline,
          participationType: "SOLO",
          minTeamSize: 1,
          maxTeamSize: 4,
          maxParticipants: 500,
          isPaid: ev.isPaid,
          entryFee: ev.entryFee,
          prizesDescription: ev.prizesDescription,
          perks: ev.perks,
          loopPointsReward: 25,
          status: "PUBLISHED",
          createdAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();

      insertedEventsCount++;

      // Seed registrations
      const attendeePool = allProfiles
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(ev.simulatedAttendees, allProfiles.length));

      for (const attendee of attendeePool) {
        await db
          .insert(eventRegistrations)
          .values({
            id: crypto.randomUUID(),
            eventId: eventId,
            profileId: attendee.id,
            status: "CONFIRMED",
            reminderSet: Math.random() > 0.4,
            registeredAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          })
          .onConflictDoNothing();

        insertedRegsCount++;
      }
    }

    console.log("==========================================");
    console.log(`🎉 Seeded ${insertedEventsCount} trending events with ${insertedRegsCount} student registrations!`);
    console.log("==========================================");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seedTrendingEvents();
