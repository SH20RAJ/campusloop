import { getDb } from "@/db";
import { communities, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { CreateCommunityDialog } from "./create-community-dialog";
import { JoinCommunityButton } from "./join-community-button";
import Link from "next/link";
import { Users2, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communities | CampusLoop",
};

export default async function CommunitiesPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  // Fetch all communities
  const allCommunities = await db.query.communities.findMany({
    orderBy: [desc(communities.createdAt)],
    with: {
      members: true,
      creator: true,
    }
  });

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 py-4 backdrop-blur-xl border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" /> Communities
          </h1>
          <p className="text-xs text-muted-foreground">Join student circles or create your own.</p>
        </div>
        <CreateCommunityDialog />
      </header>

      {/* Grid of Communities */}
      <div className="grid gap-4 sm:grid-cols-2">
        {allCommunities.map((c) => {
          const isMember = c.members.some((m) => m.userId === profile.id);
          const membersCount = c.members.length;

          return (
            <div 
              key={c.id} 
              className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-border/80 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <Link 
                    href={`/app/communities/${c.id}`}
                    className="font-bold text-foreground hover:text-primary transition-colors hover:underline text-sm leading-tight"
                  >
                    {c.name}
                  </Link>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded border border-border">
                    {membersCount} {membersCount === 1 ? "member" : "members"}
                  </span>
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-border pt-4">
                <span className="text-[10px] text-muted-foreground">
                  By @{c.creator?.username || "admin"}
                </span>
                <div className="flex items-center gap-2">
                  <JoinCommunityButton communityId={c.id} initialIsMember={isMember} />
                  <Link
                    href={`/app/communities/${c.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {allCommunities.length === 0 && (
          <div className="col-span-2 text-center py-16 border border-dashed rounded-xl border-border bg-card text-muted-foreground text-sm">
            No communities have been created yet. Be the first to start one!
          </div>
        )}
      </div>
    </main>
  );
}
