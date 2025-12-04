import { TikTokBridgeHero } from "@/components/tiktok-bridge-hero";
import { TikTokBridgeForm } from '@/components/tiktok-bridge-form';

export default function Home() {
  return (
    <div className="container relative">
      <TikTokBridgeHero />
      <div className="flex w-full items-center justify-center py-12 md:py-24">
        <div className="w-full max-w-md">
            <TikTokBridgeForm />
        </div>
      </div>
    </div>
  );
}
