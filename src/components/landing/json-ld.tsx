export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CampusLoop",
    applicationCategory: "SocialNetworking",
    operatingSystem: "Web",
    description:
      "Verified student-only campus social network. Share confessions, drop polls, swipe to meet students across Indian colleges. Gatekept by college email.",
    url: "https://campusloop.in",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    author: {
      "@type": "Organization",
      name: "CampusLoop",
      description: "The verified social layer for college life.",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
