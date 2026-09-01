"use client";

import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  ChefHat,
  Copy,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Play,
  RotateCw,
  Search,
  Store,
  Truck,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo } from "@/lib/utils";

interface OrderItem {
  id: string;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedAddons?: Array<{ name: string; price: number }>;
  subtotal: number;
}

interface DeliveryAddress {
  hostelName?: string;
  roomNumber?: string;
  phone?: string;
  pickupInstructions?: string;
  rentalStartDate?: string;
}

interface StudentInfo {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  merchantId: string;
  studentId: string;
  fulfillmentType: "DELIVERY" | "PICKUP" | "BOOKING";
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  customerNote?: string | null;
  rejectionReason?: string | null;
  deliveryAddress?: DeliveryAddress | null;
  student?: StudentInfo | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const PIPELINE_TABS = [
  { id: "all", label: "All Orders" },
  { id: "new", label: "New Orders", color: "text-amber-500" },
  { id: "preparing", label: "In Kitchen", color: "text-blue-500" },
  { id: "ready", label: "Ready / Out for Delivery", color: "text-purple-500" },
  { id: "completed", label: "Completed", color: "text-emerald-500" },
  { id: "cancelled", label: "Cancelled", color: "text-rose-500" },
] as const;

type SortOption = "newest" | "oldest" | "highest_total" | "delivery_only" | "pickup_only";

// Web Audio API Ding-Dong Chime for instant audible order alert
function playNewOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      sounds.ting();
      return;
    }
    const ctx = new AudioContextClass();

    // First tone (high chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.5);

    // Second tone (resonant chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.18); // C6
    osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.4); // A6
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 0.85);
  } catch (err) {
    sounds.ting();
  }
}

