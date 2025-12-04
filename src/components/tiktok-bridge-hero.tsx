"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { TikTokBridgeForm } from "./tiktok-bridge-form";
import { Dialog, DialogContent } from "./ui/dialog";

export function TikTokBridgeHero() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
          Welcome to the <span className="text-primary">TikTok Bridge</span>
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Securely link your TikTok account to unlock new monetization opportunities. Follow the simple steps below to get started.
        </p>
        <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
          <Button size="lg" className="rounded-full" onClick={() => setIsFormOpen(true)}>
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
