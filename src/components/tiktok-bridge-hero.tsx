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
      <section className="relative bg-white">
        <div className="bg-black">
            <div className="container px-4 py-16 sm:py-24 lg:py-32">
                <div className="max-w-xl">
                <h1 className="text-4xl font-bold leading-tight tracking-tighter text-white md:text-5xl lg:text-6xl lg:leading-[1.1]">
                    Welcome to the <br className="hidden md:block" />
                    <span className="text-primary">TikTok Bridge</span>
                </h1>
                <p className="mt-6 max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                    Securely link your TikTok account to unlock new monetization opportunities. Follow the simple steps below to get started.
                </p>
                </div>
            </div>
        </div>

        <div className="container px-4">
            <div className="relative h-64 md:h-96 w-full -mt-16 md:-mt-24">
                <Image 
                    src="https://picsum.photos/seed/creator/1200/600" 
                    alt="Creator painting a glass" 
                    data-ai-hint="creator painting"
                    fill
                    className="rounded-xl object-cover shadow-lg"
                />
            </div>
        </div>
        
        <div className="container px-4 py-8 text-center">
             <Button size="lg" className="rounded-full px-8 text-lg" onClick={() => setIsFormOpen(true)}>
              Get started
            </Button>
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
