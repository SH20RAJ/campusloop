"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn,formatTimeAgo } from "@/lib/utils";
import {
AlertTriangle,
ArrowLeft,
Bike,
Camera,
Check,
CheckCircle2,
KeyRound,
Loader2,
Phone,
RotateCcw,
User,
X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef,useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface MerchantBikeBookingDetailClientProps {
  bookingId: string;
}

export function MerchantBikeBookingDetailClient({
  bookingId,
}: MerchantBikeBookingDetailClientProps) {
  const router = useRouter();

  // Modals for Handover and Return
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Handover checklist
  const [frontOk, setFrontOk] = useState(true);
  const [rearOk, setRearOk] = useState(true);
  const [tyresOk, setTyresOk] = useState(true);
  const [lightsOk, setLightsOk] = useState(true);
  const [odometerKm, setOdometerKm] = useState("12400");
  const [fuelLevel, setFuelLevel] = useState("FULL");
  const [handoverPhotos, setHandoverPhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);

  // Return checklist & damage inspection
  const [hasDamage, setHasDamage] = useState(false);
  const [damageNotes, setDamageNotes] = useState("");
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, mutate } = useSWR<{ booking: any }>(
    `/api/marketplace/rentals/bookings/${bookingId}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const booking = data?.booking;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, isReturn = false) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    sounds.pop();
    haptics.light();

    try {
      toast.loading("Uploading vehicle inspection photo...", { id: "upload-insp" });
      const res = await uploadImageToImgBB(files[0]);
      const url = res.displayUrl || res.url;
      if (isReturn) {
        setReturnPhotos((prev) => [...prev, url]);
      } else {
        setHandoverPhotos((prev) => [...prev, url]);
      }
      toast.success("Photo attached! 📸", { id: "upload-insp" });
    } catch {
      toast.error("Failed to upload photo", { id: "upload-insp" });
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleCompleteHandover(e: React.FormEvent) {
    e.preventDefault();
    sounds.send();
    haptics.success();
    setIsSubmittingHandover(true);

    try {
      // 1. Submit handover inspection
      await fetch(`/api/merchant/bikes/bookings/${bookingId}/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PICKUP_HANDOVER",
          frontOk,
          rearOk,
          tyresOk,
          lightsOk,
          odometerKm: parseInt(odometerKm, 10) || null,
          fuelLevel,
          photos: handoverPhotos,
        }),
      });

      // 2. Advance booking status to ACTIVE
      await fetch(`/api/merchant/bikes/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });

      mutate();
      toast.success("Handover Complete! Rental Started 🛵");
      setShowHandoverModal(false);
    } catch {
      toast.error("Failed to start rental");
    } finally {
      setIsSubmittingHandover(false);
    }
  }

  async function handleCompleteReturn(e: React.FormEvent) {
    e.preventDefault();
    sounds.send();
    haptics.success();
    setIsSubmittingReturn(true);

    try {
      // 1. Submit return inspection
      await fetch(`/api/merchant/bikes/bookings/${bookingId}/inspection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "RETURN_CHECK",
          frontOk: !hasDamage,
          rearOk: !hasDamage,
          tyresOk: !hasDamage,
          lightsOk: !hasDamage,
          hasDamage,
          damageNotes: damageNotes.trim() || undefined,
          photos: returnPhotos,
        }),
      });

      // 2. Advance booking status to RETURNED (or DISPUTED if damage)
      const nextStatus = hasDamage ? "DISPUTED" : "RETURNED";
      await fetch(`/api/merchant/bikes/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      mutate();
      toast.success(
        hasDamage
          ? "Return logged. Damage flagged for review & dispute state."
          : "Return inspection complete! Vehicle freed up."
      );
      setShowReturnModal(false);
    } catch {
      toast.error("Failed to log return");
    } finally {
      setIsSubmittingReturn(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center px-4 space-y-3">
        <p className="text-base font-bold text-foreground">Booking not found</p>
        <button
          type="button"
          onClick={() => router.push("/merchant-portal/bikes/bookings")}
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold"
        >
          View Bookings
        </button>
      </div>
    );
  }

  // Late return calculation
  const expectedReturnTime = new Date(booking.endAt).getTime();
  const nowTime = Date.now();
  const isLate = booking.status === "ACTIVE" && nowTime > expectedReturnTime;
  const lateHours = isLate ? Math.ceil((nowTime - expectedReturnTime) / (1000 * 60 * 60)) : 0;

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-5 select-none pb-24">
      {/* ─── Header ─── */}
      <header className="flex h-14 items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/merchant-portal/bikes/bookings")}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight leading-none">
              Booking #{booking.bookingNumber}
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              {booking.bike?.name} · {formatTimeAgo(booking.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border",
            booking.status === "CONFIRMED" || booking.status === "ACTIVE"
              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
              : "bg-amber-500/15 text-amber-500 border-amber-500/30"
          )}
        >
          {booking.status}
        </span>
      </header>

      {/* ─── Late Return Warning (PRD Item 16) ─── */}
      {isLate && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 animate-bounce" />
            <span>⚠️ Return is OVERDUE by {lateHours} hour(s)</span>
          </div>
          <span>Expected: {new Date(booking.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      )}

      {/* ─── Customer & Verification Card (PRD Item 13) ─── */}
      <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-3.5 text-xs shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <User className="size-4 text-primary" />
          <span>Customer &amp; Identity Verification</span>
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">
              {booking.student?.displayName} (@{booking.student?.username})
            </p>
            <p className="text-muted-foreground">{booking.hostelAddress}</p>
          </div>

          <a
            href={`tel:${booking.customerPhone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold hover:bg-emerald-500/25 transition-colors"
          >
            <Phone className="size-3.5" />
            <span>{booking.customerPhone}</span>
          </a>
        </div>

        {/* Verification Check Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-0.5">
            <CheckCircle2 className="size-3.5 text-emerald-500 mx-auto" />
            <p className="text-[10px] font-bold text-emerald-500">Student ID</p>
            <p className="text-[9px] text-muted-foreground">Verified</p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-0.5">
            <CheckCircle2 className="size-3.5 text-emerald-500 mx-auto" />
            <p className="text-[10px] font-bold text-emerald-500">Driving Licence</p>
            <p className="text-[9px] text-muted-foreground truncate">{booking.documents?.drivingLicenseNumber}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-0.5">
            <CheckCircle2 className="size-3.5 text-emerald-500 mx-auto" />
            <p className="text-[10px] font-bold text-emerald-500">Aadhaar</p>
            <p className="text-[9px] text-muted-foreground">
              {booking.documents?.aadhaarLast4 ? `****${booking.documents.aadhaarLast4}` : "Verified"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Vehicle & Timing Card ─── */}
      <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-3 text-xs shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Bike className="size-4 text-emerald-500" />
          <span>Vehicle &amp; Rental Schedule</span>
        </h2>

        <div className="flex items-center gap-3">
          <div className="size-14 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/30">
            <img src={booking.bike?.imageUrl} alt={booking.bike?.name} className="size-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">{booking.bike?.name}</p>
            <p className="text-muted-foreground font-semibold">Plate: {booking.bike?.registrationNumber}</p>
            <p className="text-[10px] text-muted-foreground">Pickup: {booking.bike?.pickupLocation}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Pickup</p>
            <p className="font-bold text-foreground">
              {new Date(booking.startAt).toLocaleString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Expected Return</p>
            <p className="font-bold text-foreground">
              {new Date(booking.endAt).toLocaleString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Payments & Deposit Card ─── */}
      <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-2.5 text-xs shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Payment Breakdown
        </h2>

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Rental Amount</span>
          <span className="text-foreground font-bold">₹{booking.rentalAmount}</span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Security Deposit (Refundable)</span>
          <span className="text-foreground font-bold">₹{booking.depositAmount}</span>
        </div>

        <div className="pt-2 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
          <span>Total Collected ({booking.paymentMethod})</span>
          <span className="text-base text-emerald-500">₹{booking.totalAmount}</span>
        </div>
      </div>

      {/* ─── PRIMARY ACTIONS (Handover / Return Flow) ─── */}
      <div className="space-y-3 pt-2">
        {booking.status === "READY_FOR_PICKUP" && (
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setShowHandoverModal(true);
            }}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <KeyRound className="size-4" />
            <span>Perform Handover Inspection &amp; Start Rental</span>
          </button>
        )}

        {booking.status === "ACTIVE" && (
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setShowReturnModal(true);
            }}
            className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Perform Return Inspection &amp; Settle</span>
          </button>
        )}
      </div>

      {/* ─── HANDOVER INSPECTION MODAL (PRD Item 14) ─── */}
      {showHandoverModal && (
        <div
          onClick={() => setShowHandoverModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/50 p-5 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Pickup Handover Checklist
                </h3>
                <p className="text-xs text-muted-foreground">Verify vehicle condition with student</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteHandover} className="space-y-3.5 text-xs">
              <div className="space-y-2">
                <label className="font-bold uppercase text-muted-foreground block text-[11px]">
                  Condition Checklist
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={frontOk}
                    onChange={(e) => setFrontOk(e.target.checked)}
                    className="size-4 rounded accent-emerald-500"
                  />
                  <span>Front body, brakes &amp; mirrors OK</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rearOk}
                    onChange={(e) => setRearOk(e.target.checked)}
                    className="size-4 rounded accent-emerald-500"
                  />
                  <span>Rear suspension, mudguard &amp; seat OK</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tyresOk}
                    onChange={(e) => setTyresOk(e.target.checked)}
                    className="size-4 rounded accent-emerald-500"
                  />
                  <span>Tyres pressure &amp; grip OK</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lightsOk}
                    onChange={(e) => setLightsOk(e.target.checked)}
                    className="size-4 rounded accent-emerald-500"
                  />
                  <span>Headlights &amp; indicators working</span>
                </label>
              </div>

              {/* Handover Photos for disputes prevention */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold uppercase text-muted-foreground block text-[11px]">
                  Handover Photos (Prevents Damage Disputes)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {handoverPhotos.map((p, idx) => (
                    <div key={idx} className="size-16 rounded-xl overflow-hidden border bg-muted">
                      <img src={p} alt="Handover Photo" className="size-full object-cover" />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="size-16 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {isUploadingPhoto ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                    <span className="text-[9px] font-bold mt-0.5">Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, false)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingHandover}
                  className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmittingHandover ? <Loader2 className="size-4 animate-spin" /> : "Start Rental (Keys Handed Over)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── RETURN INSPECTION MODAL (PRD Item 15) ─── */}
      {showReturnModal && (
        <div
          onClick={() => setShowReturnModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/50 p-5 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
              <div>
                <h3 className="text-base font-black text-foreground">Return Vehicle Inspection</h3>
                <p className="text-xs text-muted-foreground">Check vehicle condition &amp; process refund</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteReturn} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase text-muted-foreground block text-[11px]">
                  Return Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      setHasDamage(false);
                    }}
                    className={cn(
                      "p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer",
                      !hasDamage
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-500 font-black"
                        : "bg-muted/40 border-border/40 text-muted-foreground"
                    )}
                  >
                    <Check className="size-3.5" />
                    <span>No New Damage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      setHasDamage(true);
                    }}
                    className={cn(
                      "p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer",
                      hasDamage
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-500 font-black"
                        : "bg-muted/40 border-border/40 text-muted-foreground"
                    )}
                  >
                    <AlertTriangle className="size-3.5" />
                    <span>Damage Detected</span>
                  </button>
                </div>
              </div>

              {/* If damage detected */}
              {hasDamage && (
                <div className="space-y-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                  <p className="text-[11px] font-bold text-rose-500">
                    Damage Assessment (Flagged for Admin &amp; Student Review)
                  </p>
                  <textarea
                    rows={2}
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder="Describe scratches, dent, broken mirror..."
                    className="w-full rounded-xl bg-card border border-border p-2.5 text-xs outline-none resize-none"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmittingReturn ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : hasDamage ? (
                    "Flag Damage & Hold Deposit"
                  ) : (
                    "Confirm Return & Release Deposit (₹1,500)"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
