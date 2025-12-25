
import { Button } from "./ui/button";
import { BarChart, CheckCircle, Users } from "lucide-react";
import Link from "next/link";

const stats = [
    { value: "1B+", label: "Monthly Active Users", icon: Users },
    { value: "175", label: "Countries & regions", icon: CheckCircle },
    { value: "90%", label: "Open the app every day", icon: BarChart },
];

export function AboutBridgingSection() {
    return (
        <section className="bg-black text-white py-20 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl text-center mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        What is TikTok Bridging?
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        TikTok Bridging is a service that links your account to a verified, US-based phone number. 
                        This allows creators from non-US regions to access monetization features typically reserved for the US market, like the Creator Fund and TikTok Shop. 
                        We handle the secure setup so you can focus on what you do best: creating content.
                    </p>
                    <div className="mt-10">
                        <Button size="lg" className="rounded-full px-8 text-lg" variant="outline" asChild>
                            <Link href="/start">Get Started</Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center text-center">
                            <stat.icon className="h-10 w-10 text-primary mb-4" />
                            <p className="text-4xl font-bold tracking-tight text-white">
                                {stat.value}
                            </p>
                            <p className="mt-2 text-base text-muted-foreground">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
