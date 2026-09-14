"use client";

import AccordionIndexed from "@/components/ruixen/accordion-indexed";

export function CleanFAQ() {
  const faqItems = [
    {
      id: "verification",
      title: "How does institutional email verification work?",
      content:
        "You sign in with your official college email address ending in .ac.in or .edu.in. Our automated validation verifies your domain against the national university registry, instantly unlocking your college hub. Outsiders, spammers, and commercial coaching bots cannot enter.",
    },
    {
      id: "privacy",
      title: "Can college professors or administration view who posted anonymously?",
      content:
        "No. CampusLoop is an independent student platform built with cryptographic identity escrow. Anonymous confessions and student polls store zero foreign-key references to your student profile in query layers. Neither professors nor administrators can trace anonymous posts.",
    },
    {
      id: "unlisted",
      title: "What if my college or branch isn't listed yet?",
      content:
        "You can request your university hub in 30 seconds via the Colleges Directory. If your college uses an active institutional email domain, our system automatically provisions your campus hub as soon as 5 students sign up.",
    },
    {
      id: "aspirants",
      title: "Can aspirants (JEE / NEET / CUET) explore campus insights?",
      content:
        "Yes! High school and entrance exam aspirants can explore public college hubs in Viewer Mode via the Aspirants portal, reading authentic student insights, placement culture, and campus reviews without posting in private feeds.",
    },
    {
      id: "pricing",
      title: "Is CampusLoop completely free for students?",
      content:
        "Yes, CampusLoop is 100% free for verified college students forever. There are no paywalls for semester notes, campus confessions, or student hubs.",
    },
  ];

  return (
    <section className="py-20 border-t border-border/40 bg-background">
      <div className="mx-auto max-w-5xl px-6 mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
          Everything you need to know about verification, anonymity escrow, and campus security.
        </p>
      </div>

      <AccordionIndexed items={faqItems} defaultValue="verification" className="max-w-2xl mx-auto px-6" />
    </section>
  );
}
