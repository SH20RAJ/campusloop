"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  Fuel,
  Gauge,
  HardHat,
  IdCard,
  ImagePlus,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface BikeDetailClientProps {
  bikeId: string;
  profileId: string;
}

export function BikeDetailClient({ bikeId, profileId }: BikeDetailClientProps) {
  const router = useRouter();

  // Date selection states (Default: start tomorrow 10:00 AM -> end day after 10:00 AM)
  const [startDateTime, setStartDateTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [endDateTime, setEndDateTime] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  // Verification Form states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState<string | null>(null);
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [hostelAddress, setHostelAddress] = useState("Hostel 11 (Boys), Room 204");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch bike details & live availability
  const { data, isLoading } = useSWR<{
    bike: any;
    availability: {
      isAvailableForDates: boolean;
      overlapReason: string | null;
      rentalDays: number;
      rentalAmount: number;
      depositAmount: number;
      totalPayable: number;
    };
  }>(
    `/api/marketplace/rentals/bikes/${bikeId}?startAt=${encodeURIComponent(
      startDateTime
    )}&endAt=${encodeURIComponent(endDateTime)}`,
    fetcher,
    { dedupingInterval: 5000 }
  );

  const bike = data?.bike;
  const availability = data?.availability;

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingDoc(true);
    sounds.pop();
    haptics.light();

    try {
      toast.loading("Uploading license photo...", { id: "upload-doc" });
      const res = await uploadImageToImgBB(files[0]);
      setDrivingLicenseUrl(res.displayUrl || res.url);
      toast.success("License photo attached! 📸", { id: "upload-doc" });
    } catch {
      toast.error("Failed to upload document", { id: "upload-doc" });
    } finally {
      setIsUploadingDoc(false);
    }
  }

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();

    if (!drivingLicenseNumber.trim()) {
      toast.error("Please provide your Driving License number");
      return;
    }

    if (!customerPhone.trim()) {
      toast.error("Please provide your contact phone number");
      return;
    }

    if (!hostelAddress.trim()) {
      toast.error("Please provide your hostel address");
      return;
    }

    sounds.send();
    haptics.success();
    setIsSubmitting(true);

    try {
      toast.loading("Submitting booking request...", { id: "book-bike" });

      const res = await fetch("/api/marketplace/rentals/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikeId,
          startAt: new Date(startDateTime).toISOString(),
          endAt: new Date(endDateTime).toISOString(),
          customerPhone: customerPhone.trim(),
          hostelAddress: hostelAddress.trim(),
          specialNotes: specialNotes.trim() || undefined,
          drivingLicenseNumber: drivingLicenseNumber.trim(),
          drivingLicenseUrl,
          aadhaarLast4: aadhaarLast4.trim() || undefined,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData?.error || "Failed to book bike");
      }

      const resData = (await res.json()) as { bookingId: string };
      toast.success("Booking Requested Successfully! 🚲", { id: "book-bike" });
      router.push(`/app/marketplace/rentals/booking/${resData.bookingId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to book bike", { id: "book-bike" });
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center px-4 space-y-3">
        <p className="text-base font-bold text-foreground">Bike not found</p>
        <button
          type="button"
          onClick={() => router.push("/app/marketplace")}
          className="px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28">
      {/* ─── Top Bike Image Hero ─── */}
      <div className="relative h-60 sm:h-72 w-full bg-muted overflow-hidden">
        <img src={bike.imageUrl} alt={bike.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              router.back();
            }}
            className="flex size-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>

          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-black text-white border border-white/20">
            Reg: {bike.registrationNumber}
          </span>
        </div>

        {/* Bike Title & Rating Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase">
              {bike.status}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
              <Star className="size-3.5 fill-amber-300" />
              <span>
                {bike.rating} ({bike.reviewCount} rentals)
              </span>
            </span>
          </div>

          <h1 className="text-xl font-black tracking-tight">{bike.name}</h1>
          <p className="text-xs text-white/80 flex items-center gap-1.5">
            <MapPin className="size-3.5 text-rose-400" />
            <span>
              Pickup: {bike.pickupLocation} · {bike.merchant?.name}
            </span>
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* ─── Specs Strip ─── */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-card border border-border/40 text-center space-y-0.5 shadow-xs">
            <Fuel className="size-4 text-primary mx-auto" />
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Fuel Type</p>
            <p className="text-xs font-black text-foreground">{bike.fuelType}</p>
          </div>

          <div className="p-3 rounded-2xl bg-card border border-border/40 text-center space-y-0.5 shadow-xs">
            <Gauge className="size-4 text-emerald-500 mx-auto" />
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Mileage / Specs</p>
            <p className="text-xs font-black text-foreground">{bike.specs?.mileage || "45 kmpl"}</p>
          </div>

          <div className="p-3 rounded-2xl bg-card border border-border/40 text-center space-y-0.5 shadow-xs">
            <HardHat className="size-4 text-amber-500 mx-auto" />
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Helmet</p>
            <p className="text-xs font-black text-foreground">Included Free</p>
          </div>
        </div>

        {/* ─── 1. Select Date & Time ─── */}
        <div className="p-4 rounded-3xl bg-card border border-border/40 space-y-3 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-4 text-primary" />
            <span>1. Select Rental Duration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">Start Date &amp; Time *</label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">Return Date &amp; Time *</label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 px-3.5 text-xs font-bold text-foreground focus:border-foreground outline-none"
              />
            </div>
          </div>

          {/* Availability Alert */}
          {availability && (
            <div
              className={cn(
                "p-3 rounded-2xl border text-xs flex items-center gap-2 font-semibold",
                availability.isAvailableForDates
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-500"
              )}
            >
              {availability.isAvailableForDates ? (
                <>
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>🟢 Available for your selected dates ({availability.rentalDays} days)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{availability.overlapReason}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* ─── 2. Price Breakdown (Clear Distinction: Rental ≠ Deposit) ─── */}
        <div className="p-4 rounded-3xl bg-card border border-border/40 space-y-3 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            2. Transparent Bill Breakdown
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                Rental Charge ({availability?.rentalDays || 1} days × ₹{bike.dailyPrice}/day)
              </span>
              <span className="text-foreground font-black">
                ₹{(availability?.rentalAmount || bike.dailyPrice).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-blue-400" />
                <span>Refundable Security Deposit</span>
              </div>
              <span className="text-foreground font-black">
                ₹{bike.securityDeposit.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-400 font-medium leading-relaxed">
              💡 <strong>Note:</strong> The ₹{bike.securityDeposit} security deposit is held safely during
              your trip and refunded 100% directly upon returning the vehicle.
            </div>

            <div className="pt-2 border-t border-border/30 flex items-center justify-between text-sm font-black text-foreground">
              <span>Total Payable Amount</span>
              <span className="text-base text-emerald-500">
                ₹
                {(availability?.totalPayable || bike.dailyPrice + bike.securityDeposit).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Action Button: Open Verification & Booking ─── */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!availability?.isAvailableForDates}
            onClick={() => {
              sounds.tap();
              haptics.light();
              setShowVerificationModal(true);
            }}
            className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="size-4" />
            <span>Verify &amp; Request Booking</span>
          </button>
        </div>
      </div>

      {/* ─── Verification & Booking Modal ─── */}
      {showVerificationModal && (
        <div
          onClick={() => setShowVerificationModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border border-border/50 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div>
                <h3 className="text-base font-black text-foreground">Rental Identity Verification</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Required for vehicle handover on campus
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Verification Checklist Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-0.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 mx-auto" />
                  <p className="text-[10px] font-bold text-emerald-500">Student ID</p>
                  <p className="text-[9px] text-muted-foreground">Verified Student</p>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center space-y-0.5">
                  <IdCard className="size-3.5 text-primary mx-auto" />
                  <p className="text-[10px] font-bold text-foreground">Driving Licence</p>
                  <p className="text-[9px] text-muted-foreground">Required</p>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center space-y-0.5">
                  <Lock className="size-3.5 text-amber-500 mx-auto" />
                  <p className="text-[10px] font-bold text-foreground">Aadhaar Last 4</p>
                  <p className="text-[9px] text-muted-foreground">Required</p>
                </div>
              </div>

              {/* Driving License Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground">
                  Driving License Number *
                </label>
                <input
                  type="text"
                  required
                  value={drivingLicenseNumber}
                  onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                  placeholder="e.g. DL-1420110012345"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border/50 px-3 text-xs font-bold text-foreground outline-none uppercase"
                />
              </div>

              {/* Driving License Photo Upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground">
                  License Photo Attachment (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {drivingLicenseUrl ? (
                    <div className="relative size-16 rounded-xl overflow-hidden border border-border bg-muted">
                      <img src={drivingLicenseUrl} alt="DL Preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDrivingLicenseUrl(null)}
                        className="absolute top-1 right-1 size-4 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingDoc}
                      className="px-3.5 py-2 rounded-xl border border-dashed border-border hover:border-foreground/50 text-xs font-bold text-muted-foreground flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUploadingDoc ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ImagePlus className="size-3.5" />
                      )}
                      <span>Upload License Photo</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDocUpload}
                  />
                </div>
              </div>

              {/* Aadhaar Last 4 & Contact Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground">Aadhaar Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value)}
                    placeholder="4829"
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border/50 px-3 text-xs font-bold text-foreground outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-10 rounded-xl bg-muted/40 border border-border/50 px-3 text-xs font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              {/* Hostel / Residence Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground">
                  Hostel / Campus Room Address *
                </label>
                <input
                  type="text"
                  required
                  value={hostelAddress}
                  onChange={(e) => setHostelAddress(e.target.value)}
                  placeholder="e.g. Hostel 11 (Boys), Room 204"
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border/50 px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-muted-foreground">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setPaymentMethod("COD");
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer",
                      paymentMethod === "COD"
                        ? "bg-foreground text-background border-foreground font-black"
                        : "bg-muted/40 text-muted-foreground border-border/40"
                    )}
                  >
                    <Wallet className="size-3.5" />
                    <span>Pay at Pickup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setPaymentMethod("UPI");
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer",
                      paymentMethod === "UPI"
                        ? "bg-foreground text-background border-foreground font-black"
                        : "bg-muted/40 text-muted-foreground border-border/40"
                    )}
                  >
                    <CreditCard className="size-3.5" />
                    <span>UPI on Pickup</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Requesting Booking...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4 stroke-3" />
                      <span>
                        Request Booking · ₹{(availability?.totalPayable || 0).toLocaleString("en-IN")}
                      </span>
                    </>
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
