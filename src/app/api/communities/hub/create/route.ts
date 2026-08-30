import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  academicResources,
  gamingLobbies,
  housingListings,
  lostAndFoundItems,
  marketplaceItems,
  ridesharePools,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const institutionId = profile.institutionId;
    if (!institutionId) {
      return NextResponse.json({ error: "College institution required" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      hubType?: string;
      [key: string]: any;
    };
    const { hubType, ...data } = body;

    if (!hubType) {
      return NextResponse.json({ error: "hubType is required" }, { status: 400 });
    }

    switch (hubType) {
      case "lost_found": {
        const [item] = await db
          .insert(lostAndFoundItems)
          .values({
            institutionId,
            authorId: profile.id,
            type: data.type || "LOST",
            title: data.title,
            description: data.description || "",
            category: data.category || "Other",
            location: data.location || "Campus",
            itemDate: data.itemDate || new Date().toISOString().split("T")[0],
            imageUrl: data.imageUrl || null,
            contactInfo: data.contactInfo || `@${profile.username}`,
            reward: data.reward || null,
          })
          .returning();
        return NextResponse.json({ success: true, item });
      }

      case "marketplace": {
        const [item] = await db
          .insert(marketplaceItems)
          .values({
            institutionId,
            sellerId: profile.id,
            title: data.title,
            description: data.description || "",
            price: Math.max(0, parseInt(data.price, 10) || 0),
            originalPrice: data.originalPrice ? parseInt(data.originalPrice, 10) : null,
            condition: data.condition || "GOOD",
            category: data.category || "Other",
            hostelLocation: data.hostelLocation || "Campus",
            isNegotiable: data.isNegotiable !== false,
            images: data.images ? JSON.stringify(data.images) : null,
          })
          .returning();
        return NextResponse.json({ success: true, item });
      }

      case "gaming": {
        const [lobby] = await db
          .insert(gamingLobbies)
          .values({
            institutionId,
            hostId: profile.id,
            gameName: data.gameName || "Valorant",
            title: data.title,
            description: data.description || "",
            mode: data.mode || "5v5",
            rankTier: data.rankTier || null,
            gamerTag: data.gamerTag || profile.username,
            slotsTotal: Math.max(2, parseInt(data.slotsTotal, 10) || 5),
            slotsFilled: 1,
            discordOrVoiceUrl: data.discordOrVoiceUrl || null,
            scheduledAt: data.scheduledAt || "Now",
            players: JSON.stringify([
              {
                userId: profile.id,
                username: profile.username,
                displayName: profile.displayName,
                role: "Host",
              },
            ]),
          })
          .returning();
        return NextResponse.json({ success: true, item: lobby });
      }

      case "rideshare": {
        const [ride] = await db
          .insert(ridesharePools)
          .values({
            institutionId,
            creatorId: profile.id,
            origin: data.origin || "Campus Gate",
            destination: data.destination,
            departureTime: data.departureTime || "Soon",
            vehicleType: data.vehicleType || "AUTO",
            totalSeats: Math.max(1, parseInt(data.totalSeats, 10) || 4),
            availableSeats: Math.max(1, parseInt(data.availableSeats, 10) || 3),
            pricePerSeat: Math.max(0, parseInt(data.pricePerSeat, 10) || 50),
            contactInfo: data.contactInfo || `@${profile.username}`,
            notes: data.notes || "",
            passengers: JSON.stringify([
              {
                userId: profile.id,
                displayName: profile.displayName,
                seats: 1,
              },
            ]),
          })
          .returning();
        return NextResponse.json({ success: true, item: ride });
      }

      case "housing": {
        const [flat] = await db
          .insert(housingListings)
          .values({
            institutionId,
            authorId: profile.id,
            title: data.title,
            description: data.description || "",
            location: data.location || "Near Campus",
            distanceFromCampus: data.distanceFromCampus || "5 min walk",
            rentPerMonth: Math.max(0, parseInt(data.rentPerMonth, 10) || 0),
            deposit: data.deposit ? parseInt(data.deposit, 10) : null,
            occupancyType: data.occupancyType || "SINGLE_ROOM",
            genderPreference: data.genderPreference || "ANY",
            amenities: data.amenities ? JSON.stringify(data.amenities) : null,
            contactInfo: data.contactInfo || `@${profile.username}`,
          })
          .returning();
        return NextResponse.json({ success: true, item: flat });
      }

      case "academics": {
        const [resource] = await db
          .insert(academicResources)
          .values({
            institutionId,
            uploaderId: profile.id,
            title: data.title,
            description: data.description || "",
            subjectCode: data.subjectCode || "GEN101",
            subjectName: data.subjectName || data.title,
            branch: data.branch || "All",
            semester: Math.max(1, parseInt(data.semester, 10) || 1),
            resourceType: data.resourceType || "NOTES",
            fileUrl: data.fileUrl || null,
            driveUrl: data.driveUrl || null,
          })
          .returning();
        return NextResponse.json({ success: true, item: resource });
      }

      default:
        return NextResponse.json({ error: "Invalid hubType" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/communities/hub/create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
