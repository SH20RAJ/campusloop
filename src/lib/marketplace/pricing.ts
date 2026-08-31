/**
 * Server-authoritative pricing for a single merchant's basket.
 *
 * Deliberately pure — it takes rows already loaded from the database and the
 * raw client payload, and returns either a fully priced order or a refusal.
 * No database access, so every rule below is unit-testable without a fixture
 * database, which is the only reason they can be trusted to stay correct.
 *
 * The governing rule: **nothing the client sends is treated as money.** The
 * client says *what* it wants (product id, quantity, which addon); the server
 * decides *what that costs*. The previous implementation summed
 * `selectedAddons[].price` straight from the request body, which let a crafted
 * request price an order at anything, including a negative total.
 */

/** Maximum units of one line item — a canteen order, not a wholesale purchase. */
export const MAX_LINE_QUANTITY = 50;

export interface PricingProduct {
  id: string;
  merchantId: string;
  name: string;
  price: number;
  status: string;
  isAvailable: boolean;
  stockQuantity: number | null;
  addons: Array<{ id: string; name: string; price: number }> | null;
}

export interface PricingMerchant {
  id: string;
  name: string;
  status: string;
  isOpen: boolean;
  isDeliveryEnabled: boolean;
  isPickupEnabled: boolean;
  deliveryFee: number;
  minOrderValue: number;
  freeDeliveryAbove: number | null;
}

export interface CartItemInput {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
  /** Only `name`/`id` are honoured; any price the client sends is discarded. */
  selectedAddons?: Array<{ id?: string; name?: string; price?: number }>;
}

export type FulfillmentType = "DELIVERY" | "PICKUP" | "BOOKING";

