
"use client";

import { useState } from "react";
import { TikTokBridgeHero } from "@/components/tiktok-bridge-hero";
import { SuccessStoriesSection } from "@/components/success-stories-section";
import { AboutBridgingSection } from "@/components/about-bridging-section";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TikTokBridgeForm } from "@/components/tiktok-bridge-form";
import { FeaturesSection } from "@/components/features-section";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div>
      <TikTokBridgeHero onGetStarted={() => setIsFormOpen(true)} />
      <section id="about">
        <AboutBridgingSection onGetStarted={() => setIsFormOpen(true)} />
      </section>
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="success-stories">
        <SuccessStoriesSection />
      </section>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          <TikTokBridgeForm onFinished={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
