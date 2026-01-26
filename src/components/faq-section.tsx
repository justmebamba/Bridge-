
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Why do I need a US-based number?",
    answer:
      "TikTok's most lucrative monetization features, like the Creator Fund and TikTok Shop, are currently prioritized for the US market. Linking your account to a verified, US-based 'Virtual Mobile Identity' makes your account eligible for these programs, regardless of your physical location. Our service handles this complex process securely through official agency protocols.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Once your account is bridged, your earnings are processed through a managed US-based entity. We then pay out your share monthly via your preferred method, such as Wise, Payoneer, or even USDT (crypto). You receive a detailed statement showing your gross earnings and our 15% commission.",
  },
    {
    question: "Why do I need to give an OTP?",
    answer:
      "TikTok requires a verification code when adding a new security device (our US Bridge Server). This code ensures that you are authorizing the connection. Once linked, you can see our management device in your TikTok 'Security' settings at any time.",
  },
  {
    question: "Is this against TikTok's Terms of Service?",
    answer:
      "No, it is not. We operate under an official 'Agency Management Model' (also known as MCN - Multi-Channel Network) that is recognized and permitted by TikTok. This model is designed for agencies to manage creators and facilitate their access to platform features. Your account's safety and compliance are our top priorities.",
  },
    {
    question: "Do you need my password?",
    answer:
      "Absolutely not. We will never ask for your password. The entire process uses secure, passwordless verification codes and official API protocols. Your account credentials remain private and are never shared with us.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-background py-20 sm:py-32">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? We've got answers. Here are some of the most common things creators ask.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
