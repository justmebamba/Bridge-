
"use client";

import { SuccessStoriesSection } from "@/components/success-stories-section";
import { AboutBridgingSection } from "@/components/about-bridging-section";
import { FeaturesSection } from "@/components/features-section";
import { ContactUsSection } from "@/components/contact-us-section";

export default function Home({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <>
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="about">
        <AboutBridgingSection onGetStarted={onGetStarted} />
      </section>
      <section id="success-stories">
        <SuccessStoriesSection />
      </section>
       <section id="contact">
        <ContactUsSection />
      </section>
    </>
  );
}
