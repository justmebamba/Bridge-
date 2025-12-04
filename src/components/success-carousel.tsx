
'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "./ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const successStories = [
    {
        creator: "@nadrionthego",
        description: "Find out how Alex was able to boost their brand deals with our US-based number.",
        stats: [
            { value: "45%", label: "increase in brand deals" },
            { value: "30%", label: "growth in affiliate sales" },
            { value: "25%", label: "increase in follower engagement" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-1"),
    },
    {
        creator: "@dnaesoraya",
        description: "Learn how Benny expanded their audience and secured major collaborations.",
        stats: [
            { value: "60%", label: "increase in sponsorship inquiries" },
            { value: "40%", label: "growth in merchandise sales" },
            { value: "50%", label: "increase in cross-platform followers" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-2"),
    },
    {
        creator: "@jenniferblinky",
        description: "Discover how Casey turned their content into a sustainable business.",
        stats: [
            { value: "75%", label: "increase in monthly revenue" },
            { value: "55%", label: "growth in exclusive content subscribers" },
            { value: "40%", label: "increase in audience retention" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-3"),
    }
];


export function SuccessCarousel() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    const scrollPrev = useCallback(() => {
        api?.scrollPrev()
      }, [api])
    
      const scrollNext = useCallback(() => {
        api?.scrollNext()
      }, [api])

    return (
        <section className="bg-black text-white pb-20 sm:pb-32">
            <div className="container mx-auto px-4">
                <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {successStories.map((story, index) => (
                            <CarouselItem key={index} className="md:grid md:grid-cols-2 gap-12 items-center">
                                {story.image && (
                                    <div className="relative aspect-[9/16] w-full max-w-sm mx-auto mb-8 md:mb-0">
                                        <Image 
                                            src={story.image.imageUrl}
                                            alt={story.image.description}
                                            data-ai-hint={story.image.imageHint}
                                            fill
                                            className="rounded-xl object-cover shadow-lg"
                                        />
                                    </div>
                                )}
                                <div className="p-1">
                                    <div className="flex flex-col items-start gap-4 text-left">
                                        <h2 className="text-4xl sm:text-5xl font-bold">{story.creator}</h2>
                                        <p className="text-lg text-muted-foreground">{story.description}</p>
                                        <div className="mt-4 space-y-2">
                                            {story.stats.map(stat => (
                                                <p key={stat.label} className="text-2xl sm:text-3xl font-medium">
                                                    <span className="text-primary">{stat.value}</span>
                                                    <span className="text-white/80"> {stat.label}</span>
                                                </p>
                                            ))}
                                        </div>
                                        <Button size="lg" className="rounded-full px-8 text-lg mt-6">
                                            Learn More
                                        </Button>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex items-center justify-between mt-12 max-w-lg mx-auto">
                        <CarouselPrevious className="static translate-x-0 translate-y-0 bg-transparent border-white/50 hover:bg-primary hover:border-primary" />
                        <div className="text-sm text-muted-foreground">
                            {String(current).padStart(2, '0')} / {String(count).padStart(2, '0')}
                        </div>
                        <CarouselNext className="static translate-x-0 translate-y-0 bg-transparent border-white/50 hover:bg-primary hover:border-primary" />
                    </div>
                </Carousel>
            </div>
        </section>
    )
}