export function MerchantOrdersClient() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Keep track of known orders to detect newly arrived orders
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  // SWR polling every 5 seconds for live order reception
  const { data, isLoading, mutate, isValidating } = useSWR<{
    orders: MarketplaceOrder[];
    counts: Record<string, number>;
  }>(`/api/merchant/orders?status=${activeTab}`, fetcher, { refreshInterval: 5000, dedupingInterval: 2500 });

  const rawOrders = data?.orders || [];
  const counts = data?.counts || { all: 0, new: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };

  // Detect newly placed orders and trigger chime & notification
  useEffect(() => {
    if (!rawOrders || rawOrders.length === 0) return;

    if (isInitialLoadRef.current) {
      // First load: seed the known set without dinging
      rawOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
      isInitialLoadRef.current = false;
      return;
    }

    // Check for newly arrived PLACED orders
    const newPlacedOrders = rawOrders.filter(
      (o) => o.status === "PLACED" && !knownOrderIdsRef.current.has(o.id)
    );

    if (newPlacedOrders.length > 0) {
      if (soundEnabled) {
        playNewOrderSound();
      }
      haptics.heavy();

      newPlacedOrders.forEach((newOrder) => {
        const studentName = newOrder.student?.displayName || "Student";
        const loc = newOrder.deliveryAddress?.hostelName || "Campus";
        toast.success(`🔔 NEW ORDER: #${newOrder.orderNumber} (₹${newOrder.total})`, {
          description: `${studentName} · ${loc} · ${newOrder.items?.length || 1} item(s)`,
          duration: 10000,
        });
        knownOrderIdsRef.current.add(newOrder.id);
      });
    }

    // Add all current orders to known set
    rawOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
  }, [rawOrders, soundEnabled]);

  // Filter & sort logic
  const processedOrders = useMemo(() => {
    let list = [...rawOrders];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((o) => {
        const matchNum = o.orderNumber?.toLowerCase().includes(q);
        const matchStudent =
          o.student?.displayName?.toLowerCase().includes(q) || o.student?.username?.toLowerCase().includes(q);
        const matchHostel =
          o.deliveryAddress?.hostelName?.toLowerCase().includes(q) ||
          o.deliveryAddress?.roomNumber?.toLowerCase().includes(q);
        const matchPhone = o.deliveryAddress?.phone?.includes(q);
        const matchItem = o.items?.some((i) => i.productNameSnapshot?.toLowerCase().includes(q));
        return matchNum || matchStudent || matchHostel || matchPhone || matchItem;
      });
    }

    // Sort order
    if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "highest_total") {
      list.sort((a, b) => b.total - a.total);
    } else if (sortBy === "delivery_only") {
      list = list.filter((o) => o.fulfillmentType === "DELIVERY");
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "pickup_only") {
      list = list.filter((o) => o.fulfillmentType === "PICKUP");
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // "newest" default
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [rawOrders, searchQuery, sortBy]);

  // Status transitions handler
  const handleUpdateStatus = useCallback(
    async (orderId: string, nextStatus: string, actionLabel: string) => {
      sounds.ting();
      haptics.success();
      setUpdatingOrderId(orderId);

      try {
        const res = await fetch(`/api/merchant/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Failed to update order status");
        }

        mutate();
        toast.success(`Order ${actionLabel}! 🎉`);
      } catch (err: any) {
        toast.error(err.message || "Status update failed");
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [mutate]
  );

  function handleTestChime() {
    playNewOrderSound();
    sounds.pop();
    haptics.medium();
    toast.info("🔊 Testing order chime sound!");
  }

  function handleCopyDetails(order: MarketplaceOrder) {
    sounds.tap();
    haptics.light();
    const itemsText = (order.items || [])
      .map(
        (i) =>
          `• ${i.quantity}x ${i.productNameSnapshot}${
            i.selectedAddons && i.selectedAddons.length > 0
              ? ` (+${i.selectedAddons.map((a) => a.name).join(", ")})`
              : ""
          }`
      )
      .join("\n");

    const text = `📦 Order #${order.orderNumber}
Student: ${order.student?.displayName || "Student"} (@${order.student?.username || ""})
Location: ${order.deliveryAddress?.hostelName || "Campus"}, Room ${order.deliveryAddress?.roomNumber || ""}
Phone: ${order.deliveryAddress?.phone || "N/A"}
Total: ₹${order.total} (${order.paymentMethod})
${order.customerNote ? `Note: "${order.customerNote}"\n` : ""}
Items:
${itemsText}`;

    navigator.clipboard.writeText(text);
    toast.success("Order details copied to clipboard!");
  }

  return (
    <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 select-none pb-24">
      {/* ─── Top Header Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Live Order Management
            </h1>
            {isValidating && <RotateCw className="size-3.5 text-primary animate-spin" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time incoming student orders with instant kitchen dispatch and audio alert
          </p>
        </div>

        {/* Audio Alert Toggle & Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setSoundEnabled((prev) => !prev);
              toast.info(!soundEnabled ? "🔔 Sound notifications turned ON" : "🔕 Sound notifications muted");
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
              soundEnabled
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-muted/60 border-border text-muted-foreground"
            )}
            title="Toggle audio alerts on new orders"
          >
            {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            <span>{soundEnabled ? "Sound ON" : "Sound Muted"}</span>
          </button>

          <button
            type="button"
            onClick={handleTestChime}
            className="px-2.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="Test audio alert sound"
          >
            <Play className="size-3 fill-current" />
            <span className="hidden sm:inline">Test Sound</span>
          </button>
        </div>
      </div>

      {/* ─── Fast Status Pipeline Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/40">
        {PIPELINE_TABS.map((tab) => {
          const count = counts[tab.id] ?? 0;
          const isActive = activeTab === tab.id;
          const isNewPending = tab.id === "new" && count > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setActiveTab(tab.id);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer relative",
                isActive
                  ? "bg-foreground text-background font-black shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums transition-colors",
                  isActive
                    ? "bg-background text-foreground"
                    : isNewPending
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Search & Sort Controls ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, student name, hostel, room, or item..."
            className="w-full h-11 rounded-2xl bg-muted/30 border border-border pl-10 pr-3.5 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-colors"
          />
        </div>

        {/* Sort Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowDownUp className="size-4 text-muted-foreground hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-11 rounded-2xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none cursor-pointer"
          >
            <option value="newest">🕒 Newest First</option>
            <option value="oldest">⏳ Oldest First (Urgent)</option>
            <option value="highest_total">💰 Highest Value (₹)</option>
            <option value="delivery_only">🛵 Hostel Delivery Only</option>
            <option value="pickup_only">🛍️ Store Pickup Only</option>
          </select>
        </div>
      </div>

      {/* ─── Orders Grid / Feed ─── */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-3xl" />
          <Skeleton className="h-52 w-full rounded-3xl" />
        </div>
      ) : processedOrders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {processedOrders.map((order) => {
            const isPlaced = order.status === "PLACED";
            const isPreparing = ["ACCEPTED", "PREPARING"].includes(order.status);
            const isReady = ["READY", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(order.status);
            const isCompleted = ["DELIVERED", "PICKED_UP"].includes(order.status);
            const isCancelled = ["REJECTED", "CANCELLED"].includes(order.status);

            const phone = order.deliveryAddress?.phone;
            const studentName = order.student?.displayName || "Student";
            const hostelName = order.deliveryAddress?.hostelName || "Campus Hub";
            const roomNumber = order.deliveryAddress?.roomNumber;

            return (
              <div
                key={order.id}
                className={cn(
                  "rounded-3xl bg-card border transition-all space-y-4 p-5 sm:p-6 shadow-sm relative overflow-hidden",
                  isPlaced
                    ? "border-amber-500/50 ring-1 ring-amber-500/20 bg-amber-500/[0.02]"
                    : isPreparing
                      ? "border-blue-500/40"
                      : isReady
                        ? "border-purple-500/40"
                        : isCompleted
                          ? "border-emerald-500/30"
                          : "border-border/60"
                )}
              >
                {/* Status Glow Bar */}
                <div
                  className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    isPlaced
                      ? "bg-amber-500 animate-pulse"
                      : isPreparing
                        ? "bg-blue-500"
                        : isReady
                          ? "bg-purple-500"
                          : isCompleted
                            ? "bg-emerald-500"
                            : "bg-muted-foreground/30"
                  )}
                />

                {/* 1. Header: Order Number, Time & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-foreground">#{order.orderNumber}</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      · {formatTimeAgo(order.createdAt)}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        order.fulfillmentType === "DELIVERY"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                      )}
                    >
                      {order.fulfillmentType === "DELIVERY" ? (
                        <Truck className="size-3" />
                      ) : (
                        <Store className="size-3" />
                      )}
                      <span>{order.fulfillmentType}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground">
                      {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI Paid"}
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* 2. Student Details & Delivery Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  {/* Student Identity */}
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11 rounded-2xl border border-border">
                      <AvatarImage src={order.student?.avatarUrl || ""} />
                      <AvatarFallback className="rounded-2xl font-black text-xs bg-primary/15 text-primary">
                        {studentName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-black text-foreground truncate">{studentName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        @{order.student?.username || "student"}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Location & Contact Buttons */}
                  <div className="flex flex-col justify-center space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <MapPin className="size-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">
                        {hostelName}
                        {roomNumber ? ` · Room ${roomNumber}` : ""}
                      </span>
                    </div>

                    {phone && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <a
                          href={`tel:${phone}`}
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-[11px] transition-colors"
                        >
                          <Phone className="size-3 text-primary" />
                          <span>{phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hi ${studentName}, regarding your CampusLoop order #${order.orderNumber} from store:`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            sounds.tap();
                            haptics.light();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] transition-colors"
                        >
                          <MessageCircle className="size-3" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyDetails(order)}
                          className="size-7 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors"
                          title="Copy details for delivery boy"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Cooking Note / Preferences Banner */}
                {order.customerNote && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black uppercase text-[10px] tracking-wider block">
                        Customer Cooking Note:
                      </span>
                      <span className="font-medium italic">"{order.customerNote}"</span>
                    </div>
                  </div>
                )}

                {/* 4. Itemized Menu Breakdown */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                    Ordered Items ({(order.items || []).reduce((sum, i) => sum + i.quantity, 0)})
                  </span>

                  <div className="space-y-1.5">
                    {(order.items || []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-foreground">{item.quantity}×</span>
                            <span className="font-bold text-foreground">{item.productNameSnapshot}</span>
                          </div>

                          {/* Selected Add-ons */}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-6">
                              {item.selectedAddons.map((addon, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md"
                                >
                                  + {addon.name} (+₹{addon.price})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <span className="font-mono font-black text-foreground">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Action Buttons / Status Transitions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground">
                      Status: <strong className="text-foreground uppercase">{order.status}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* PLACED -> Accept & Cook OR Reject */}
                    {isPlaced && (
                      <>
                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleUpdateStatus(order.id, "PREPARING", "accepted & cooking")}
                          className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-black hover:opacity-90 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          <ChefHat className="size-3.5" />
                          <span>Accept &amp; Start Cooking</span>
                        </button>

                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => {
                            if (confirm(`Reject order #${order.orderNumber}?`)) {
                              handleUpdateStatus(order.id, "REJECTED", "rejected");
                            }
                          }}
                          className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* PREPARING -> Out for Delivery OR Ready for Pickup */}
                    {isPreparing && (
                      <button
                        type="button"
                        disabled={updatingOrderId === order.id}
                        onClick={() => {
                          const nextStatus =
                            order.fulfillmentType === "DELIVERY" ? "OUT_FOR_DELIVERY" : "READY_FOR_PICKUP";
                          handleUpdateStatus(
                            order.id,
                            nextStatus,
                            order.fulfillmentType === "DELIVERY"
                              ? "dispatched for delivery"
                              : "marked ready for pickup"
                          );
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {order.fulfillmentType === "DELIVERY" ? (
                          <>
                            <Truck className="size-3.5" />
                            <span>Dispatch Out for Delivery</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5" />
                            <span>Mark Ready for Pickup</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* READY / OUT_FOR_DELIVERY -> Delivered / Completed */}
                    {isReady && (
                      <button
                        type="button"
                        disabled={updatingOrderId === order.id}
                        onClick={() => {
                          const nextStatus = order.fulfillmentType === "DELIVERY" ? "DELIVERED" : "PICKED_UP";
                          handleUpdateStatus(order.id, nextStatus, "completed & delivered");
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>
                          {order.fulfillmentType === "DELIVERY"
                            ? "Mark Order Delivered"
                            : "Mark Order Picked Up"}
                        </span>
                      </button>
                    )}

                    {/* Completed Badge */}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                        <span>Order Complete</span>
                      </span>
                    )}

                    {/* Cancelled Badge */}
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                        <XCircle className="size-3.5" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center space-y-3 rounded-3xl bg-card border border-border/40 p-6">
          <Package className="size-12 text-muted-foreground/30 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground">No orders in this pipeline</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Incoming student orders will appear here automatically with instant chime notification.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
