import { TikTokBridgeHero } from "@/components/tiktok-bridge-hero";

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-black"></div>
      <div className="container relative">
        <TikTokBridgeHero />
      </div>
    </div>
  );
}
