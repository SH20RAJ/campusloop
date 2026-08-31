import { describe, expect, it } from "vitest";
import {
  type CartItemInput,
  MAX_LINE_QUANTITY,
  type PricingMerchant,
  type PricingProduct,
  priceMerchantOrder,
} from "./pricing";

const merchant: PricingMerchant = {
  id: "m1",
  name: "Sharma Ji Canteen",
  status: "ACTIVE",
  isOpen: true,
  isDeliveryEnabled: true,
  isPickupEnabled: true,
  deliveryFee: 20,
  minOrderValue: 80,
  freeDeliveryAbove: 299,
};

const momos: PricingProduct = {
  id: "p1",
  merchantId: "m1",
  name: "Steam Momos",
  price: 100,
  status: "ACTIVE",
  isAvailable: true,
  stockQuantity: null,
  addons: [
    { id: "a1", name: "Extra Chutney", price: 10 },
    { id: "a2", name: "Cheese", price: 30 },
  ],
};

function price(items: CartItemInput[], overrides: Partial<Parameters<typeof priceMerchantOrder>[0]> = {}) {
  return priceMerchantOrder({
    merchant,
    products: [momos],
    items,
    fulfillmentType: "PICKUP",
    ...overrides,
  });
}

describe("addon pricing is server-authoritative", () => {
  it("ignores the price the client sends and uses the product's own", () => {
    const result = price([
      // A crafted request claiming the ₹30 cheese costs ₹1.
      { productId: "p1", quantity: 1, selectedAddons: [{ id: "a2", name: "Cheese", price: 1 }] },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.subtotal).toBe(130); // 100 + 30, not 100 + 1
    expect(result.order.lines[0].selectedAddons).toEqual([{ name: "Cheese", price: 30 }]);
  });

  it("cannot be driven negative by a hostile addon price", () => {
    const result = price([
      { productId: "p1", quantity: 1, selectedAddons: [{ id: "a1", name: "Extra Chutney", price: -5000 }] },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.total).toBe(110);
    expect(result.order.total).toBeGreaterThan(0);
  });

  it("rejects an addon the product does not define instead of dropping it", () => {
    const result = price([
      { productId: "p1", quantity: 1, selectedAddons: [{ name: "Gold Leaf", price: 0 }] },
    ]);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNKNOWN_ADDON");
  });

  it("matches an addon by name when no id is supplied", () => {
    const result = price([{ productId: "p1", quantity: 2, selectedAddons: [{ name: "Cheese" }] }]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.subtotal).toBe(260); // (100 + 30) * 2
  });
});

describe("cross-merchant and availability guards", () => {
  it("refuses a product belonging to a different merchant", () => {
    const foreign: PricingProduct = {
      ...momos,
      id: "p9",
      merchantId: "OTHER",
      name: "Cheap Thing",
      price: 1,
    };
    const result = price([{ productId: "p9", quantity: 1 }], { products: [foreign] });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("WRONG_MERCHANT");
  });

  it("refuses an unavailable product rather than silently skipping it", () => {
    const result = price([{ productId: "p1", quantity: 1 }], {
      products: [{ ...momos, isAvailable: false }],
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("PRODUCT_UNAVAILABLE");
  });

  it("refuses an unknown product instead of pricing a partial order", () => {
    const result = price([
      { productId: "p1", quantity: 1 },
      { productId: "ghost", quantity: 1 },
    ]);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNKNOWN_PRODUCT");
  });

  it("refuses orders from a closed or inactive merchant", () => {
    expect(price([{ productId: "p1", quantity: 1 }], { merchant: { ...merchant, isOpen: false } }).ok).toBe(
      false
    );
    expect(
      price([{ productId: "p1", quantity: 1 }], { merchant: { ...merchant, status: "PAUSED" } }).ok
    ).toBe(false);
  });

  it("refuses delivery when the merchant has delivery switched off", () => {
    const result = price([{ productId: "p1", quantity: 1 }], {
      merchant: { ...merchant, isDeliveryEnabled: false },
      fulfillmentType: "DELIVERY",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("FULFILLMENT_UNSUPPORTED");
  });
});

describe("stock", () => {
  const tracked: PricingProduct = { ...momos, stockQuantity: 5 };

  it("treats null stock as untracked, not as zero", () => {
    const result = price([{ productId: "p1", quantity: 40 }], { products: [momos] });
    expect(result.ok).toBe(true);
  });

  it("refuses more units than are in stock", () => {
    const result = price([{ productId: "p1", quantity: 6 }], { products: [tracked] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INSUFFICIENT_STOCK");
  });

  it("sums duplicate lines of the same product before checking stock", () => {
    // Three lines of 2 against a stock of 5 must fail on the total, not pass
    // because each individual line looks affordable.
    const result = price(
      [
        { productId: "p1", quantity: 2 },
        { productId: "p1", quantity: 2 },
        { productId: "p1", quantity: 2 },
      ],
      { products: [tracked] }
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INSUFFICIENT_STOCK");
  });
});

describe("quantity bounds", () => {
  it.each([0, -3, 1.5, Number.NaN, MAX_LINE_QUANTITY + 1])("rejects a quantity of %s", (quantity) => {
    const result = price([{ productId: "p1", quantity: quantity as number }]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INVALID_QUANTITY");
  });
});

describe("delivery fee and minimum", () => {
  it("charges the fee below the free-delivery threshold", () => {
    const result = price([{ productId: "p1", quantity: 1 }], { fulfillmentType: "DELIVERY" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.deliveryFee).toBe(20);
    expect(result.order.total).toBe(120);
  });

  it("waives the fee at or above the threshold", () => {
    const result = price([{ productId: "p1", quantity: 3 }], { fulfillmentType: "DELIVERY" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.subtotal).toBe(300);
    expect(result.order.deliveryFee).toBe(0);
  });

  it("enforces the delivery minimum", () => {
    const result = price([{ productId: "p1", quantity: 1 }], {
      products: [{ ...momos, price: 40 }],
      fulfillmentType: "DELIVERY",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("BELOW_MINIMUM");
  });

  it("does not apply the delivery minimum to pickup", () => {
    // A single samosa collected from the counter is a legitimate order.
    const result = price([{ productId: "p1", quantity: 1 }], {
      products: [{ ...momos, price: 40 }],
      fulfillmentType: "PICKUP",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.deliveryFee).toBe(0);
    expect(result.order.total).toBe(40);
  });
});
