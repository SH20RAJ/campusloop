import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

// ─── 1. Marketplace Categories ───
export const marketplaceCategories = pgTable("marketplace_categories", {
  id: id(),
  name: text("name").notNull(), // e.g. "Food & Beverages", "Campus Essentials", "Vehicle Rentals", "Local Services"
  slug: text("slug").notNull().unique(), // e.g. "food", "essentials", "rentals", "services", "activities", "deals"
  icon: text("icon").notNull(), // Lucide icon identifier or emoji
  description: text("description"),
  parentId: text("parent_id"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt,
  updatedAt,
});

// ─── 2. Merchants (Local Campus Businesses) ───
export const merchants = pgTable("merchants", {
  id: id(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Momo House", "Sharma Ji Canteen"
  slug: text("slug").notNull(),
  categorySlug: text("category_slug").notNull().default("food"), // "food", "essentials", "services", "rentals", "activities"
  description: text("description"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  phone: text("phone"),
  email: text("email"),
  address: text("address").notNull(), // e.g. "Main Road near Gate 1, BIT Mesra"
  locationPin: text("location_pin"), // e.g. "250m from Inner Circle"
  rating: text("rating").default("4.7").notNull(),
  reviewCount: integer("review_count").default(24).notNull(),
  
  // Delivery & Fulfillment Configuration
  isDeliveryEnabled: boolean("is_delivery_enabled").default(true).notNull(),
  isPickupEnabled: boolean("is_pickup_enabled").default(true).notNull(),
  deliveryRadiusKm: integer("delivery_radius_km").default(3).notNull(),
  deliveryFee: integer("delivery_fee").default(20).notNull(), // in Rupees
  minOrderValue: integer("min_order_value").default(80).notNull(), // in Rupees
  freeDeliveryAbove: integer("free_delivery_above").default(299),
  estimatedPrepTime: text("estimated_prep_time").default("15–25 min").notNull(),
  pickupInstructions: text("pickup_instructions").default("Collect from the main counter by showing your order number."),
  
  // Status: DRAFT, PENDING_REVIEW, ACTIVE, PAUSED, SUSPENDED, CLOSED
  status: text("status").default("ACTIVE").notNull(),
  isOpen: boolean("is_open").default(true).notNull(), // Merchant toggle (Open/Busy/Closed)
  
  // Banking / Settlement
  upiId: text("upi_id"),
  bankAccountDetails: jsonb("bank_account_details"),
  
  createdAt,
  updatedAt,
});

// ─── 3. Merchant Users & Staff Roles ───
export const merchantUsers = pgTable("merchant_users", {
  id: id(),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  role: text("role").default("OWNER").notNull(), // "OWNER", "MANAGER", "STAFF", "DELIVERY"
  createdAt,
  updatedAt,
});

// ─── 4. Merchant Business Hours ───
export const merchantBusinessHours = pgTable("merchant_business_hours", {
  id: id(),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 (Sun) - 6 (Sat)
  openTime: text("open_time").default("09:00").notNull(),
  closeTime: text("close_time").default("23:00").notNull(),
  isClosed: boolean("is_closed").default(false).notNull(),
});

// ─── 5. Products & Offerings ───
export const products = pgTable("products", {
  id: id(),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  categoryId: text("category_id"), // Subcategory inside the store
  categoryName: text("category_name").default("Popular Items").notNull(), // e.g. "Momos", "Beverages", "Combos", "Daily Rentals"
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: integer("price").notNull(), // in Rupees
  originalPrice: integer("original_price"), // in Rupees
  preparationTime: text("preparation_time").default("15 min"),
  isAvailable: boolean("is_available").default(true).notNull(),
  status: text("status").default("ACTIVE").notNull(), // "ACTIVE", "DRAFT", "OUT_OF_STOCK", "HIDDEN", "ARCHIVED"
  
  // Customization Options (e.g. Spice level, Size) and Add-ons (e.g. Extra Chutney, Cheese)
  options: jsonb("options").$type<Array<{ name: string; choices: string[]; defaultChoice?: string }>>().default([]),
  addons: jsonb("addons").$type<Array<{ id: string; name: string; price: number }>>().default([]),
  
  // Fulfillment Modes: ["delivery", "pickup", "booking"]
  fulfillmentModes: jsonb("fulfillment_modes").$type<string[]>().default(["delivery", "pickup"]).notNull(),
  
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt,
  updatedAt,
});

// ─── 6. Marketplace Orders ───
export const marketplaceOrders = pgTable("marketplace_orders", {
  id: id(),
  orderNumber: text("order_number").notNull().unique(), // e.g. "CL-1042"
  studentId: text("student_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  categorySlug: text("category_slug").default("food").notNull(),
  
  fulfillmentType: text("fulfillment_type").default("DELIVERY").notNull(), // "DELIVERY", "PICKUP", "BOOKING"
  
  // State Machine:
  // Food/Delivery: PLACED -> ACCEPTED -> PREPARING -> READY -> OUT_FOR_DELIVERY -> DELIVERED (or REJECTED/CANCELLED)
  // Pickup: PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> PICKED_UP
  // Rental: BOOKING_REQUESTED -> ACCEPTED -> ACTIVE_RENTAL -> RETURNED
  status: text("status").default("PLACED").notNull(),
  
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").default(0).notNull(),
  discount: integer("discount").default(0).notNull(),
  total: integer("total").notNull(),
  
  paymentStatus: text("payment_status").default("PENDING").notNull(), // "PENDING", "PAID", "COD"
  paymentMethod: text("payment_method").default("COD").notNull(), // "COD", "UPI", "CAMPUS_PAY"
  
  customerNote: text("customer_note"),
  rejectionReason: text("rejection_reason"),
  
  // Dynamic Delivery Address / Booking Info
  deliveryAddress: jsonb("delivery_address").$type<{
    hostelName?: string;
    roomNumber?: string;
    phone?: string;
    pickupInstructions?: string;
    rentalStartDate?: string;
    rentalEndDate?: string;
    drivingLicenseNumber?: string;
    aadhaarLast4?: string;
  }>(),
  
  createdAt,
  updatedAt,
});

// ─── 7. Order Items (Snapshot at Purchase Time) ───
export const marketplaceOrderItems = pgTable("marketplace_order_items", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .references(() => marketplaceOrders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  unitPriceSnapshot: integer("unit_price_snapshot").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  selectedOptions: jsonb("selected_options").$type<Record<string, string>>().default({}),
  selectedAddons: jsonb("selected_addons").$type<Array<{ name: string; price: number }>>().default([]),
  subtotal: integer("subtotal").notNull(),
  createdAt,
});

// ─── 8. Merchant Offers & Student Deals ───
export const marketplaceOffers = pgTable("marketplace_offers", {
  id: id(),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // e.g. "Evening Student Deal — 20% OFF"
  description: text("description"),
  discountType: text("discount_type").default("PERCENTAGE").notNull(), // "PERCENTAGE" | "FIXED"
  discountValue: integer("discount_value").notNull(), // e.g. 20 (percent) or 50 (Rupees)
  minOrderValue: integer("min_order_value").default(0).notNull(),
  code: text("code"), // e.g. "STUDENT20"
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date", { withTimezone: true, mode: "date" }),
  endDate: timestamp("end_date", { withTimezone: true, mode: "date" }),
  createdAt,
});

// ─── 9. Reviews & Student Ratings ───
export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: id(),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  studentId: text("student_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  orderId: text("order_id"),
  rating: integer("rating").default(5).notNull(), // 1 to 5
  comment: text("comment"),
  reply: text("reply"),
  replyAt: timestamp("reply_at", { withTimezone: true, mode: "date" }),
  createdAt,
  updatedAt,
});

// ─── 10. Saved Items & Bookmarks ───
export const savedMarketplaceItems = pgTable("saved_marketplace_items", {
  id: id(),
  studentId: text("student_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  targetType: text("target_type").default("MERCHANT").notNull(), // "MERCHANT" | "PRODUCT"
  targetId: text("target_id").notNull(),
  createdAt,
});

export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;
export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
export type MerchantUser = typeof merchantUsers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type NewMarketplaceOrder = typeof marketplaceOrders.$inferInsert;
export type MarketplaceOrderItem = typeof marketplaceOrderItems.$inferSelect;
export type MarketplaceOffer = typeof marketplaceOffers.$inferSelect;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
