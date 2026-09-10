import { Check, X } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const COMPARISONS = [
  {
    category: "Entry Access",
    openWeb: "Anyone with a disposable email or phone number",
    campusloop: "Institutional college email (.ac.in / .edu.in) required",
  },
  {
    category: "Campus Context",
    openWeb: "Public outsiders, alumni, coaching ads, and random trolls",
    campusloop: "100% current students belonging to the specific university",
  },
  {
    category: "Privacy & Anonymity",
    openWeb: "Zero accountability or forced permanent public identity",
    campusloop: "Anonymous to peers, backed by accountable safety standards",
  },
  {
    category: "Peer Commerce & Trade",
    openWeb: "Trading with strangers; high risk of scams and ghosting",
    campusloop: "Direct peer exchanges with verified campus seniors and batchmates",
  },
  {
    category: "Community Result",
    openWeb: "Fragmented noise, mistrust, and irrelevant content",
    campusloop: "Higher trust, richer campus conversations, tight-knit network",
  },
];

export function WhyVerifiedSection() {
  return (
    <section className="border-t border-border/60 bg-background py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-16">
        {/* Section Heading */}
        <Reveal className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Comparison &amp; Trust</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Open internet vs.
            <br />
            <span className="text-primary">Verified campus network.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            When everyone in the room has verified their student status, discussions become more authentic,
            trading becomes safer, and connections become meaningful.
          </p>
        </Reveal>

        {/* Comparison Table */}
        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-1/4">
                      Dimension
                    </th>
                    <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-muted-foreground w-3/8">
                      Generic Social Apps
                    </th>
                    <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-primary w-3/8 bg-primary/5">
                      CampusLoop Verified
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs sm:text-sm">
                  {COMPARISONS.map((row) => (
                    <tr key={row.category} className="transition-colors hover:bg-muted/20">
                      <td className="p-4 sm:p-5 font-bold text-foreground">{row.category}</td>
                      <td className="p-4 sm:p-5 text-muted-foreground flex items-start gap-2">
                        <X className="size-4 shrink-0 text-destructive mt-0.5" />
                        <span>{row.openWeb}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-foreground font-medium bg-primary/[0.02]">
                        <div className="flex items-start gap-2">
                          <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
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
      </div>
    </section>
  );
}
