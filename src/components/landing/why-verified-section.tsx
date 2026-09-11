import { Check, X } from "lucide-react";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { WHY_VERIFIED_CONTENT } from "@/constants/landing";

export function WhyVerifiedSection() {
  return (
    <LandingSection bg="default">
      <LandingContainer>
        {/* Section Heading */}
        <LandingSectionHeader
          eyebrow={WHY_VERIFIED_CONTENT.eyebrow}
          headlineMain={WHY_VERIFIED_CONTENT.headlineMain}
          headlineHighlight={WHY_VERIFIED_CONTENT.headlineHighlight}
          description={WHY_VERIFIED_CONTENT.description}
        />

        {/* High-Contrast Comparison Table */}
        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-2xl border border-border/40 bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    <th className="p-4 sm:p-5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-1/4">
                      {WHY_VERIFIED_CONTENT.tableHeaders.dimension}
                    </th>
                    <th className="p-4 sm:p-5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground w-3/8">
                      {WHY_VERIFIED_CONTENT.tableHeaders.openWeb}
                    </th>
                    <th className="p-4 sm:p-5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#1D9BF0] w-3/8 bg-[#1D9BF0]/5">
                      {WHY_VERIFIED_CONTENT.tableHeaders.campusloop}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs sm:text-sm">
                  {WHY_VERIFIED_CONTENT.rows.map((row) => (
                    <tr key={row.category} className="transition-colors hover:bg-muted/15">
                      <td className="p-4 sm:p-5 font-bold text-foreground">{row.category}</td>
                      <td className="p-4 sm:p-5 text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <X className="size-4 shrink-0 text-destructive mt-0.5" />
                          <span>{row.openWeb}</span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-foreground font-medium bg-[#1D9BF0]/[0.02]">
                        <div className="flex items-start gap-2">
                          <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" strokeWidth={2.5} />
                          <span>{row.campusloop}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </LandingContainer>
    </LandingSection>
  );
}
