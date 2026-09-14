"use client";

import { SplitFeatureShowcase } from "@/components/ruixen/split-feature-showcase";

export function CleanWorkflow() {
  return (
    <section className="py-20 border-t border-border/40 bg-muted/15">
      <div className="mx-auto max-w-5xl px-6 mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Built for how campus life actually moves.
        </h2>
        <p className="mt-3 text-base text-muted-foreground max-w-xl mx-auto">
          No external spam, no commercial ads. Just the real, high-context conversations and notices happening inside your university.
        </p>
      </div>

      <SplitFeatureShowcase
        leftTitle="Conversations that stay in context."
        leftDescription="Discuss course doubts, hostel news, and fest updates with real-time threads, presence indicators, and verified peer reactions."
        rightTitle="Your campus pulse in one place."
        rightDescription="From exam alerts to club recruitments, everything happening across your department and hostel is organized chronologically."
        workflowItems={[
          "End-Sem exam schedule alerts",
          "Hostel mess menu & night canteen polls",
          "Technical society recruitments",
          "Hackathon team & project matching",
          "Lecture notes & solved PYQ uploads",
          "Lost & found campus recovery",
          "Cultural fest passes & updates",
        ]}
      />
    </section>
  );
}
