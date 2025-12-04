import { TikTokBridgeHero } from "@/components/tiktok-bridge-hero";
import { SuccessStoriesSection } from "@/components/success-stories-section";
import { WhyBridgeSection } from "@/components/why-bridge-section";

export default function Home() {
  return (
    <div>
      <TikTokBridgeHero />
      <WhyBridgeSection />
      <SuccessStoriesSection />
    </div>
  );
}
