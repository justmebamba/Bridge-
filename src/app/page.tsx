
"use client";

import { SuccessStoriesSection } from "@/components/success-stories-section";
import { AboutBridgingSection } from "@/components/about-bridging-section";
import { FeaturesSection } from "@/components/features-section";
import { ContactUsSection } from "@/components/contact-us-section";
import { useRouter } from "next/navigation";
import { BonusBanner } from "@/components/bonus-banner";
import { FaqSection } from "@/components/faq-section";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <BonusBanner />
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="about">
        <AboutBridgingSection />
      </section>
      <section id="success-stories">
        <SuccessStoriesSection />
      </section>
      <section id="faq">
        <FaqSection />
      </section>
       <section id="contact">
        <ContactUsSection />
      </section>
    </>
  );
}
