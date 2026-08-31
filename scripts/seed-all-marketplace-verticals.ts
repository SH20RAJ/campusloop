import { getDb } from "@/db";
import {
  bikes,
  institutions,
  marketplaceCategories,
  marketplaceOffers,
  merchants,
  products,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("🌱 Seeding All Campus Marketplace Verticals for BIT Mesra...");

  // 1. Find BIT Mesra institution
  let bitm = await db.query.institutions.findFirst({
    where: (inst, { or, eq, ilike }) =>
      or(eq(inst.slug, "bit-mesra"), eq(inst.slug, "bitmesra"), ilike(inst.name, "%Birla Institute of Technology%")),
  });

  if (!bitm) {
    console.log("Creating BIT Mesra institution row...");
    const [created] = await db
      .insert(institutions)
      .values({
        aisheCode: "U-0265",
        name: "Birla Institute of Technology, Mesra",
        slug: "bit-mesra",
        state: "Jharkhand",
        district: "Ranchi",
        website: "https://www.bitmesra.ac.in",
        websiteDomain: "bitmesra.ac.in",
        yearOfEstablishment: 1955,
        locationType: "Rural/Suburban Campus",
        logoUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop",
        country: "India",
        source: "seed",
      })
      .returning();
    bitm = created;
  }

  const institutionId = bitm.id;
  console.log(`Using Institution ID: ${institutionId} (${bitm.name})`);

  // 2. Ensure Marketplace Categories exist
  const categoriesToSeed = [
    { name: "Food & Canteens", slug: "food", icon: "UtensilsCrossed", description: "Campus canteens & night messes" },
    { name: "Supermarket & Mart", slug: "supermarket", icon: "ShoppingBag", description: "Hostel snacks & stationery" },
    { name: "Bike & EV Rentals", slug: "rentals", icon: "Bike", description: "Cycles & scooters on rent" },
    { name: "Barber & Salon", slug: "barber", icon: "Scissors", description: "Haircut, beard & salon grooming" },
    { name: "Laundry & Wash", slug: "laundry", icon: "Shirt", description: "Hostel laundry express & dry cleaning" },
    { name: "Water Delivery", slug: "water", icon: "Droplet", description: "20L chilled RO water jar to hostel room" },
  ];

  for (const cat of categoriesToSeed) {
    const existing = await db.query.marketplaceCategories.findFirst({
      where: eq(marketplaceCategories.slug, cat.slug),
    });
    if (!existing) {
      await db.insert(marketplaceCategories).values({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
      });
    }
  }

  // 3. Merchants Data Definition
  const merchantsData = [
    // ─── FOOD 1 ───
    {
      name: "Sharma Ji Canteen & Mess",
      slug: "sharma-ji-canteen",
      categorySlug: "food",
      verticalType: "FOOD",
      address: "Near Hostel 7 Mess Lawn, BIT Mesra",
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
          isPopular: true,
          description: "Crispy lachha paratha layered with 2 farm eggs & tender spiced chicken strips",
          imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&h=300&fit=crop",
        },
        {
          name: "Paneer Butter Masala Thali",
          price: 130,
          originalPrice: 150,
          categoryName: "Thali & Meals",
          isVeg: true,
          isPopular: true,
          description: "Served with 4 butter tawa rotis, dal tadka, jeera rice, salad & gulab jamun",
          imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
        },
        {
          name: "Cheese Maggi Double Masala",
          price: 60,
          originalPrice: 70,
          categoryName: "Midnight Bites",
          isVeg: true,
          isPopular: false,
          description: "Double seasoning maggi noodles topped with melted Amul mozzarella blend",
          imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&h=300&fit=crop",
        },
        {
          name: "Chilled Badam Milk Shake",
          price: 50,
          originalPrice: 60,
          categoryName: "Beverages",
          isVeg: true,
          isPopular: false,
          description: "Thick creamy saffron-infused milk topped with roasted almonds",
          imageUrl: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop",
        },
      ],
      offers: [{ title: "FLAT 20% OFF on Orders > ₹199", code: "CAMPUS20", discountPercentage: 20 }],
    },

    // ─── FOOD 2 ───
    {
      name: "Momo Nation & Fast Food",
      slug: "momo-nation",
      categorySlug: "food",
      verticalType: "FOOD",
      address: "Inner Circle Market, Near ICICI ATM, BIT Mesra",
      locationPin: "Shop #4, Student Square",
      phone: "9876543211",
      email: "momonation@campusloop.space",
      rating: "4.7",
      reviewCount: 98,
      deliveryFee: 15,
      minOrderValue: 50,
      estimatedPrepTime: "10–15 min",
      loginUsername: "momonation",
      loginPassword: "momo@password123",
      logoUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1000&h=400&fit=crop",
      products: [
        {
          name: "Crispy Kurkure Veg Momos (8 Pcs)",
          price: 110,
          originalPrice: 130,
          categoryName: "Fried & Kurkure",
          isVeg: true,
          isPopular: true,
          description: "Crunchy crumb-coated steamed momos served with fiery garlic chutney & mayo",
          imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop",
        },
        {
          name: "Steamed Chicken Darjeeling Momos",
          price: 100,
          originalPrice: 120,
          categoryName: "Steamed Classics",
          isVeg: false,
          isPopular: true,
          description: "Authentic thin-wrapper juicy minced chicken momos with hot soup",
          imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
        },
        {
          name: "Chilli Garlic Fried Rice + Manchurian",
          price: 140,
          originalPrice: 160,
          categoryName: "Combos",
          isVeg: true,
          isPopular: false,
          description: "Wok-tossed spicy rice served with gravy veg balls",
          imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
        },
      ],
      offers: [{ title: "FREE Mayo + Extra Chutney on all orders", code: "FREEMAYO", discountPercentage: 10 }],
    },

    // ─── SUPERMARKET ───
    {
      name: "Campus Supermart & Stationery",
      slug: "campus-supermart",
      categorySlug: "supermarket",
      verticalType: "SUPERMARKET",
      address: "Hostel 6 Commercial Complex, BIT Mesra",
      locationPin: "Ground Floor, Complex Wing",
      phone: "9876543212",
      email: "supermart@campusloop.space",
      rating: "4.9",
      reviewCount: 210,
      deliveryFee: 10,
      minOrderValue: 40,
      estimatedPrepTime: "10–15 min",
      loginUsername: "campusmart",
      loginPassword: "mart@password123",
      logoUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&h=400&fit=crop",
      products: [
        {
          name: "Classmate Notebook 6-Subject (300 Pgs)",
          price: 160,
          originalPrice: 190,
          categoryName: "Stationery",
          isVeg: true,
          isPopular: true,
          description: "Spiral-bound ruled notebook ideal for college semester lecture notes",
          imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop",
        },
        {
          name: "Dettol Anti-Bacterial Body Wash 250ml",
          price: 145,
          originalPrice: 175,
          categoryName: "Toiletries",
          isVeg: true,
          isPopular: false,
          description: "Refreshing original pine fragrance for hostel daily bathing",
          imageUrl: "https://images.unsplash.com/photo-1608248597359-3993132e4d07?w=400&h=300&fit=crop",
        },
        {
          name: "Cadbury Dairy Milk Silk Hazelnut (143g)",
          price: 170,
          originalPrice: 195,
          categoryName: "Snacks & Munchies",
          isVeg: true,
          isPopular: true,
          description: "Rich silky chocolate loaded with whole roasted turkish hazelnuts",
          imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop",
        },
      ],
      offers: [{ title: "FLAT ₹30 OFF on Stationery Kits", code: "STATIONERY30", discountPercentage: 15 }],
    },

    // ─── RENTALS SHOP 1 (Bicycles & Cycles) ───
    {
      name: "CampusWheels Cycle & EV Rentals",
      slug: "campus-wheels-rentals",
      categorySlug: "rentals",
      verticalType: "RENTALS",
      address: "Main Security Gate 1 Bicycle Depot, BIT Mesra",
      locationPin: "Gate 1 Parking Lot",
      phone: "9876543213",
      email: "campuswheels@campusloop.space",
      rating: "4.8",
      reviewCount: 88,
      deliveryFee: 0,
      minOrderValue: 20,
      estimatedPrepTime: "Instant Unlock",
      loginUsername: "campuswheels",
      loginPassword: "bike@password123",
      logoUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1000&h=400&fit=crop",
      products: [],
      offers: [{ title: "Zero Security Deposit for 50+ LP Verified Students", code: "LPVERIFIED", discountPercentage: 10 }],
    },

    // ─── RENTALS SHOP 2 (Scooters & EV Hub) ───
    {
      name: "SpeedyScoot Rentals & EV Hub",
      slug: "speedy-scoot-rentals",
      categorySlug: "rentals",
      verticalType: "RENTALS",
      address: "Hostel 10 Depot & R&D Gate, BIT Mesra",
      locationPin: "Hostel 10 Bay",
      phone: "9876543214",
      email: "speedyscoot@campusloop.space",
      rating: "4.9",
      reviewCount: 115,
      deliveryFee: 0,
      minOrderValue: 50,
      estimatedPrepTime: "Instant Unlock",
      loginUsername: "speedyscoot",
      loginPassword: "scoot@password123",
      logoUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1000&h=400&fit=crop",
      products: [],
      offers: [{ title: "Weekend 24-Hr Pack: Only ₹350/Day", code: "WEEKEND350", discountPercentage: 20 }],
    },

    // ─── BARBER & SALON ───
    {
      name: "BIT Campus Salon & Cuts",
      slug: "campus-salon-cuts",
      categorySlug: "barber",
      verticalType: "BARBER",
      address: "Shop #2, Shopping Complex near Post Office, BIT Mesra",
      locationPin: "Near SBI Branch",
      phone: "9876543215",
      email: "salon@campusloop.space",
      rating: "4.8",
      reviewCount: 165,
      deliveryFee: 0,
      minOrderValue: 50,
      estimatedPrepTime: "10 min wait",
      loginUsername: "campuscuts",
      loginPassword: "salon@password123",
      logoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&h=400&fit=crop",
      products: [
        {
          name: "Classic Student Haircut",
          price: 70,
          originalPrice: 90,
          categoryName: "Hair Grooming",
          isVeg: true,
          isPopular: true,
          description: "Professional scissors & clipper cut with hair wash and styling gel",
          imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop",
        },
        {
          name: "Beard Trim & Razor Sharp Lineup",
          price: 50,
          originalPrice: 65,
          categoryName: "Beard & Shave",
          isVeg: true,
          isPopular: true,
          description: "Precision beard shaping with hot towel and aftershave splash",
          imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop",
        },
        {
          name: "Haircut + Beard Combo Package",
          price: 110,
          originalPrice: 155,
          categoryName: "Combos",
          isVeg: true,
          isPopular: true,
          description: "Complete full grooming combo with neck massage",
          imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
        },
        {
          name: "Herbal Oil Head Massage (Champi)",
          price: 60,
          originalPrice: 80,
          categoryName: "Relaxation",
          isVeg: true,
          isPopular: false,
          description: "15-minute soothing stress-buster Ayurvedic head champi",
          imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=300&fit=crop",
        },
        {
          name: "Face De-Tan & Charcoal Clean-up",
          price: 150,
          originalPrice: 200,
          categoryName: "Skin Care",
          isVeg: true,
          isPopular: false,
          description: "Deep pore cleansing, blackhead removal and cooling aloe mask",
          imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
        },
      ],
      offers: [{ title: "Student Wednesday: 20% OFF all haircut combos", code: "WED20", discountPercentage: 20 }],
    },

    // ─── LAUNDRY & WASH ───
    {
      name: "Dhobi Express Campus Laundry",
      slug: "dhobi-express-laundry",
      categorySlug: "laundry",
      verticalType: "LAUNDRY",
      address: "Backside Hostel 4 & 5 Road, BIT Mesra",
      locationPin: "Hostel 5 Laundry Deck",
      phone: "9876543216",
      email: "laundry@campusloop.space",
      rating: "4.7",
      reviewCount: 190,
      deliveryFee: 10,
      minOrderValue: 60,
      estimatedPrepTime: "24-hr turnaround",
      loginUsername: "dhobiexpress",
      loginPassword: "laundry@password123",
      logoUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1000&h=400&fit=crop",
      products: [
        {
          name: "Wash & Fold (Per KG)",
          price: 35,
          originalPrice: 45,
          categoryName: "Wash & Fold",
          isVeg: true,
          isPopular: true,
          description: "Machine wash with premium detergent & fabric conditioner, neatly folded",
          imageUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop",
        },
        {
          name: "Steam Ironing (Per Pair - Shirt + Pant)",
          price: 12,
          originalPrice: 15,
          categoryName: "Steam Iron",
          isVeg: true,
          isPopular: true,
          description: "Crisp industrial steam pressing with crease line retention",
          imageUrl: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&h=300&fit=crop",
        },
        {
          name: "Semester 5-KG Complete Wash + Iron Bundle",
          price: 220,
          originalPrice: 280,
          categoryName: "Value Bundles",
          isVeg: true,
          isPopular: true,
          description: "Up to 15-20 clothes washed, conditioned and steam pressed",
          imageUrl: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop",
        },
        {
          name: "Hostel Bedsheet + Pillow Cover Wash",
          price: 45,
          originalPrice: 60,
          categoryName: "Bedding",
          isVeg: true,
          isPopular: false,
          description: "Heavy single/double bedsheet with 2 pillow covers sanitized and ironed",
          imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop",
        },
        {
          name: "Blazer & Suit Dry Cleaning",
          price: 130,
          originalPrice: 180,
          categoryName: "Dry Cleaning",
          isVeg: true,
          isPopular: false,
          description: "Professional dry clean with lint removal and garment bag packing",
          imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=300&fit=crop",
        },
      ],
      offers: [{ title: "FREE Hostel Pickup on orders above 4 KG", code: "PICKUPFREE", discountPercentage: 15 }],
    },

    // ─── WATER DELIVERY ───
    {
      name: "AquaPure Campus Water Supply",
      slug: "aquapure-water-supply",
      categorySlug: "water",
      verticalType: "WATER",
      address: "Main RO Plant Depot near Hostel 1, BIT Mesra",
      locationPin: "Hostel 1 Junction",
      phone: "9876543217",
      email: "water@campusloop.space",
      rating: "4.9",
      reviewCount: 310,
      deliveryFee: 0,
      minOrderValue: 25,
      estimatedPrepTime: "15–25 min to room",
      loginUsername: "aquapure",
      loginPassword: "water@password123",
      logoUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&h=300&fit=crop",
      coverUrl: "https://images.unsplash.com/photo-1527199768775-bdabf3b310b4?w=1000&h=400&fit=crop",
      products: [
        {
          name: "20L Chilled RO Drinking Water Jar",
          price: 30,
          originalPrice: 35,
          categoryName: "Water Jars",
          isVeg: true,
          isPopular: true,
          description: "Fresh chilled RO water jar delivered directly to your hostel room floor",
          imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&h=300&fit=crop",
        },
        {
          name: "20L Normal Room-Temp Mineral Water Jar",
          price: 25,
          originalPrice: 30,
          categoryName: "Water Jars",
          isVeg: true,
          isPopular: true,
          description: "7-stage purified mineral water jar with tamper-proof seal",
          imageUrl: "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=300&fit=crop",
        },
        {
          name: "Manual Water Dispenser Hand Pump",
          price: 80,
          originalPrice: 120,
          categoryName: "Accessories",
          isVeg: true,
          isPopular: false,
          description: "Easy push manual pump compatible with all 20L standard cans",
          imageUrl: "https://images.unsplash.com/photo-1559839914-ba2a0f8eb847?w=400&h=300&fit=crop",
        },
        {
          name: "Monthly Water Subscription (10 Jars Pass)",
          price: 240,
          originalPrice: 300,
          categoryName: "Subscription",
          isVeg: true,
          isPopular: true,
          description: "Save ₹60 with a 10-can digital coupon pass valid for the whole semester",
          imageUrl: "https://images.unsplash.com/photo-1527199768775-bdabf3b310b4?w=400&h=300&fit=crop",
        },
      ],
      offers: [{ title: "Instant Delivery in under 25 mins to any Hostel Floor", code: "FASTWATER", discountPercentage: 10 }],
    },
  ];

  // 4. Insert / Update Merchants & Products
  for (const m of merchantsData) {
    console.log(`Processing merchant: ${m.name} (${m.verticalType})...`);

    // Check if merchant already exists by slug
    let merchant = await db.query.merchants.findFirst({
      where: eq(merchants.slug, m.slug),
    });

    if (!merchant) {
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
      merchant = inserted;
    } else {
      // Update vertical, credentials and institutionId
      await db
        .update(merchants)
        .set({
          institutionId,
          verticalType: m.verticalType,
          loginUsername: m.loginUsername,
          loginPassword: m.loginPassword,
          categorySlug: m.categorySlug,
          status: "ACTIVE",
          isOpen: true,
        })
        .where(eq(merchants.id, merchant.id));
    }

    // Insert Products
    for (const p of m.products) {
      const existingProduct = await db.query.products.findFirst({
        where: (prod, { and, eq }) => and(eq(prod.merchantId, merchant!.id), eq(prod.name, p.name)),
      });

      if (!existingProduct) {
        await db.insert(products).values({
          merchantId: merchant.id,
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          categoryName: p.categoryName,
          imageUrl: p.imageUrl,
          isVeg: p.isVeg,
          isPopular: p.isPopular,
          status: "ACTIVE",
          isAvailable: true,
        });
      }
    }

    // Insert Offers
    for (const o of m.offers) {
      const existingOffer = await db.query.marketplaceOffers.findFirst({
        where: (off, { and, eq }) => and(eq(off.merchantId, merchant!.id), eq(off.code, o.code)),
      });

      if (!existingOffer) {
        await db.insert(marketplaceOffers).values({
          merchantId: merchant.id,
          title: o.title,
          code: o.code,
          discountValue: o.discountPercentage || 20,
          discountType: "PERCENTAGE",
          isActive: true,
        });
      }
    }
  }

  // 5. Seed Multi-Store Rental Fleet (Cycles & Scooters)
  console.log("Seeding Fleet for Rental Hubs...");
  const wheelsMerchant = await db.query.merchants.findFirst({
    where: eq(merchants.slug, "campus-wheels-rentals"),
  });
  const scootMerchant = await db.query.merchants.findFirst({
    where: eq(merchants.slug, "speedy-scoot-rentals"),
  });

  if (wheelsMerchant) {
    const cycleFleet = [
      {
        name: "Hero Sprint Pro 21-Speed Gear Cycle #01",
        model: "Sprint Pro 21S",
        registrationNumber: "BIT-CY-01",
        hourlyPrice: 20,
        dailyPrice: 120,
        securityDeposit: 200,
        fuelType: "PETROL", // Treated as manual/pedal
        pickupLocation: "Main Security Gate 1 Bicycle Depot",
        imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=400&fit=crop",
      },
      {
        name: "Firefox Target Mountain Bike #02",
        model: "Target 29er MTB",
        registrationNumber: "BIT-CY-02",
        hourlyPrice: 25,
        dailyPrice: 150,
        securityDeposit: 250,
        fuelType: "PETROL",
        pickupLocation: "Main Security Gate 1 Bicycle Depot",
        imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&h=400&fit=crop",
      },
      {
        name: "Hero Lectro Electric Pedal Assist Cycle #03",
        model: "Lectro C5 E-Bike",
        registrationNumber: "BIT-EB-03",
        hourlyPrice: 35,
        dailyPrice: 200,
        securityDeposit: 400,
        fuelType: "ELECTRIC",
        pickupLocation: "Main Security Gate 1 Depot",
        imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop",
      },
    ];

    for (const b of cycleFleet) {
      const existingBike = await db.query.bikes.findFirst({
        where: eq(bikes.registrationNumber, b.registrationNumber),
      });
      if (!existingBike) {
        await db.insert(bikes).values({
          merchantId: wheelsMerchant.id,
          name: b.name,
          model: b.model,
          registrationNumber: b.registrationNumber,
          hourlyPrice: b.hourlyPrice,
          dailyPrice: b.dailyPrice,
          securityDeposit: b.securityDeposit,
          pickupLocation: b.pickupLocation,
          fuelType: b.fuelType,
          imageUrl: b.imageUrl,
          status: "AVAILABLE",
          specs: { helmetIncluded: true, fuelLevel: "100%", notes: "Zero deposit for verified students" },
        });
      }
    }
  }

  if (scootMerchant) {
    const scootFleet = [
      {
        name: "Ather 450X Gen 3 Fast EV Scooter #01",
        model: "Ather 450X Gen 3",
        registrationNumber: "JH-01-EV-1024",
        hourlyPrice: 70,
        dailyPrice: 450,
        securityDeposit: 1000,
        fuelType: "ELECTRIC",
        pickupLocation: "Hostel 10 Depot & Charging Bay",
        imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop",
      },
      {
        name: "Honda Activa 6G Scooter #02",
        model: "Activa 6G 110cc",
        registrationNumber: "JH-01-AX-9921",
        hourlyPrice: 60,
        dailyPrice: 400,
        securityDeposit: 800,
        fuelType: "PETROL",
        pickupLocation: "Hostel Circle Depot (Near H-10)",
        imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=400&fit=crop",
      },
      {
        name: "TVS Ntorq 125 Race Edition #03",
        model: "Ntorq 125 Fi",
        registrationNumber: "JH-01-NT-4081",
        hourlyPrice: 65,
        dailyPrice: 420,
        securityDeposit: 900,
        fuelType: "PETROL",
        pickupLocation: "Hostel 10 Hub",
        imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&h=400&fit=crop",
      },
    ];

    for (const b of scootFleet) {
      const existingBike = await db.query.bikes.findFirst({
        where: eq(bikes.registrationNumber, b.registrationNumber),
      });
      if (!existingBike) {
        await db.insert(bikes).values({
          merchantId: scootMerchant.id,
          name: b.name,
          model: b.model,
          registrationNumber: b.registrationNumber,
          hourlyPrice: b.hourlyPrice,
          dailyPrice: b.dailyPrice,
          securityDeposit: b.securityDeposit,
          pickupLocation: b.pickupLocation,
          fuelType: b.fuelType,
          imageUrl: b.imageUrl,
          status: "AVAILABLE",
          specs: { helmetIncluded: true, fuelLevel: "Full Tank / 100% Charged", notes: "Helmet included in trunk" },
        });
      }
    }
  }

  console.log("✅ All Campus Marketplace Verticals, Merchants, Fleets & Services Seeded Successfully!");
}

main().catch(console.error);
