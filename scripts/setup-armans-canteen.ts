import { getDb } from "@/db";
import {
  institutions,
  marketplaceCategories,
  marketplaceOffers,
  merchants,
  products,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { hashMerchantPassword } from "@/lib/marketplace/merchant-password";

async function main() {
  const db = getDb();
  console.log("🏪 Setting up Arman's Night Canteen & Closing other stores...");

  // 1. Mark ALL existing merchants as CLOSED (isOpen: false)
  const closeResult = await db
    .update(merchants)
    .set({
      isOpen: false,
      updatedAt: new Date(),
    })
    .returning({ id: merchants.id, name: merchants.name });

  console.log(`🔒 Closed ${closeResult.length} existing merchants across campus:`);
  closeResult.forEach((m) => console.log(`   - [CLOSED] ${m.name} (${m.id})`));

  // 2. Find BIT Mesra institution explicitly
  let bitm = await db.query.institutions.findFirst({
    where: (inst, { or, eq, ilike }) =>
      or(
        eq(inst.id, "inst_35df75700bb23dd30311ef5f"),
        eq(inst.slug, "bitmesra"),
        eq(inst.slug, "bit-mesra"),
        ilike(inst.name, "%Mesra%")
      ),
  });

  if (!bitm) {
    bitm = await db.query.institutions.findFirst();
  }

  if (!bitm) {
    throw new Error("No institution found to attach Arman's Night Canteen!");
  }

  console.log(`📍 Using Institution: ${bitm.name} (${bitm.id})`);

  // 3. Ensure Food category exists
  let foodCat = await db.query.marketplaceCategories.findFirst({
    where: eq(marketplaceCategories.slug, "food"),
  });

  if (!foodCat) {
    const [createdCat] = await db
      .insert(marketplaceCategories)
      .values({
        name: "Food & Canteens",
        slug: "food",
        icon: "UtensilsCrossed",
        description: "Campus canteens & night messes",
      })
      .returning();
    foodCat = createdCat;
  }

  // 4. Create or Update Arman's Night Canteen
  const canteenSlug = "armans-night-canteen";
  const hashedPassword = await hashMerchantPassword("canteen@password123");

  const existingArman = await db.query.merchants.findFirst({
    where: (m, { or, eq }) =>
      or(eq(m.slug, canteenSlug), eq(m.name, "Arman's Night Canteen")),
  });

  let armanMerchantId: string;

  if (existingArman) {
    console.log(`🔄 Updating existing Arman's Night Canteen (${existingArman.id})...`);
    const [updated] = await db
      .update(merchants)
      .set({
        name: "Arman's Night Canteen",
        slug: canteenSlug,
        institutionId: bitm.id,
        categorySlug: "food",
        verticalType: "FOOD",
        description:
          "CampusLoop's premier late-night canteen. Serving sizzling Maggi, loaded rolls, crispy burgers, night owl combos, and cold brews till 4 AM.",
        logoUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop",
        coverUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=500&fit=crop",
        phone: "9835123456",
        email: "arman.canteen@campusloop.space",
        address: "Hostel 10 & 11 Corner, Night Canteen Plaza, BIT Mesra",
        locationPin: "Main Night Canteen Hub",
        rating: "4.9",
        reviewCount: 248,
        isDeliveryEnabled: true,
        isPickupEnabled: true,
        deliveryRadiusKm: 5,
        deliveryFee: 15,
        minOrderValue: 50,
        freeDeliveryAbove: 199,
        estimatedPrepTime: "12–18 min",
        pickupInstructions:
          "Pick up your hot token order from Arman's main counter at Night Canteen Plaza.",
        status: "ACTIVE",
        isOpen: true, // Only this store is open!
        loginUsername: "arman",
        loginPassword: hashedPassword,
        upiId: "arman.canteen@okhdfcbank",
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, existingArman.id))
      .returning();

    armanMerchantId = updated.id;
  } else {
    console.log("✨ Creating Arman's Night Canteen...");
    const [created] = await db
      .insert(merchants)
      .values({
        id: "merch_armans_night_canteen",
        name: "Arman's Night Canteen",
        slug: canteenSlug,
        institutionId: bitm.id,
        categorySlug: "food",
        verticalType: "FOOD",
        description:
          "CampusLoop's premier late-night canteen. Serving sizzling Maggi, loaded rolls, crispy burgers, night owl combos, and cold brews till 4 AM.",
        logoUrl:
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop",
        coverUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=500&fit=crop",
        phone: "9835123456",
        email: "arman.canteen@campusloop.space",
        address: "Hostel 10 & 11 Corner, Night Canteen Plaza, BIT Mesra",
        locationPin: "Main Night Canteen Hub",
        rating: "4.9",
        reviewCount: 248,
        isDeliveryEnabled: true,
        isPickupEnabled: true,
        deliveryRadiusKm: 5,
        deliveryFee: 15,
        minOrderValue: 50,
        freeDeliveryAbove: 199,
        estimatedPrepTime: "12–18 min",
        pickupInstructions:
          "Pick up your hot token order from Arman's main counter at Night Canteen Plaza.",
        status: "ACTIVE",
        isOpen: true, // Only this store is open!
        loginUsername: "arman",
        loginPassword: hashedPassword,
        upiId: "arman.canteen@okhdfcbank",
      })
      .returning();

    armanMerchantId = created.id;
  }

  console.log(`✅ Arman's Night Canteen ready with ID: ${armanMerchantId} (isOpen: TRUE)`);

  // 5. Clean and re-seed all Night Canteen products under Arman's
  await db.delete(products).where(eq(products.merchantId, armanMerchantId));

  const nightCanteenMenu = [
    // ── 1. Maggi & Midnight Noodles ──
    {
      name: "Plain Butter Maggi",
      price: 35,
      originalPrice: 45,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "8 min",
      description: "Classic double-pack 2-minute Maggi tossed in sizzling Amul butter and canteen masala.",
      imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&h=600&fit=crop",
      addons: [
        { id: "extra_cheese", name: "Extra Grated Cheese Slice", price: 15 },
        { id: "extra_butter", name: "Extra Amul Butter Cube", price: 10 },
      ],
    },
    {
      name: "Cheese Masala Maggi",
      price: 55,
      originalPrice: 70,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "10 min",
      description: "Hot spiced masala Maggi loaded with grated Amul cheese and oregano seasoning.",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=600&fit=crop",
      addons: [
        { id: "peri_seasoning", name: "Peri-Peri Dusting", price: 10 },
        { id: "extra_cheese", name: "Extra Cheese Melt", price: 20 },
      ],
    },
    {
      name: "Double Egg Cheese Maggi",
      price: 75,
      originalPrice: 90,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Maggi cooked with 2 scrambled farm eggs, melted cheese, green chilies & black pepper.",
      imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=600&fit=crop",
      addons: [
        { id: "extra_egg", name: "Add 1 More Egg", price: 15 },
        { id: "extra_cheese", name: "Double Cheese Burst", price: 20 },
      ],
    },
    {
      name: "Peri-Peri Vegetable Maggi",
      price: 60,
      originalPrice: 75,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "10 min",
      description: "Spicy African peri-peri tossed Maggi with sweet corn, onions, capsicum & herbs.",
      imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&h=600&fit=crop",
      addons: [{ id: "extra_cheese", name: "Add Cheese Slice", price: 15 }],
    },
    {
      name: "Schezwan Egg Maggi",
      price: 70,
      originalPrice: 85,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "10 min",
      description: "Wok-tossed Maggi in fiery Schezwan chili paste, crunchy onions, and scrambled egg.",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=600&fit=crop",
    },
    {
      name: "Midnight Fried Maggi (Dry Masala)",
      price: 65,
      originalPrice: 80,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "12 min",
      description: "Pan-fried dry crunchy Maggi noodles tossed with charred onions, garlic, and bhuna masala.",
      imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&h=600&fit=crop",
    },
    {
      name: "Chicken Masala Maggi",
      price: 85,
      originalPrice: 105,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Sizzling Maggi infused with tender shredded masala chicken chunks and fresh coriander.",
      imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=600&fit=crop",
      addons: [
        { id: "extra_chicken", name: "Extra Chicken Chunks", price: 30 },
        { id: "extra_cheese", name: "Add Melted Cheese", price: 15 },
      ],
    },
    {
      name: "Double Chicken Cheese Blast Maggi",
      price: 110,
      originalPrice: 130,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "14 min",
      description: "Overloaded Maggi with shredded chicken, mozzarella-cheddar blend, and Italian herbs.",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=600&fit=crop",
    },
    {
      name: "Veg Hakka Noodles",
      price: 80,
      originalPrice: 100,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "12 min",
      description: "Street-style Chinese wok noodles tossed with shredded cabbage, carrots, bell peppers & soy.",
      imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=600&fit=crop",
    },
    {
      name: "Chicken Schezwan Hakka Noodles",
      price: 120,
      originalPrice: 145,
      categoryName: "Maggi & Noodles 🍜",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "15 min",
      description: "Spicy wok noodles tossed with tender chicken shreds, egg strips, and fiery schezwan sauce.",
      imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=600&fit=crop",
    },

    // ── 2. Rolls, Wraps & Shawarmas ──
    {
      name: "Single Egg Roll",
      price: 45,
      originalPrice: 55,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "8 min",
      description: "Crisp flaky lachha paratha layered with 1 farm egg, sliced red onions, and lemon chaat masala.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Double Egg Roll",
      price: 60,
      originalPrice: 75,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "10 min",
      description: "Flaky paratha double-layered with 2 farm eggs, crunchy onion salad, and tangy mint mayo.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Double Egg Chicken Roll (Arman's Special)",
      price: 95,
      originalPrice: 120,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Arman's signature late-night roll: 2 eggs + juicy spiced chicken strips + secret roll sauce.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
      addons: [
        { id: "extra_cheese", name: "Add Cheese Slice", price: 15 },
        { id: "extra_mayo", name: "Extra Garlic Mayo Dip", price: 10 },
      ],
    },
    {
      name: "Chicken Kathi Roll with Extra Chutney",
      price: 110,
      originalPrice: 135,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Charred boneless chicken chunks wrapped in flaky butter paratha with chili garlic chutney.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Paneer Tikka Butter Roll",
      price: 90,
      originalPrice: 110,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "10 min",
      description: "Marinated paneer cubes grilled on tawa, wrapped with onions, capsicum, and mint sauce.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Crispy Egg Paneer Fusion Roll",
      price: 100,
      originalPrice: 125,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Double egg coated paratha loaded with grilled paneer tikka chunks and tangy sauces.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Spicy Aloo Cheese Roll",
      price: 65,
      originalPrice: 80,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "10 min",
      description: "Crispy seasoned aloo patty with melted cheese, raw onions, and spicy chipotle sauce.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Midnight Chicken Shawarma Roll",
      price: 110,
      originalPrice: 135,
      categoryName: "Rolls & Wraps 🌯",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Juicy shredded chicken cubes with garlic mayo and pickled onions wrapped in rumali bread.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },

    // ── 3. Night Owl Combos & Exam Fuel Platters ──
    {
      name: "Night Owl Combo 1: Double Egg Maggi + Cold Coffee",
      price: 120,
      originalPrice: 150,
      categoryName: "Night Owl Combos 🦉🔥",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "The ultimate midnight study pack: hot double egg cheese Maggi with chilled thick cold coffee.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
    },
    {
      name: "Night Owl Combo 2: Double Chicken Roll + Peri Fries + Soda",
      price: 185,
      originalPrice: 220,
      categoryName: "Night Owl Combos 🦉🔥",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "15 min",
      description: "Satiating late night meal: jumbo chicken roll, hot peri-peri fries, and chilled soda drink.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
    },
    {
      name: "Coder All-Nighter: Cheese Sandwich + KitKat Shake + Red Bull",
      price: 240,
      originalPrice: 290,
      categoryName: "Night Owl Combos 🦉🔥",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "14 min",
      description: "Peak hackathon fuel: grilled cheesy garlic sandwich, thick KitKat shake, and 250ml Red Bull.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
    },
    {
      name: "Hostel Squad Midnight Feast (Feeds 3-4)",
      price: 360,
      originalPrice: 450,
      categoryName: "Night Owl Combos 🦉🔥",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "18 min",
      description: "2 Double Chicken Rolls + 2 Cheese Masala Maggi + 2 Peri-Peri French Fries for the room squad.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
    },
    {
      name: "Pure Veg Midnight Platter",
      price: 170,
      originalPrice: 210,
      categoryName: "Night Owl Combos 🦉🔥",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "15 min",
      description: "Stuffed Paneer Paratha + Plain Butter Maggi + Hot Bournvita / Chai.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop",
    },

    // ── 4. Sandwiches, Burgers & Quick Bites ──
    {
      name: "Grilled Cheese Garlic Sandwich",
      price: 60,
      originalPrice: 75,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "10 min",
      description: "Crispy butter-toasted bread with melted cheddar-mozzarella cheese and garlic herb butter.",
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=600&fit=crop",
    },
    {
      name: "Veg Club Paneer Sandwich",
      price: 80,
      originalPrice: 100,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "12 min",
      description: "3-layered jumbo club sandwich with paneer, cucumber, tomatoes, and spicy green chutney.",
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=600&fit=crop",
    },
    {
      name: "Chicken Mayo Grilled Sandwich",
      price: 95,
      originalPrice: 120,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Creamy shredded chicken, egg mayo, and black pepper grilled to golden crunch.",
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=600&fit=crop",
    },
    {
      name: "Double Egg Bhurji (with 4 Butter Toasts)",
      price: 80,
      originalPrice: 100,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "10 min",
      description: "2 eggs spicy masala bhurji served with 4 crisp golden buttered bread toasts.",
      imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=600&fit=crop",
    },
    {
      name: "Crispy Veg Patty Burger",
      price: 65,
      originalPrice: 80,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "10 min",
      description: "Herb potato patty with lettuce, onion, tomato, and Thousand Island dressing in sesame bun.",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop",
    },
    {
      name: "Crispy Chicken Cheese Burger",
      price: 105,
      originalPrice: 130,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Golden crispy fried chicken patty with melted cheese slice and smoky burger sauce.",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop",
    },
    {
      name: "Peri-Peri French Fries (Large)",
      price: 65,
      originalPrice: 80,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "8 min",
      description: "Crinkle-cut golden fries dusted with fiery African peri-peri spice mix.",
      imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&h=600&fit=crop",
    },
    {
      name: "Crispy Chicken Popcorn (12 pcs)",
      price: 110,
      originalPrice: 135,
      categoryName: "Sandwiches & Burgers 🥪🍔",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "10 min",
      description: "Bite-sized crunchy fried chicken bites served with garlic mayo dip.",
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=600&fit=crop",
    },

    // ── 5. Parathas & Desi Night Cravings ──
    {
      name: "Aloo Pyaz Paratha (with Amul Butter & Pickle)",
      price: 50,
      originalPrice: 65,
      categoryName: "Parathas & Desi Cravings 🫓",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "12 min",
      description: "Tawa paratha stuffed with spiced mashed potatoes & onions, served with butter cube.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Paneer Paratha (with Dahi & Green Chutney)",
      price: 75,
      originalPrice: 95,
      categoryName: "Parathas & Desi Cravings 🫓",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "12 min",
      description: "Fresh grated paneer stuffed paratha cooked with ghee, served with fresh curd and mint dip.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },
    {
      name: "Double Egg Paratha with Spiced Curd",
      price: 65,
      originalPrice: 80,
      categoryName: "Parathas & Desi Cravings 🫓",
      isVeg: false,
      isNonVeg: true,
      preparationTime: "12 min",
      description: "Egg-coated whole wheat paratha served with seasoned curd and pickle.",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=600&fit=crop",
    },

    // ── 6. Hot & Cold Beverages & Energy Drinks ──
    {
      name: "Kadak Masala Chai (Hot)",
      price: 20,
      originalPrice: 25,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "5 min",
      description: "Freshly brewed ginger cardamom cutting tea in kulhad style.",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop",
    },
    {
      name: "Hot Bournvita / Hot Chocolate",
      price: 40,
      originalPrice: 50,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "5 min",
      description: "Steaming full-cream milk with rich chocolate Bournvita malt.",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop",
    },
    {
      name: "Thick Cold Coffee with Chocolate Drizzle",
      price: 60,
      originalPrice: 75,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "6 min",
      description: "Blended rich espresso cold coffee with creamy milk and Hershey's chocolate syrup.",
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&h=600&fit=crop",
    },
    {
      name: "Cold Coffee with Vanilla Ice Cream (Frappe)",
      price: 80,
      originalPrice: 100,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "6 min",
      description: "Thick cold coffee topped with a generous scoop of vanilla ice cream.",
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&h=600&fit=crop",
    },
    {
      name: "Oreo Chocolate Thick Shake",
      price: 85,
      originalPrice: 110,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "8 min",
      description: "Crushed Oreo biscuits blended with chocolate ice cream and chilled milk.",
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=600&fit=crop",
    },
    {
      name: "KitKat Thick Shake",
      price: 95,
      originalPrice: 120,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "8 min",
      description: "KitKat chocolate wafers blended into rich malt shake with choco fudge.",
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=600&fit=crop",
    },
    {
      name: "Red Bull Energy Drink (250ml Can)",
      price: 125,
      originalPrice: 130,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "1 min",
      description: "Chilled 250ml can of Red Bull for late night study sprints.",
      imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&h=600&fit=crop",
    },
    {
      name: "Sting Energy Drink (250ml Bottle)",
      price: 20,
      originalPrice: 25,
      categoryName: "Beverages & Energy Shakes ☕🥤",
      isVeg: true,
      isNonVeg: false,
      preparationTime: "1 min",
      description: "Chilled 250ml bottle of Sting Energy Drink.",
      imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&h=600&fit=crop",
    },
  ];

  let displayOrder = 1;
  for (const item of nightCanteenMenu) {
    await db.insert(products).values({
      merchantId: armanMerchantId,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      categoryName: item.categoryName,
      isVeg: item.isVeg,
      isNonVeg: item.isNonVeg,
      description: item.description,
      imageUrl: item.imageUrl,
      preparationTime: item.preparationTime,
      addons: item.addons || [],
      isAvailable: true,
      status: "ACTIVE",
      displayOrder: displayOrder++,
    });
  }

  console.log(`🍟 Successfully seeded ${nightCanteenMenu.length} night canteen items under Arman's!`);

  // 6. Ensure active promotions/offers for Arman's Night Canteen
  await db.delete(marketplaceOffers).where(eq(marketplaceOffers.merchantId, armanMerchantId));
  await db.insert(marketplaceOffers).values([
    {
      merchantId: armanMerchantId,
      code: "NIGHTOWL20",
      title: "20% OFF Late Night Cravings",
      description: "Use code NIGHTOWL20 on orders above ₹149. Valid 10 PM – 4 AM.",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderValue: 149,
      isActive: true,
    },
    {
      merchantId: armanMerchantId,
      code: "FREEDEL",
      title: "Free Hostel Room Delivery",
      description: "Get free delivery to your hostel on orders above ₹199.",
      discountType: "FREE_DELIVERY",
      discountValue: 15,
      minOrderValue: 199,
      isActive: true,
    },
  ]);

  console.log("🎉 Arman's Night Canteen setup complete!");
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STORE DETAILS:
• Name: Arman's Night Canteen
• Status: ACTIVE & OPEN (Only open store on CampusLoop!)
• Merchant Portal URL: http://localhost:3000/merchant-portal/login
• Username: arman
• Password: canteen@password123
• Total Menu Items: ${nightCanteenMenu.length}
• Offers: 2 active coupons (NIGHTOWL20, FREEDEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error setting up Arman's Night Canteen:", err);
    process.exit(1);
  });
