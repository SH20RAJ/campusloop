"use client";

import { AlertCircle, ArrowLeft, ChevronRight, Minus, Plus, ShoppingBag, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

export function CartClient() {
  const router = useRouter();
  const {
    items,
    isLoaded,
    updateQuantity,
    removeItem,
    clearCart,
    merchantGroups,
    overallSubtotal,
    isMultiMerchant,
  } = useMarketplaceCart();

  const totalDeliveryFee = merchantGroups.reduce((sum, g) => sum + g.finalDeliveryFee, 0);
  const grandTotal = overallSubtotal + totalDeliveryFee;

  if (!isLoaded) {
    return null;
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none p-4">
        <header className="flex h-14 items-center gap-3 border-b border-border/30">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <h1 className="text-base font-black text-foreground">Your Cart</h1>
        </header>

        <div className="flex flex-col items-center justify-center py-28 text-center space-y-4">
          <div className="size-16 rounded-3xl bg-muted/60 flex items-center justify-center border border-border/40 text-muted-foreground">
            <ShoppingBag className="size-8 text-muted-foreground/60" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">Your cart is empty</h2>
            <p className="text-xs text-muted-foreground max-w-xs">
              Explore delicious canteens, vehicle rentals, and services around campus.
            </p>
          </div>
          <Link
            href="/app/marketplace"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Explore Marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              router.back();
            }}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">Your Cart</h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {merchantGroups.length} {merchantGroups.length === 1 ? "store order" : "store orders"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.tap();
            haptics.light();
            if (confirm("Clear all items from your cart?")) clearCart();
          }}
          className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </header>

      <div className="p-4 space-y-5">
        {/* ─── Multi-Merchant Alert Banner ─── */}
        {isMultiMerchant && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-500 flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Items from {merchantGroups.length} different stores</p>
              <p className="text-[11px] text-amber-500/85 mt-0.5">
                Your cart contains items from multiple stores. They will be placed as separate orders so each
                merchant can fulfill them directly.
              </p>
            </div>
          </div>
        )}

        {/* ─── Store Grouped Orders ─── */}
        <div className="space-y-4">
          {merchantGroups.map((group) => (
            <div
              key={group.merchantId}
              className="rounded-3xl border border-border/40 bg-card p-4 space-y-3.5 shadow-xs"
            >
              {/* Store Header */}
              <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                <Link
                  href={`/app/marketplace/store/${group.merchantId}`}
                  className="flex items-center gap-2 font-black text-sm text-foreground hover:underline"
                >
                  <Store className="size-4 text-primary" />
                  <span>{group.merchantName}</span>
                </Link>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-border/20">
                {group.items.map((item) => {
                  const addonsPrice = (item.selectedAddons || []).reduce((sum, a) => sum + a.price, 0);
                  const itemUnitPrice = item.price + addonsPrice;
                  const itemTotal = itemUnitPrice * item.quantity;

                  return (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-foreground">{item.productName}</h4>
                        {/* Options & Addons */}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {Object.entries(item.selectedOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </p>
                        )}
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
                            + {item.selectedAddons.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        <p className="text-xs font-black text-foreground mt-1">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2 bg-muted/60 px-2.5 py-1 rounded-full border border-border/40 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                            updateQuantity(item.id, -1);
                          }}
                          className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-black text-foreground min-w-3 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                            updateQuantity(item.id, 1);
                          }}
                          className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Group Subtotal & Delivery */}
              <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Store Subtotal</span>
                <span className="text-foreground font-black">₹{group.subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Bill Summary ─── */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-2.5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Bill Summary</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Items Total</span>
            <span className="text-foreground font-bold">₹{overallSubtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Truck className="size-3.5 text-emerald-500" />
              <span>Estimated Delivery Fee</span>
            </span>
            <span className="text-foreground font-bold">
              {totalDeliveryFee === 0 ? "FREE" : `₹${totalDeliveryFee.toLocaleString("en-IN")}`}
            </span>
          </div>
          <div className="pt-2 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
            <span>To Pay</span>
            <span className="text-base text-emerald-500">₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* ─── Checkout Action Button ─── */}
        <div className="pt-2">
          <Link
            href="/app/marketplace/checkout"
            onClick={() => {
              sounds.send();
              haptics.success();
            }}
            className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-between px-5 shadow-lg cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <div className="flex items-center gap-1.5">
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
