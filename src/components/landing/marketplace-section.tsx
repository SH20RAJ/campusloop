"use client";

import {
  Printer,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import {
  LandingCard,
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";

export function MarketplaceSection() {
  return (
    <LandingSection id="marketplace" bg="default">
      <LandingContainer>
        <LandingSectionHeader
          badge="Campus Economy"
          headlineMain="Your campus has an"
          headlineHighlight="economy too."
          description="From selling your dorm cooler at the end of the year to ordering midnight canteen parathas and urgent lab printouts, CampusLoop powers the hyperlocal student economy."
          align="center"
        />

        {/* ─── Marketplace Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1 */}
          <LandingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShoppingBag className="size-5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Dorm Gear
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Hostel Peer Handover
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bicycles, coolers, lab drafters, gym weights, and textbooks handed over
              directly at hostel gates. No stranger scams, no shipping costs, and
              instant UPI settlement.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Hero Sprint Gear Cycle</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ₹2,800
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Hostel 5 Common Room • Tested & verified
              </span>
            </div>
          </LandingCard>

          {/* Tile 2 */}
          <LandingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <UtensilsCrossed className="size-5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Food & Snacks
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Late-Night Campus Canteens
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Skip third-party delivery apps with exorbitant surge fees. Order
              directly from trusted campus counters, night canteens, and coffee
              booths with live queue tracking.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Cheese Maggi + Cutting Chai</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  ₹60
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Back Gate Night Stall • Ready in 8 mins
              </span>
            </div>
          </LandingCard>

          {/* Tile 3 */}
          <LandingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Printer className="size-5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Campus Services
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Printouts & Local Services
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Upload project reports and lab files for instant printout pickup
              before the 9 AM bell. Local laundry pickups and weekend bike rentals
              verified for student safety.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Hardbound Lab Report (32 pgs)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ₹120
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Main Academic Complex Print Center
              </span>
            </div>
          </LandingCard>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
