import { hexclaveServerApp } from "@/hexclave/server";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { SafetySection } from "@/components/landing/safety-section";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { JsonLd } from "@/components/landing/json-ld";

export default async function LandingPage() {
  const user = await hexclaveServerApp.getUser();
  const isAuthenticated = !!user;

  return (
    <>
      <JsonLd />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar isAuthenticated={isAuthenticated} />
        <main className="flex-1">
          <Hero isAuthenticated={isAuthenticated} />
          <Features />
          <HowItWorks />
          <Stats />
          <SafetySection />
          <CTA isAuthenticated={isAuthenticated} />
        </main>
        <Footer />
      </div>
    </>
  );
}
