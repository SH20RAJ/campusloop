import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShortCommunityRedirectPage({ params }: PageProps) {
  const { id } = await params;
  permanentRedirect(`/app/communities/${id}`);
}

