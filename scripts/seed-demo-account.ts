/**
 * CampusLoop Public Demo Account Provisioning Script
 * ----------------------------------------------------
 * Sets up / refreshes the official public test account:
 * - Email: demo@campusloop.space
 * - Password: CampusLoop@2026!
 * - Verified Flagship Student Hub: Birla Institute of Technology, Mesra (1,350+ Hubs Switchable)
 * - Clout: 450 LP (Gold Star / Verified Blue Tick)
 * - Unrestricted writes: Feeds, Confessions, Polls, Dating Swipe, PeerJS WebRTC Chat/Calls, Market Hubs, Capsule
 *
 * Run: bun run scripts/seed-demo-account.ts
 */
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import { institutionDomains, institutions, userProfiles } from "../src/db/schema";
import { hexclaveServerApp } from "../src/hexclave/server";
import { DEMO_CREDENTIALS } from "../src/lib/demo-credentials";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

export async function seedDemoAccount() {
  const db = getDb();

  // 1. Locate Flagship Institution
  const flagshipInst = await db.query.institutions.findFirst({
    where: eq(institutions.slug, DEMO_CREDENTIALS.institutionSlug),
  });

  if (!flagshipInst) {
    throw new Error(`Flagship institution '${DEMO_CREDENTIALS.institutionSlug}' not found in database.`);
  }

  // 2. Ensure domain 'campusloop.space' is whitelisted for the flagship institution
  const existingDomain = await db.query.institutionDomains.findFirst({
    where: eq(institutionDomains.domain, "campusloop.space"),
  });

  if (!existingDomain) {
    await db.insert(institutionDomains).values({
      institutionId: flagshipInst.id,
      domain: "campusloop.space",
      domainType: "EMAIL",
      verificationStatus: "ADMIN_VERIFIED",
    });
    console.log("✅ Whitelisted 'campusloop.space' domain in institution_domains.");
  } else {
    console.log("ℹ️ Domain 'campusloop.space' is already whitelisted.");
  }

  // 3. Create or Update Hexclave Auth User
  let hexUser = null;
  try {
    const existingHexUsers = await hexclaveServerApp.listUsers({ query: DEMO_CREDENTIALS.email });
    hexUser = existingHexUsers.find((u) => u.primaryEmail?.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase()) || null;
  } catch (err) {
    console.warn("Could not list Hexclave users, attempting creation:", err);
  }

  if (!hexUser) {
    console.log(`Creating Hexclave user for ${DEMO_CREDENTIALS.email}...`);
    hexUser = await hexclaveServerApp.createUser({
      primaryEmail: DEMO_CREDENTIALS.email,
      password: DEMO_CREDENTIALS.password,
      displayName: DEMO_CREDENTIALS.displayName,
      primaryEmailVerified: true,
      primaryEmailAuthEnabled: true,
    });
    console.log(`✅ Created Hexclave Auth User: ${hexUser.id}`);
  } else {
    console.log(`ℹ️ Hexclave Auth User already exists: ${hexUser.id}`);
    try {
      await hexUser.setPassword({ password: DEMO_CREDENTIALS.password });
      console.log("✅ Synchronized demo password in Hexclave.");
    } catch (e: any) {
      console.log("Password sync note:", e?.message || e);
    }
  }

  // 4. Create or Update PostgreSQL User Profile
  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, hexUser.id),
  });

  const demoProfileData = {
    userId: hexUser.id,
    username: DEMO_CREDENTIALS.username,
    displayName: DEMO_CREDENTIALS.displayName,
    officialName: DEMO_CREDENTIALS.officialName,
    email: DEMO_CREDENTIALS.email,
    avatarUrl: DEMO_CREDENTIALS.avatarUrl,
    bannerUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
    institutionId: flagshipInst.id,
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    year: 3,
    gender: "FEMALE" as const,
    bio: "Official CampusLoop Public Demo Account | Full Access Tester & Investor Hub | Feel free to test posting confessions, polls, dating swipe, WebRTC calls & marketplace! 🎓✨",
    headline: "Public Testing Hub · Verified Student Star ⭐",
    interests: ["Tech & Coding", "Startups & AI", "Late Night Tea", "Photography", "Gaming", "Campus Life"],
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
    ],
    datingPreferences: {
      gender: "ALL" as const,
      scope: "GLOBAL" as const,
      sort: "COMPATIBILITY" as const,
      isEnabled: true,
    },
    points: DEMO_CREDENTIALS.points,
    referralCount: 15,
    onboardingCompleted: true,
    role: "STUDENT" as const,
    status: "ACTIVE" as const,
    feedVisibility: "ALL" as const,
  };

  if (!existingProfile) {
    const [created] = await db.insert(userProfiles).values(demoProfileData).returning();
    console.log(`✅ Created Demo User Profile: @${created.username} (ID: ${created.id})`);
  } else {
    await db
      .update(userProfiles)
      .set({
        ...demoProfileData,
        points: DEMO_CREDENTIALS.points,
        onboardingCompleted: true,
        role: "STUDENT",
        institutionId: flagshipInst.id,
      })
      .where(eq(userProfiles.id, existingProfile.id));
    console.log(`✅ Updated Demo User Profile: @${existingProfile.username} (ID: ${existingProfile.id})`);
  }

  // 5. Seed Comprehensive Features & Activities for Demo Account
  try {
    const { seedDemoActivities } = await import("./seed-demo-activities");
    await seedDemoActivities();
  } catch (err) {
    console.warn("Notice: Seed activities encountered a warning:", err);
  }

  console.log("\n=======================================================");
  console.log("🎉 CAMPUSLOOP PUBLIC DEMO ACCOUNT READY FOR SHARING:");
  console.log(`📧 Email:    ${DEMO_CREDENTIALS.email}`);
  console.log(`🔑 Password: ${DEMO_CREDENTIALS.password}`);
  console.log(`🔗 Sign In:  https://campusloop.space/handler/sign-in`);
  console.log(`👥 Referral: https://campusloop.space/join?ref=${DEMO_CREDENTIALS.username}`);
  console.log("=======================================================\n");
}

if (import.meta.main) {
  seedDemoAccount()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to seed demo account:", err);
      process.exit(1);
    });
}
