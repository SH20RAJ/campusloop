import { and, eq, ilike, sql } from "drizzle-orm";
import { getDb } from "../src/db";
import { events, institutions, userProfiles } from "../src/db/schema";

async function seedEvents() {
  console.log("Seeding authentic campus events...");
  const db = getDb();

  // Find a bitmesra profile or fallback
  const bitProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, "sh20raj"),
  });

  const fallbackProfile = bitProfile || (await db.query.userProfiles.findFirst());
  if (!fallbackProfile) {
    console.log("No profile found for seeding events.");
    process.exit(0);
  }

  const bitInst = await db.query.institutions.findFirst({
    where: ilike(institutions.slug, "%bit%"),
  });
  const instId = bitInst ? bitInst.id : fallbackProfile.institutionId;

  const sampleEvents = [
    {
      id: "event_hackbit_2026",
      slug: "hackbit-2026",
      title: "HackBIT 2026 — 36-Hour National Campus Hackathon",
      tagline: "Build the future of Campus AI, Web3 & FinTech. ₹1,50,000 Prize Pool.",
      description:
        "HackBIT 2026 is the flagship annual 36-hour hackathon organized by ACM Student Chapter & Coders Club at BIT Mesra. Over 500+ student developers, designers, and innovators from across India gather to prototype MVPs under the tracks of Generative AI, Campus Networks, Decentralized Systems, and Open Innovation. Mentored by engineers from top tech companies with on-the-spot internship and venture funding opportunities.",
      bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      clubName: "ACM Student Chapter & Coders Club",
      organizerProfileId: fallbackProfile.id,
      institutionId: instId,
      eligibleInstitutionIds: ["ALL"],
      eventType: "HACKATHON",
      mode: "HYBRID",
      venue: "R&D Building & Main Auditorium, BIT Mesra + Discord",
      meetingUrl: "https://discord.gg/campusloop",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      participationType: "BOTH",
      minTeamSize: 1,
      maxTeamSize: 4,
      maxParticipants: 600,
      isPaid: false,
      entryFee: "Free",
      prizesDescription: "₹1,50,000 Cash Pool + Cloud Credits + Exclusive Swags & Verified Clout",
      perks: ["Official ACM Certificate", "Cash Prizes: ₹1.5L", "+50 Loop Points", "Free Food & RedBull", "Internship Opportunities"],
      loopPointsReward: 50,
      status: "PUBLISHED",
    },
    {
      id: "event_roboquest_2026",
      slug: "roboquest-2026",
      title: "RoboQuest & Autonomous Drone Racing Championship",
      tagline: "Design, code, and race line-followers & obstacle-avoiding FPV drones.",
      description:
        "Organized by IEEE Student Branch BIT Mesra. RoboQuest tests precision robotics, PID control algorithms, and edge vision systems. Includes two premier arenas: Line Follower Deathmatch and Indoor FPV Quadcopter Sprint. Hardware kits and testing arenas available 24/7 during practice sessions.",
      bannerUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      clubName: "IEEE Student Branch",
      organizerProfileId: fallbackProfile.id,
      institutionId: instId,
      eligibleInstitutionIds: ["ALL"],
      eventType: "COMPETITION",
      mode: "OFFLINE",
      venue: "Robotics Lab, Workshop Complex, BIT Mesra",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      participationType: "TEAM",
      minTeamSize: 2,
      maxTeamSize: 4,
      maxParticipants: 120,
      isPaid: false,
      entryFee: "Free",
      prizesDescription: "₹45,000 Cash + IEEE Robotics Kit + Winners Trophy",
      perks: ["IEEE Certificate of Excellence", "Robotics Component Kits", "+35 Loop Points"],
      loopPointsReward: 35,
      status: "PUBLISHED",
    },
    {
      id: "event_bitotsav_2026",
      slug: "bitotsav-2026",
      title: "Bitotsav '26 — East India's Largest Inter-College Socio-Cultural Fest",
      tagline: "4 Days of Music, Dance, Battle of Bands, Standup, and Pro-Nights.",
      description:
        "The flagship annual cultural festival of Birla Institute of Technology, Mesra. Featuring 30+ competitive cultural events including Battle of Bands (Rhapsody), Western Solo, Street Play (Nukkad), Fashion Night, and celebrity Pro-Nite performances. Open to verified university students nationwide.",
      bannerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
      clubName: "Music Club, Dance Club & Cultural Society",
      organizerProfileId: fallbackProfile.id,
      institutionId: instId,
      eligibleInstitutionIds: ["ALL"],
      eventType: "FEST",
      mode: "OFFLINE",
      venue: "Main Ground & Gymnasium Auditorium, BIT Mesra",
      startDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
      participationType: "BOTH",
      minTeamSize: 1,
      maxTeamSize: 12,
      maxParticipants: 3500,
      isPaid: false,
      entryFee: "Free for Students",
      prizesDescription: "₹3,00,000 Overall Prize Pool + Pro-Nite VIP Access Passes",
      perks: ["National Cultural Trophy", "Celebrity Artist Passes", "+40 Loop Points", "Official Merchandise"],
      loopPointsReward: 40,
      status: "PUBLISHED",
    },
    {
      id: "event_esummit_2026",
      slug: "esummit-2026",
      title: "E-Summit '26: Campus Founders & Angel Pitch Arena",
      tagline: "Pitch your college startup directly to early-stage VCs and angel investors.",
      description:
        "Hosted by Entrepreneurship Development Cell (EDC). E-Summit connects college student founders with venture capital funds, angel syndicates, and experienced YC/India founders. Features Live Pitching, Product Teardowns, and 1-on-1 Office Hours.",
      bannerUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
      clubName: "Entrepreneurship Development Cell (EDC)",
      organizerProfileId: fallbackProfile.id,
      institutionId: instId,
      eligibleInstitutionIds: ["ALL"],
      eventType: "SEMINAR",
      mode: "HYBRID",
      venue: "Management Auditorium & Zoom Live Stream",
      startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
      registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      participationType: "BOTH",
      minTeamSize: 1,
      maxTeamSize: 5,
      maxParticipants: 400,
      isPaid: false,
      entryFee: "Free",
      prizesDescription: "₹10,00,000 Seed Funding Commitment & Incubation Grants",
      perks: ["Angel Investor Networking", "Incubation Support", "+30 Loop Points", "AWS & OpenAI Credits"],
      loopPointsReward: 30,
      status: "PUBLISHED",
    },
  ];

  for (const ev of sampleEvents) {
    await db
      .insert(events)
      .values(ev)
      .onConflictDoUpdate({
        target: events.id,
        set: ev,
      });
  }

  console.log(`Seeded ${sampleEvents.length} events successfully!`);
  process.exit(0);
}

seedEvents().catch((err) => {
  console.error("Seeding events failed:", err);
  process.exit(1);
});
