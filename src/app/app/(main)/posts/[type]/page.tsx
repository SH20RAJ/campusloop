import { FeedClient } from "../../feed-client";
import { Metadata } from "next";

interface PostsTypePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: PostsTypePageProps): Promise<Metadata> {
  const { type } = await params;
  const uppercaseType = type.toUpperCase();
  
  let label = "Posts";
  if (uppercaseType === "POLL") label = "Campus Polls";
  else if (uppercaseType === "CONFESSION") label = "Campus Confessions";
  else if (uppercaseType === "QUESTION") label = "Campus Q&A";

  return {
    title: `${label} | CampusLoop`,
    description: `Browse ${label.toLowerCase()} from verified students on CampusLoop.`,
  };
}

export default async function PostsTypePage({ params }: PostsTypePageProps) {
  const { type } = await params;
  const uppercaseType = type.toUpperCase();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Campus ${uppercaseType}`,
    description: `Filtered ${uppercaseType} stream on CampusLoop.`,
    url: `https://campusloop.space/app/posts/${uppercaseType}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FeedClient forcedType={uppercaseType} />
    </>
  );
}
