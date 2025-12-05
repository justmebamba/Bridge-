import { DollarSign, Store, ShieldCheck, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";

const features = [
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: "Access US Creator Fund",
    description: "Qualify for TikTok's Creator Fund, previously limited to US-based creators, and start earning from your content.",
  },
  {
    icon: <Store className="h-8 w-8 text-primary" />,
    title: "Unlock TikTok Shop",
    description: "Enable TikTok Shop features to sell products directly to your audience through your videos and profile.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Secure & Verified Numbers",
    description: "We provide legitimate, verified US phone numbers to ensure your account's safety and compliance.",
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Simple 4-Step Setup",
    description: "Our guided form makes the bridging process quick and straightforward, getting you set up in minutes.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl text-center mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Unlock Your Full Earning Potential
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our TikTok Bridging service is packed with features designed to help you monetize your global audience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center flex flex-col items-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription className="px-6 pb-6">
                {feature.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
