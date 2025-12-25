
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export function TikTokBridgeHero() {

  return (
    <>
      <section className="relative">
        {/* Black top section */}
        <div className="bg-black pb-48 md:pb-64">
            <div className="container px-4 pt-16 sm:pt-24 lg:pt-32">
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

        {/* Image container, positioned to overlap */}
        <div className="container px-4">
            <div className="relative h-64 md:h-96 w-full -mt-32 md:-mt-48">
                <Image 
                    src="https://picsum.photos/seed/creator/1200/600" 
                    alt="Creator painting a glass" 
                    data-ai-hint="creator painting"
                    fill
                    className="rounded-xl object-cover shadow-lg"
                />
            </div>
        </div>
        
        {/* White bottom section with button */}
        <div className="bg-background rounded-t-2xl md:rounded-t-3xl -mt-4 md:-mt-6 relative z-10">
            <div className="container px-4 pt-16 pb-16 text-center">
                 <Button asChild size="lg" className="rounded-full px-8 text-lg">
                  <Link href="/start">Get started</Link>
                </Button>
            </div>
        </div>

      </section>
    </>
  );
}
