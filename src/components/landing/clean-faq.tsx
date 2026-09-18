"use client";

import AccordionIndexed from "@/components/ruixen/accordion-indexed";

export function CleanFAQ() {
  const faqItems = [
    {
      id: "verification",
      title: "How do I join my campus?",
      content:
        "Create an account with your institutional college email. CampusLoop checks the university domain and then connects you to the appropriate campus hub.",
    },
    {
      id: "anonymous",
      title: "Can I post anonymously?",
      content:
        "Yes. CampusLoop supports anonymous posting for eligible campus conversations. The public post does not need to expose your student identity.",
    },
    {
      id: "college",
      title: "What if my college is not listed?",
      content:
        "Use the Colleges Directory to find your university or request a new campus hub. CampusLoop is continually expanding its college directory.",
    },
    {
      id: "academics",
      title: "What can I find in Academics?",
      content:
        "The academic vault can contain lecture notes, module resources, previous-year question papers, lab manuals, playlists and other student-contributed study material.",
    },
    {
      id: "pricing",
      title: "Does it cost anything to join?",
      content:
        "CampusLoop is free for verified students. Some campus services may evolve separately, but the core student network is free to use.",
    },
  ];

  return (
    <section className="border-b border-border/70 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Clear answers before you join.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            No marketing language — just the basics you need to know.
          </p>
        </div>

        <AccordionIndexed
          items={faqItems}
          defaultValue="verification"
          className="mx-auto mt-10 px-0"
        />
      </div>
    </section>
  );
}
