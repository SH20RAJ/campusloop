"use client";

import { useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string; // Unique key: `${productId}_${optionsKey}_${addonsKey}`
  productId: string;
  merchantId: string;
  merchantName: string;
  merchantSlug: string;
  merchantLogo?: string | null;
  deliveryFee: number;
  freeDeliveryAbove?: number | null;
  productName: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedAddons?: Array<{ name: string; price: number }>;
}

const STORAGE_KEY = "campusloop_marketplace_cart";

export function useMarketplaceCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, isLoaded]);

  function addItem(item: Omit<CartItem, "id">) {
    const optionsKey = JSON.stringify(item.selectedOptions || {});
    const addonsKey = JSON.stringify((item.selectedAddons || []).map((a) => a.name).sort());
    const id = `${item.productId}_${optionsKey}_${addonsKey}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id }];
    });
  }

  function updateQuantity(id: string, delta: number) {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  function clearMerchantCart(merchantId: string) {
    setItems((prev) => prev.filter((item) => item.merchantId !== merchantId));
  }

  // Group items by merchant
  const merchantGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        merchantId: string;
        merchantName: string;
        merchantSlug: string;
        merchantLogo?: string | null;
        deliveryFee: number;
        freeDeliveryAbove?: number | null;
        items: CartItem[];
        subtotal: number;
        finalDeliveryFee: number;
        total: number;
      }
    > = {};

    for (const item of items) {
      if (!groups[item.merchantId]) {
        groups[item.merchantId] = {
          merchantId: item.merchantId,
          merchantName: item.merchantName,
          merchantSlug: item.merchantSlug,
          merchantLogo: item.merchantLogo,
          deliveryFee: item.deliveryFee || 20,
          freeDeliveryAbove: item.freeDeliveryAbove,
          items: [],
          subtotal: 0,
          finalDeliveryFee: 0,
          total: 0,
        };
      }

      const g = groups[item.merchantId];
      g.items.push(item);
      const addonsTotal = (item.selectedAddons || []).reduce((sum, a) => sum + (a.price || 0), 0);
      const itemPriceWithAddons = item.price + addonsTotal;
      g.subtotal += itemPriceWithAddons * item.quantity;
    }

    // Compute delivery fees per merchant
    for (const g of Object.values(groups)) {
      if (g.freeDeliveryAbove && g.subtotal >= g.freeDeliveryAbove) {
        g.finalDeliveryFee = 0;
      } else {
        g.finalDeliveryFee = g.deliveryFee;
      }
      g.total = g.subtotal + g.finalDeliveryFee;
    }

    return Object.values(groups);
  }, [items]);

  const totalItemsCount = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const overallSubtotal = useMemo(() => {
    return merchantGroups.reduce((sum, g) => sum + g.subtotal, 0);
  }, [merchantGroups]);

  const isMultiMerchant = merchantGroups.length > 1;

  return {
    items,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    clearMerchantCart,
    merchantGroups,
    totalItemsCount,
    overallSubtotal,
    isMultiMerchant,
  };
}
