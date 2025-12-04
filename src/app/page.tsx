import { TikTokBridgeHero } from "@/components/tiktok-bridge-hero";
import { SuccessCarousel } from "@/components/success-carousel";
import { WhyBridgeSection } from "@/components/why-bridge-section";

export default function Home() {
  return (
    <div>
      <TikTokBridgeHero />
      <WhyBridgeSection />
      <SuccessCarousel />
    </div>
  );
}
