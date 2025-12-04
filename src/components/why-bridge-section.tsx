
const stats = [
  {
    value: "82%",
    description: "of creators are looking for new ways to monetize their content.",
  },
  {
    value: "69%",
    description: "of brands seek authentic creator partnerships for campaigns.",
  },
  {
    value: "91%",
    description: "of users prefer a simplified, direct way to engage with monetization opportunities.",
  },
];

export function WhyBridgeSection() {
  return (
    <section className="bg-primary text-primary-foreground py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Why Bridge Your TikTok Account?
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.value} className="flex flex-col">
                <p className="text-6xl font-bold tracking-tight text-cyan-400 sm:text-8xl">
                  {stat.value}
                </p>
                <p className="mt-4 text-lg text-white/80">
                  {stat.description}
                </p>
                <hr className="mt-8 border-white/20 lg:hidden" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
