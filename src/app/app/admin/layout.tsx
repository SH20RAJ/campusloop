import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile || profile.role !== "ADMIN") {
    // If not admin, redirect to campus feed
    redirect("/app/campus");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-background/80 px-4 py-4 backdrop-blur-xl">
        <h1 className="text-xl font-bold tracking-tight text-primary">Admin Panel</h1>
        <nav className="flex gap-4">
          <Link href="/app/admin" className="text-sm font-medium hover:text-primary">Dashboard</Link>
          <Link href="/app/admin/colleges" className="text-sm font-medium hover:text-primary">Colleges</Link>
          <Link href="/app/campus" className="text-sm font-medium text-muted-foreground hover:text-primary">Exit Admin</Link>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
