"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { TikTokBridgeForm } from "./tiktok-bridge-form";
import { Dialog, DialogContent } from "./ui/dialog";
import Image from "next/image";

export function TikTokBridgeHero() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <section className="mx-auto grid max-w-screen-xl grid-cols-1 items-center gap-12 px-4 py-8 md:grid-cols-2 md:py-12 lg:py-24">
        <div className="flex flex-col items-start gap-6 text-white md:text-inherit">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
            Welcome to the <br className="hidden md:block" />
            <span className="text-primary">TikTok Bridge</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Securely link your TikTok account to unlock new monetization opportunities. Follow the simple steps below to get started.
          </p>
          <div className="flex w-full items-center justify-start space-x-4 py-4">
            <Button size="lg" className="rounded-full px-8 text-lg" onClick={() => setIsFormOpen(true)}>
              Get started
            </Button>
          </div>
        </div>
        <div className="relative flex h-full min-h-[400px] w-full items-center justify-center">
            <Image 
                src="https://picsum.photos/seed/creator/800/600" 
                alt="Creator painting a glass" 
                data-ai-hint="creator painting"
                fill
                className="rounded-xl object-cover"
            />
        </div>
      </section>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
          <TikTokBridgeForm onFinished={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
