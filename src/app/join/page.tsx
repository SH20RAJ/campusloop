import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface JoinPageProps {
  searchParams: Promise<{ mode?: string; invite?: string }>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { mode, invite } = await searchParams;

  if (invite) {
    try {
      const cookieStore = await cookies();
      cookieStore.set("cl_referred_by", invite, {
        path: "/",
        maxAge: 604800,
        sameSite: "lax",
      });
    } catch {
      // ignore cookie set errors in server context
    }
  }

  if (mode === "signin") {
    redirect("/handler/sign-in");
  }

  redirect("/handler/sign-up");
}
