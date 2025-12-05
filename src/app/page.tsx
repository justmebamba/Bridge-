import { TikTokBridgeHero } from "@/components/tiktok-bridge-hero";
import { SuccessStoriesSection } from "@/components/success-stories-section";
import { AboutBridgingSection } from "@/components/about-bridging-section";

export default function Home() {
  return (
    <div>
      <TikTokBridgeHero />
      <AboutBridgingSection />
      <SuccessStoriesSection />
    </div>
  );
}
