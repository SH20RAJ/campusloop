import { redirect } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `College Hub`,
    description: `Explore student discussions and campus hub on CampusLoop.`,
  };
}

export default async function RootCollegeRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/app/college/${id}`);
}
