"use client";

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMarketplaceCart } from "@/hooks/use-marketplace-cart";
import { haptics } from "@/lib/haptics";
import { getCampusDeliveryLocations, isBitMesraCampus } from "@/lib/marketplace/locations";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const SAVED_ADDRESS_KEY = "campusloop_saved_delivery_address";

interface CheckoutClientProps {
  profileId: string;
  collegeName?: string;
}

export function CheckoutClient({ profileId, collegeName = "Campus Hub" }: CheckoutClientProps) {
  const router = useRouter();
  const { items, merchantGroups, overallSubtotal, clearCart } = useMarketplaceCart();

  const isBitMesra = useMemo(() => isBitMesraCampus(collegeName), [collegeName]);
  const locationGroups = useMemo(() => getCampusDeliveryLocations(collegeName), [collegeName]);
  const defaultHostel = locationGroups[0]?.locations[0]?.label || "Hostel 11 (Boys)";

  const [fulfillmentType, setFulfillmentType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [hostelName, setHostelName] = useState(defaultHostel);
  const [otherLocationDetail, setOtherLocationDetail] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofill delivery address and phone from previous checkout session
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(SAVED_ADDRESS_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved.hostelName) setHostelName(saved.hostelName);
        if (saved.roomNumber) setRoomNumber(saved.roomNumber);
        if (saved.phone) setPhone(saved.phone);
        if (saved.otherLocationDetail) setOtherLocationDetail(saved.otherLocationDetail);
      }
    } catch {}
  }, []);

  // Autosave delivery address & phone changes to localStorage for next time
  function saveAddressToStorage(hName: string, rNum: string, pNum: string, oLoc: string) {
    try {
      localStorage.setItem(
        SAVED_ADDRESS_KEY,
        JSON.stringify({
          hostelName: hName,
          roomNumber: rNum,
          phone: pNum,
          otherLocationDetail: oLoc,
        })
      );
    } catch {}
  }

  // Rental specific fields if any rental item in cart
  const hasRentalItems = items.some(
    (i) =>
      i.productName.toLowerCase().includes("rental") ||
      i.merchantSlug.includes("rental") ||
      i.merchantSlug.includes("wheels")
  );
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [rentalStartDate, setRentalStartDate] = useState("Today 4:00 PM");

  const totalDeliveryFee =
    fulfillmentType === "DELIVERY" ? merchantGroups.reduce((sum, g) => sum + g.finalDeliveryFee, 0) : 0;

  const grandTotal = overallSubtotal + totalDeliveryFee;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();

    if (fulfillmentType === "DELIVERY" && !roomNumber.trim()) {
      toast.error("Please enter your room / spot number for delivery");
      return;
    }

    if (fulfillmentType === "DELIVERY" && hostelName.includes("Other") && !otherLocationDetail.trim()) {
      toast.error("Please specify your campus spot or landmark");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your contact phone number");
      return;
    }

    if (hasRentalItems && !drivingLicenseNumber.trim()) {
      toast.error("Please enter your Driving License / Student ID number for rental verification");
      return;
    }

    sounds.send();
    haptics.success();
    setIsSubmitting(true);

    try {
      toast.loading("Placing your campus order...", { id: "checkout" });

      const finalHostelName =
        hostelName.includes("Other") && otherLocationDetail.trim()
          ? `Other: ${otherLocationDetail.trim()}`
          : hostelName;

      const merchantOrders = merchantGroups.map((group) => ({
        merchantId: group.merchantId,
        fulfillmentType,
        customerNote: customerNote.trim() || undefined,
        paymentMethod,
        items: group.items.map((item) => ({
          productId: item.productId,
          merchantId: item.merchantId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          selectedAddons: item.selectedAddons,
        })),
      }));

      const res = await fetch("/api/marketplace/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantOrders,
          deliveryAddress: {
            hostelName: fulfillmentType === "DELIVERY" ? finalHostelName : undefined,
            roomNumber: fulfillmentType === "DELIVERY" ? roomNumber.trim() : undefined,
            phone: phone.trim(),
            pickupInstructions: fulfillmentType === "PICKUP" ? "Pickup from main store counter" : undefined,
            rentalStartDate: hasRentalItems ? rentalStartDate : undefined,
            drivingLicenseNumber: hasRentalItems ? drivingLicenseNumber.trim() : undefined,
          },
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData?.error || "Failed to place order");
      }

      const data = (await res.json()) as { primaryOrderId: string };
      toast.success("Order Placed Successfully! 🎉", { id: "checkout" });
      clearCart();
      router.push(`/app/marketplace/order/${data.primaryOrderId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed. Please try again.", {
        id: "checkout",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">Checkout</h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {collegeName} · {merchantGroups.length}{" "}
              {merchantGroups.length === 1 ? "store order" : "store orders"}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handlePlaceOrder} className="p-4 space-y-5">
        {/* 1. Fulfillment Mode Selector */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-3 shadow-xs">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            1. Fulfillment Method
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setFulfillmentType("DELIVERY");
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                fulfillmentType === "DELIVERY"
                  ? "bg-foreground text-background border-foreground font-black shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground"
              )}
            >
              <Truck className="size-4" />
              <span>Hostel Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setFulfillmentType("PICKUP");
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                fulfillmentType === "PICKUP"
                  ? "bg-foreground text-background border-foreground font-black shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground"
              )}
            >
              <Store className="size-4" />
              <span>Self Pickup</span>
            </button>
          </div>
        </div>

        {/* 2. Address & Delivery Info */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-3 shadow-xs">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            {fulfillmentType === "DELIVERY" ? "2. Delivery Address" : "2. Pickup Details"}
          </label>

          {fulfillmentType === "DELIVERY" ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Select Hostel / Campus Building *
                </span>
                <select
                  value={hostelName}
                  onChange={(e) => {
                    setHostelName(e.target.value);
                    saveAddressToStorage(e.target.value, roomNumber, phone, otherLocationDetail);
                  }}
                  className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none cursor-pointer"
                >
                  {locationGroups.map((grp) => (
                    <optgroup key={grp.groupName} label={grp.groupName}>
                      {grp.locations.map((loc) => (
                        <option key={loc.id} value={loc.label}>
                          {loc.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {hostelName.includes("Other") && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground">
                    Specify Campus Spot / Landmark *
                  </span>
                  <input
                    type="text"
                    required
                    value={otherLocationDetail}
                    onChange={(e) => {
                      setOtherLocationDetail(e.target.value);
                      saveAddressToStorage(hostelName, roomNumber, phone, e.target.value);
                    }}
                    placeholder="e.g. Sports Complex / Tech Park Bench / Gate 2"
                    className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {hostelName.includes("Building") ||
                    hostelName.includes("PMC") ||
                    hostelName.includes("R&D") ||
                    hostelName.includes("Library")
                      ? "Floor / Lab / Room No. *"
                      : "Room / Flat Number *"}
                  </span>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => {
                      setRoomNumber(e.target.value);
                      saveAddressToStorage(hostelName, e.target.value, phone, otherLocationDetail);
                    }}
                    placeholder="e.g. 204 / 2nd Floor"
                    className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground">Phone Number *</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      saveAddressToStorage(hostelName, roomNumber, e.target.value, otherLocationDetail);
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/30 text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">Pickup from Store Counter</p>
                <p className="text-[11px]">
                  Your order will be prepared in 15–20 minutes. Collect from the store counter by showing your
                  order number.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Phone Number for Order Alert *
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground outline-none"
                />
              </div>
            </div>
          )}

          {/* Rental Specific Verification Schema */}
          {hasRentalItems && (
            <div className="pt-2 border-t border-border/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
                <ShieldCheck className="size-4" />
                <span>Vehicle / Gear Rental Requirements</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">
                  Driving License Number / Student ID Number *
                </span>
                <input
                  type="text"
                  required
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  placeholder="e.g. DL-1420110012345 or BIT/2024/042"
                  className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-foreground outline-none"
                />
              </div>
            </div>
          )}

          {/* Cooking / Delivery Instructions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-muted-foreground">Special Instructions / Note</span>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="e.g. Extra spicy, call upon reaching hostel gate..."
              maxLength={120}
              className="w-full h-10 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-foreground outline-none"
            />
          </div>
        </div>

        {/* 3. Payment Method */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-3 shadow-xs">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            3. Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setPaymentMethod("COD");
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                paymentMethod === "COD"
                  ? "bg-foreground text-background border-foreground font-black shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground"
              )}
            >
              <Wallet className="size-4" />
              <span>{fulfillmentType === "DELIVERY" ? "Cash on Delivery" : "Pay on Pickup"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setPaymentMethod("UPI");
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                paymentMethod === "UPI"
                  ? "bg-foreground text-background border-foreground font-black shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground"
              )}
            >
              <CreditCard className="size-4" />
              <span>UPI / QR on Delivery</span>
            </button>
          </div>
        </div>

        {/* 4. Order Summary Card */}
        <div className="rounded-3xl border border-border/40 bg-card p-4 space-y-2.5 shadow-xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Final Bill Summary
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Items Subtotal</span>
            <span className="text-foreground font-bold">₹{overallSubtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Delivery Fee</span>
            <span className="text-foreground font-bold">
              {totalDeliveryFee === 0 ? "FREE" : `₹${totalDeliveryFee.toLocaleString("en-IN")}`}
            </span>
          </div>
          <div className="pt-2 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
            <span>Total Payable Amount</span>
            <span className="text-base text-emerald-500">₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* 5. Place Order Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4.5 animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4.5" />
                <span>Place Order · ₹{grandTotal.toLocaleString("en-IN")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
