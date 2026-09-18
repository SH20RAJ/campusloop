import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const columns = [
  {
    title: "Campus",
    links: [
      ["Campus Feed", "/app"],
      ["Confessions", "/app/confessions"],
      ["Events", "/app/events"],
      ["Communities", "/app/communities"],
    ],
  },
  {
    title: "Academics",
    links: [
      ["Notes & PYQs", "/app/academics"],
      ["Study Playlists", "/app/academics/playlists"],
      ["Upload Material", "/app/academics/upload"],
    ],
  },
  {
    title: "Discover",
    links: [
      ["College Directory", "/colleges"],
      ["Aspirants", "/aspirants"],
      ["Overview", "/overview"],
    ],
  },
  {
    title: "Trust",
    links: [
      ["About", "/about"],
      ["Privacy", "/privacy"],
      ["Safety", "/safety"],
      ["Terms", "/terms"],
    ],
  },
] as const;

export function CleanFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-foreground text-xs font-black text-background">C</span>
              <span className="text-sm font-black text-foreground">CampusLoop</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
              A campus community for conversations, academics, people and events — built around verified college access.
            </p>
            <div className="mt-7 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
              <a href="https://www.instagram.com/campusloop.space/" target="_blank" rel="noreferrer" className="transition hover:text-foreground">Instagram</a>
              <a href="https://www.linkedin.com/company/mycampusloop/" target="_blank" rel="noreferrer" className="transition hover:text-foreground">LinkedIn</a>
              <a href="https://x.com/mycampusloop" target="_blank" rel="noreferrer" className="transition hover:text-foreground">X</a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">{column.title}</p>
                <div className="mt-4 space-y-3">
                  {column.links.map(([label, href]) => (
                    <Link key={href} href={href} className="group flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
                      {label}
                      <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>CampusLoop · India</span>
          <span>Conversations · Academics · Communities · Events</span>
        </div>
      </div>
    </footer>
  );
}
