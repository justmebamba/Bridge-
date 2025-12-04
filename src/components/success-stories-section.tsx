import Image from "next/image";

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
          <div className="relative aspect-[4/3] w-full max-w-3xl lg:max-w-4xl mx-auto">
             <Image 
                src="https://picsum.photos/seed/product/800/600"
                alt="Showcase of a creator's product"
                data-ai-hint="product showcase"
                fill
                className="rounded-xl object-cover shadow-lg"
             />
          </div>
        </div>
      </div>
    </section>
  );
}