export interface PricedLine {
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  selectedOptions: Record<string, string>;
  selectedAddons: Array<{ name: string; price: number }>;
  subtotal: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export type PricingResult =
  | { ok: true; order: PricedOrder }
  | { ok: false; code: PricingErrorCode; message: string };

export type PricingErrorCode =
  | "MERCHANT_UNAVAILABLE"
  | "FULFILLMENT_UNSUPPORTED"
  | "EMPTY_ITEMS"
  | "UNKNOWN_PRODUCT"
  | "WRONG_MERCHANT"
  | "PRODUCT_UNAVAILABLE"
  | "INSUFFICIENT_STOCK"
  | "INVALID_QUANTITY"
  | "UNKNOWN_ADDON"
  | "BELOW_MINIMUM";

function fail(code: PricingErrorCode, message: string): PricingResult {
  return { ok: false, code, message };
}

/**
 * Resolve a requested addon against the product's own addon list.
 *
 * Matched by id when present, otherwise by exact name. An addon the product
 * does not define is a hard error rather than a silent drop: the student chose
 * it and is expecting it, so quietly removing it would hand them a different
 * order than the one they confirmed.
 */
function resolveAddons(
  product: PricingProduct,
  requested: CartItemInput["selectedAddons"]
): { ok: true; addons: Array<{ name: string; price: number }> } | { ok: false; missing: string } {
  if (!requested || requested.length === 0) return { ok: true, addons: [] };

  const available = product.addons ?? [];
  const resolved: Array<{ name: string; price: number }> = [];

  for (const want of requested) {
    const match = available.find((candidate) =>
      want.id ? candidate.id === want.id : candidate.name === want.name
    );
    if (!match) {
      return { ok: false, missing: want.name || want.id || "unknown add-on" };
    }
    // Price comes from `match`, never from `want`.
    resolved.push({ name: match.name, price: match.price });
  }

  return { ok: true, addons: resolved };
}

/**
 * Price one merchant's basket, or explain precisely why it cannot be placed.
 *
 * Every refusal names the offending product so the cart can highlight it —
 * the old code silently `continue`d past unknown products and merchants, so a
 * student could confirm a five-item cart and receive a two-item order with no
 * indication that anything had been dropped.
 */
export function priceMerchantOrder({
  merchant,
  products,
  items,
  fulfillmentType,
}: {
  merchant: PricingMerchant;
  products: PricingProduct[];
  items: CartItemInput[];
  fulfillmentType: FulfillmentType;
}): PricingResult {
  if (merchant.status !== "ACTIVE" || !merchant.isOpen) {
    return fail("MERCHANT_UNAVAILABLE", `${merchant.name} is not accepting orders right now.`);
  }

  if (fulfillmentType === "DELIVERY" && !merchant.isDeliveryEnabled) {
    return fail("FULFILLMENT_UNSUPPORTED", `${merchant.name} is not delivering right now.`);
  }
  if (fulfillmentType === "PICKUP" && !merchant.isPickupEnabled) {
    return fail("FULFILLMENT_UNSUPPORTED", `${merchant.name} is not accepting pickups right now.`);
  }

  if (!items || items.length === 0) {
    return fail("EMPTY_ITEMS", "This order has no items.");
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  const lines: PricedLine[] = [];
  let subtotal = 0;

  // Collapse duplicate lines so stock is checked against the true total, not
  // per-row — three rows of 4 against a stock of 10 must not all pass.
  const requestedUnits = new Map<string, number>();
  for (const item of items) {
    requestedUnits.set(item.productId, (requestedUnits.get(item.productId) ?? 0) + item.quantity);
  }

  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      return fail("INVALID_QUANTITY", `Choose between 1 and ${MAX_LINE_QUANTITY} of each item.`);
    }

    const product = byId.get(item.productId);
    if (!product) {
      return fail("UNKNOWN_PRODUCT", "One of the items is no longer on the menu.");
    }

    // A product id from another merchant must never price into this order.
    if (product.merchantId !== merchant.id) {
      return fail("WRONG_MERCHANT", `“${product.name}” is not sold by ${merchant.name}.`);
    }

    if (!product.isAvailable || product.status !== "ACTIVE") {
      return fail("PRODUCT_UNAVAILABLE", `“${product.name}” is currently unavailable.`);
    }

    // A null stockQuantity means "not stock-tracked" (a dish cooked to order),
    // which is different from zero.
    if (product.stockQuantity !== null) {
      const wanted = requestedUnits.get(product.id) ?? quantity;
      if (product.stockQuantity < wanted) {
        return fail(
          "INSUFFICIENT_STOCK",
          product.stockQuantity === 0
            ? `“${product.name}” just sold out.`
            : `Only ${product.stockQuantity} left of “${product.name}”.`
        );
      }
    }

    const addons = resolveAddons(product, item.selectedAddons);
    if (!addons.ok) {
      return fail("UNKNOWN_ADDON", `“${addons.missing}” is no longer available for ${product.name}.`);
    }

    const addonsTotal = addons.addons.reduce((sum, addon) => sum + addon.price, 0);
    const unitPrice = product.price + addonsTotal;
    const lineSubtotal = unitPrice * quantity;

    subtotal += lineSubtotal;
    lines.push({
      productId: product.id,
      // Snapshotted so a later price or name change never rewrites history on
      // an order the student already placed.
      productNameSnapshot: product.name,
      unitPriceSnapshot: unitPrice,
      quantity,
      selectedOptions: item.selectedOptions ?? {},
      selectedAddons: addons.addons,
      subtotal: lineSubtotal,
    });
  }

  // Only delivery orders are held to the delivery minimum; a pickup of one
  // samosa is a perfectly reasonable thing to allow.
  if (fulfillmentType === "DELIVERY" && merchant.minOrderValue > 0 && subtotal < merchant.minOrderValue) {
    return fail(
      "BELOW_MINIMUM",
      `${merchant.name} has a ₹${merchant.minOrderValue} minimum for delivery. Add ₹${
        merchant.minOrderValue - subtotal
      } more.`
    );
  }

  let deliveryFee = 0;
  if (fulfillmentType === "DELIVERY") {
    const qualifiesForFree = merchant.freeDeliveryAbove !== null && subtotal >= merchant.freeDeliveryAbove;
    deliveryFee = qualifiesForFree ? 0 : merchant.deliveryFee;
  }

  return { ok: true, order: { lines, subtotal, deliveryFee, total: subtotal + deliveryFee } };
}
