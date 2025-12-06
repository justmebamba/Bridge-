
"use client";

import { SuccessStoriesSection } from "@/components/success-stories-section";
import { AboutBridgingSection } from "@/components/about-bridging-section";
import { FeaturesSection } from "@/components/features-section";
import { ContactUsSection } from "@/components/contact-us-section";
import { TikTokBridgeForm } from "@/components/tiktok-bridge-form";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
  const handleGetStarted = () => {
      document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <>
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="about">
        <AboutBridgingSection onGetStarted={handleGetStarted}/>
      </section>
      <section id="get-started" className="py-16 md:py-24 bg-background">
        <div className="container">
          <TikTokBridgeForm onFinished={() => router.push('/waiting-for-approval')} />
        </div>
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
