import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { TrustMarquee } from "@/components/landing/trust-marquee";
import { Stats } from "@/components/landing/stats";
import { TwoReadings } from "@/components/landing/two-readings";
import { Method } from "@/components/landing/method";
import { ReportPreview } from "@/components/landing/report-preview";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "MorphIndex — analyse faciale en français",
  description: "Mesure ce qui dépend de toi : peau, cernes, pilosité, coupe, posture, dents. Indice actuel, indice atteignable, et la routine pour y aller. 18 ans et plus.",
  robots: "index,follow",
};

export default function HomePage() {
  return (
    <>
      <LandingNav />
      <Hero />
      <TrustMarquee />
      <Stats />
      <TwoReadings />
      <Method />
      <ReportPreview />
      <Testimonials />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </>
  );
}
