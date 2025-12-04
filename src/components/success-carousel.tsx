
'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "./ui/button";

const successStories = [
    {
        creator: "CreatorOne",
        description: "Find out how CreatorOne was able to boost their brand deals with our US-based number.",
        stats: [
            { value: "45%", label: "increase in brand deals" },
            { value: "30%", label: "growth in affiliate sales" },
            { value: "25%", label: "increase in follower engagement" },
        ],
    },
    {
        creator: "CreatorTwo",
        description: "Learn how CreatorTwo expanded their audience and secured major collaborations.",
        stats: [
            { value: "60%", label: "increase in sponsorship inquiries" },
            { value: "40%", label: "growth in merchandise sales" },
            { value: "50%", label: "increase in cross-platform followers" },
        ],
    },
    {
        creator: "CreatorThree",
        description: "Discover how CreatorThree turned their content into a sustainable business.",
        stats: [
            { value: "75%", label: "increase in monthly revenue" },
            { value: "55%", label: "growth in exclusive content subscribers" },
            { value: "40%", label: "increase in audience retention" },
        ],
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
        <section className="bg-black text-white py-20 sm:py-32">
            <div className="container mx-auto px-4">
                <Carousel setApi={setApi} className="w-full max-w-2xl mx-auto">
                    <CarouselContent>
                        {successStories.map((story, index) => (
                            <CarouselItem key={index}>
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
                    <div className="flex items-center justify-between mt-12">
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
