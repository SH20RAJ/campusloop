import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadLocalEnv } from "../src/lib/load-env";
import {
  institutions,
  merchants,
  products,
  marketplaceOffers,
  bikes,
} from "../src/db/schema";

loadLocalEnv();

import { getDb } from "../src/db";

async function runSeed() {
  const db = getDb();

  console.log("🌱 Seeding Multi-Vertical Campus Marketplace...");

  // Find BIT Mesra institution
  const bitm = await db.query.institutions.findFirst({
    where: eq(institutions.slug, "bit-mesra"),
  });

  const institutionId = bitm?.id || (await db.query.institutions.findFirst())?.id;
  if (!institutionId) {
    console.error("No institution found to seed marketplace.");
    return;
  }

  console.log(`Using Institution: ${institutionId}`);

  // 1. Food Merchants & Menus
  const foodVendors = [
    {
      name: "Sharma Ji Canteen & Mess",
      slug: "sharma-ji-canteen",
      categorySlug: "food",
      verticalType: "FOOD",
      address: "Near Hostel 7 Mess Lawn, Main Campus",
      locationPin: "Gate 1, Hostel Circle",
      phone: "9876543210",
      email: "sharmaji@campusloop.space",
      rating: "4.8",
      reviewCount: 142,
      deliveryFee: 15,
      minOrderValue: 60,
      estimatedPrepTime: "15–20 min",
      loginUsername: "sharmaji",
      loginPassword: "canteen@password123",
      logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=400&fit=crop",
      products: [
        {
          name: "Double Egg Chicken Roll",
          price: 90,
          originalPrice: 110,
          categoryName: "Rolls & Wraps",
          isVeg: false,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&h=300&fit=crop",
        },
        {
          name: "Paneer Tikka Kathi Roll",
          price: 80,
          originalPrice: 100,
          categoryName: "Rolls & Wraps",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop",
        },
        {
          name: "Midnight Maggi with Double Cheese",
          price: 50,
          originalPrice: 60,
          categoryName: "Hostel Maggi",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&h=300&fit=crop",
        },
        {
          name: "Special North Indian Thali",
          price: 120,
          originalPrice: 140,
          categoryName: "Full Meals",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop",
        },
        {
          name: "Thick Chocolate Cold Coffee",
          price: 45,
          originalPrice: 50,
          categoryName: "Beverages",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&h=300&fit=crop",
        },
      ],
    },
    {
      name: "Momo Nation & Chinese Hut",
      slug: "momo-nation",
      categorySlug: "food",
      verticalType: "FOOD",
      address: "Inner Circle Kiosk 4, Near Sports Complex",
      locationPin: "Sports Ground Corner",
      phone: "9876543211",
      email: "momonation@campusloop.space",
      rating: "4.9",
      reviewCount: 98,
      deliveryFee: 20,
      minOrderValue: 70,
      estimatedPrepTime: "10–15 min",
      loginUsername: "momonation",
      loginPassword: "momo@password123",
      logoUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1000&h=400&fit=crop",
      products: [
        {
          name: "Steamed Darjeeling Veg Momos (8 Pcs)",
          price: 60,
          originalPrice: 70,
          categoryName: "Momos",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=300&fit=crop",
        },
        {
          name: "Fried Chicken Schezwan Momos (8 Pcs)",
          price: 90,
          originalPrice: 110,
          categoryName: "Momos",
          isVeg: false,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1625242661157-e9a059296e8e?w=300&h=300&fit=crop",
        },
        {
          name: "Hakka Veg Chowmein",
          price: 70,
          originalPrice: 85,
          categoryName: "Noodles",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop",
        },
      ],
    },
  ];

  // 2. Supermarket & Mart Merchants & Catalog
  const martVendors = [
    {
      name: "Hostel Daily Mart & Stationery",
      slug: "campus-daily-mart",
      categorySlug: "essentials",
      verticalType: "MART",
      address: "Ground Floor, Student Activity Centre (SAC)",
      locationPin: "SAC Building Door 2",
      phone: "9876543212",
      email: "mart@campusloop.space",
      rating: "4.7",
      reviewCount: 210,
      deliveryFee: 15,
      minOrderValue: 50,
      estimatedPrepTime: "15 min",
      loginUsername: "campusmart",
      loginPassword: "mart@password123",
      logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&h=400&fit=crop",
      products: [
        {
          name: "Classmate Pulse 6-Subject Spiral Notebook",
          price: 140,
          originalPrice: 165,
          categoryName: "Stationery",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=300&fit=crop",
        },
        {
          name: "Reynolds 045 Fine Ball Pens (Pack of 5)",
          price: 50,
          originalPrice: 60,
          categoryName: "Stationery",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1585336261026-41ff91b1516e?w=300&h=300&fit=crop",
        },
        {
          name: "Lay's India's Magic Masala Chips (Family Pack)",
          price: 30,
          originalPrice: 35,
          categoryName: "Snacks",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop",
        },
        {
          name: "Amul Kool Kesar Badam Bottle (180ml)",
          price: 25,
          originalPrice: 30,
          categoryName: "Dairy & Drinks",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop",
        },
        {
          name: "Dettol Original Germ Protection Bar (125g)",
          price: 45,
          originalPrice: 52,
          categoryName: "Toiletries",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1607006314147-f37754b2d56a?w=300&h=300&fit=crop",
        },
        {
          name: "4-Way Spike Buster & Surge Protector Extension Board",
          price: 299,
          originalPrice: 399,
          categoryName: "Dorm Utilities",
          isVeg: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop",
        },
      ],
    },
  ];

  // 3. Bike Rental Vendors
  const rentalVendors = [
    {
      name: "Campus Wheels & E-Bikes",
      slug: "campus-wheels",
      categorySlug: "rentals",
      verticalType: "RENTALS",
      address: "Main Gate Parking Stand, BIT Mesra",
      locationPin: "Security Post Stand",
      phone: "9876543213",
      email: "rentals@campusloop.space",
      rating: "4.9",
      reviewCount: 88,
      deliveryFee: 0,
      minOrderValue: 50,
      estimatedPrepTime: "Instant pickup",
      loginUsername: "campuswheels",
      loginPassword: "bike@password123",
      logoUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1000&h=400&fit=crop",
      bikes: [
        {
          name: "Hero Sprint 21-Speed Mountain Bike",
          model: "Hero Sprint Pro",
          registrationNumber: "CAMPUS-CYCLE-01",
          fuelType: "PETROL",
          hourlyPrice: 20,
          dailyPrice: 99,
          securityDeposit: 300,
          pickupLocation: "Main Gate Bicycle Bay",
          rating: "4.8",
          isAvailable: true,
          helmetIncluded: true,
          imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop",
        },
        {
          name: "Campus Green Electric Scooter",
          model: "Ather 450X Campus Edition",
          registrationNumber: "JH-01-EV-2024",
          fuelType: "ELECTRIC",
          hourlyPrice: 50,
          dailyPrice: 249,
          securityDeposit: 500,
          pickupLocation: "Main Gate Charging Station",
          rating: "4.9",
          isAvailable: true,
          helmetIncluded: true,
          imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop",
        },
      ],
    },
  ];

  // Insert food merchants
  for (const v of foodVendors) {
    const existing = await db.query.merchants.findFirst({
      where: eq(merchants.slug, v.slug),
    });

    let merchantId = existing?.id;

    if (!existing) {
      const [inserted] = await db
        .insert(merchants)
        .values({
          institutionId,
          name: v.name,
          slug: v.slug,
          categorySlug: v.categorySlug,
          verticalType: v.verticalType,
          address: v.address,
          locationPin: v.locationPin,
          phone: v.phone,
          email: v.email,
          rating: v.rating,
          reviewCount: v.reviewCount,
          deliveryFee: v.deliveryFee,
          minOrderValue: v.minOrderValue,
          estimatedPrepTime: v.estimatedPrepTime,
          loginUsername: v.loginUsername,
          loginPassword: v.loginPassword,
          logoUrl: v.logoUrl,
          coverUrl: v.coverUrl,
          status: "ACTIVE",
          isOpen: true,
        })
        .returning();
      merchantId = inserted.id;
      console.log(`Created food merchant: ${v.name} (user: ${v.loginUsername} / pass: ${v.loginPassword})`);
    } else {
      // Update credentials
      await db
        .update(merchants)
        .set({
          loginUsername: v.loginUsername,
          loginPassword: v.loginPassword,
          verticalType: v.verticalType,
        })
        .where(eq(merchants.id, existing.id));
      console.log(`Updated credentials for: ${v.name}`);
    }

    if (merchantId) {
      for (const p of v.products) {
        const existingProd = await db.query.products.findFirst({
          where: eq(products.name, p.name),
        });
        if (!existingProd) {
          await db.insert(products).values({
            merchantId,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            categoryName: p.categoryName,
            isVeg: p.isVeg,
            isAvailable: p.isAvailable,
            imageUrl: p.imageUrl,
            options: [{ name: "Diet", choices: [p.isVeg ? "Veg" : "Non-Veg"], defaultChoice: p.isVeg ? "Veg" : "Non-Veg" }],
            status: "ACTIVE",
          });
        }
      }
    }
  }

  // Insert mart merchants
  for (const m of martVendors) {
    const existing = await db.query.merchants.findFirst({
      where: eq(merchants.slug, m.slug),
    });

    let merchantId = existing?.id;

    if (!existing) {
      const [inserted] = await db
        .insert(merchants)
        .values({
          institutionId,
          name: m.name,
          slug: m.slug,
          categorySlug: m.categorySlug,
          verticalType: m.verticalType,
          address: m.address,
          locationPin: m.locationPin,
          phone: m.phone,
          email: m.email,
          rating: m.rating,
          reviewCount: m.reviewCount,
          deliveryFee: m.deliveryFee,
          minOrderValue: m.minOrderValue,
          estimatedPrepTime: m.estimatedPrepTime,
          loginUsername: m.loginUsername,
          loginPassword: m.loginPassword,
          logoUrl: m.logoUrl,
          coverUrl: m.coverUrl,
          status: "ACTIVE",
          isOpen: true,
        })
        .returning();
      merchantId = inserted.id;
      console.log(`Created mart merchant: ${m.name} (user: ${m.loginUsername} / pass: ${m.loginPassword})`);
    } else {
      await db
        .update(merchants)
        .set({
          loginUsername: m.loginUsername,
          loginPassword: m.loginPassword,
          verticalType: m.verticalType,
        })
        .where(eq(merchants.id, existing.id));
      console.log(`Updated credentials for: ${m.name}`);
    }

    if (merchantId) {
      for (const p of m.products) {
        const existingProd = await db.query.products.findFirst({
          where: eq(products.name, p.name),
        });
        if (!existingProd) {
          await db.insert(products).values({
            merchantId,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            categoryName: p.categoryName,
            isVeg: p.isVeg,
            isAvailable: p.isAvailable,
            imageUrl: p.imageUrl,
            status: "ACTIVE",
          });
        }
      }
    }
  }

  // Insert rental merchants
  for (const r of rentalVendors) {
    const existing = await db.query.merchants.findFirst({
      where: eq(merchants.slug, r.slug),
    });

    let merchantId = existing?.id;

    if (!existing) {
      const [inserted] = await db
        .insert(merchants)
        .values({
          institutionId,
          name: r.name,
          slug: r.slug,
          categorySlug: r.categorySlug,
          verticalType: r.verticalType,
          address: r.address,
          locationPin: r.locationPin,
          phone: r.phone,
          email: r.email,
          rating: r.rating,
          reviewCount: r.reviewCount,
          deliveryFee: r.deliveryFee,
          minOrderValue: r.minOrderValue,
          estimatedPrepTime: r.estimatedPrepTime,
          loginUsername: r.loginUsername,
          loginPassword: r.loginPassword,
          logoUrl: r.logoUrl,
          coverUrl: r.coverUrl,
          status: "ACTIVE",
          isOpen: true,
        })
        .returning();
      merchantId = inserted.id;
      console.log(`Created rental merchant: ${r.name} (user: ${r.loginUsername} / pass: ${r.loginPassword})`);
    } else {
      await db
        .update(merchants)
        .set({
          loginUsername: r.loginUsername,
          loginPassword: r.loginPassword,
          verticalType: r.verticalType,
        })
        .where(eq(merchants.id, existing.id));
      console.log(`Updated credentials for: ${r.name}`);
    }

    if (merchantId) {
      for (const b of r.bikes) {
        const existingBike = await db.query.bikes.findFirst({
          where: eq(bikes.name, b.name),
        });
        if (!existingBike) {
          await db.insert(bikes).values({
            merchantId,
            name: b.name,
            model: b.model,
            registrationNumber: b.registrationNumber,
            hourlyPrice: b.hourlyPrice,
            dailyPrice: b.dailyPrice,
            securityDeposit: b.securityDeposit,
            pickupLocation: b.pickupLocation,
            fuelType: b.fuelType,
            status: "AVAILABLE",
            rating: b.rating,
            imageUrl: b.imageUrl,
            specs: {
              helmetIncluded: b.helmetIncluded,
              notes: "Free helmet and cable lock included.",
            },
          });
        }
      }
    }
  }

  console.log("✅ Multi-vertical campus marketplace seeded successfully!");
}

runSeed().catch((err) => {
  console.error("Failed to seed marketplace:", err);
  process.exit(1);
});
