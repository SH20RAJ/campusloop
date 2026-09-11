import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollegeLegacyRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/app/college/${id}`);
}
