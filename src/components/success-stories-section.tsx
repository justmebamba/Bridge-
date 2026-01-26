
import Image from "next/image";
import { SuccessCarousel } from "./success-carousel";

export function SuccessStoriesSection() {
  return (
    <section className="bg-black text-white">
      <div className="container mx-auto px-4 py-20 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Real Results from Bridged Creators
          </h2>
        </div>
      </div>
      <SuccessCarousel />
    </section>
  );
}
