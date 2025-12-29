
import { Button } from "./ui/button";
import { Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export function ContactUsSection() {
    return (
        <section className="bg-background text-foreground py-20 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl text-center mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Contact Us
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Have questions? We're here to help. Reach out to us on our social media channels.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Button asChild variant="outline" size="icon">
                           <Link href="#"><Facebook className="h-5 w-5" /></Link>
                        </Button>
                         <Button asChild variant="outline" size="icon">
                           <Link href="#"><Twitter className="h-5 w-5" /></Link>
                        </Button>
                         <Button asChild variant="outline" size="icon">
                           <Link href="#"><Instagram className="h-5 w-5" /></Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
