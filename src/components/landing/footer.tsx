import Link from "next/link";
import { GraduationCap } from "lucide-react";

const footerLinks = [
  {
    label: "Product",
    items: [
      { href: "/sign-up", label: "Sign Up" },
      { href: "/sign-in", label: "Sign In" },
      { href: "/app/campus", label: "Campus Feed" },
    ],
  },
  {
    label: "Safety",
    items: [
      { href: "#", label: "Community Guidelines" },
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Report Content" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>CampusLoop</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The verified social layer for college life. Built for students, by
              design.
            </p>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.label}>
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </span>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} CampusLoop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
