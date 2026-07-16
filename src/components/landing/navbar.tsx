import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isAuthenticated: boolean;
}

export function Navbar({ isAuthenticated }: NavbarProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md lg:px-12">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <GraduationCap className="h-5 w-5 text-primary" />
        <span>CampusLoop</span>
      </Link>

      <nav className="flex items-center gap-3">
        {isAuthenticated ? (
          <Link href="/app/campus">
            <Button size="sm">Go to Feeds</Button>
          </Link>
        ) : (
          <>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Join with College Email</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
