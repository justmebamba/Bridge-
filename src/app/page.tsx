import { TikTokLogo } from "@/components/icons/tiktok-logo";
import { TikTokBridgeForm } from '@/components/tiktok-bridge-form';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <TikTokLogo className="h-16 w-16" />
          <h1 className="text-3xl font-bold tracking-tighter text-center font-headline">TikTok Bridge</h1>
          <p className="text-muted-foreground text-center max-w-xs">
            Unlock monetization in your country. Follow the steps to link your account.
          </p>
        </div>
        <TikTokBridgeForm />
      </div>
    </main>
  );
}
