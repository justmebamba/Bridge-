import Image from "next/image";
import { SuccessCarousel } from "./success-carousel";

export function SuccessStoriesSection() {
  return (
    <section className="bg-black text-white">
      <div className="container mx-auto px-4 py-20 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            See how these creators leveraged the TikTok Bridge to achieve their goals
          </h2>
        </div>
        <div className="mt-16">
          <div className="relative aspect-[9/16] w-full max-w-sm mx-auto">
             <Image 
                src="https://picsum.photos/seed/bahamas/600/900"
                alt="A creator enjoying a vacation"
                data-ai-hint="man vacation"
                fill
                className="rounded-xl object-cover shadow-lg"
             />
          </div>
        </div>
      </div>
      <SuccessCarousel />
    </section>
  );
}
