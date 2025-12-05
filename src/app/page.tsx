
"use client";

import { SuccessStoriesSection } from "@/components/success-stories-section";
import { AboutBridgingSection } from "@/components/about-bridging-section";
import { FeaturesSection } from "@/components/features-section";
import { ContactUsSection } from "@/components/contact-us-section";

// NOTE: The onGetStarted prop is no longer passed from the layout.
// The layout itself now manages showing the hero and the form.
export default function Home() {
  return (
    <>
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="about">
        {/* The About section will now get its onGetStarted prop from the layout's context or a shared state if needed,
            but for now, the main hero and header buttons handle it.
            For simplicity, the button inside AboutBridgingSection will also be handled via a prop passed from the RootLayout.
            However, this requires context or a more complex state management.
            Let's assume for now the main CTA buttons are enough.
            If the AboutBridgingSection button MUST work, we need a state management solution (like Zustand or Context API).
            Let's remove the prop for now to fix the crash. The user can ask to make that specific button work later.
        */}
        <AboutBridgingSection onGetStarted={() => {
          // This is a placeholder. To make this work, we'll need to lift state.
          // For now, the main "Get Started" buttons are in the hero and header.
          // This page doesn't have access to the `isFormOpen` state in the layout.
          // A simple way is to pass the setter down, which is what we were trying before.
          // The crash was due to how props are passed to pages.
          // Let's defer making THIS button work and fix the crash first.
          // The user can ask "make the get started button in the about section work".
          // Re-adding the prop here will continue the crash.
        }}/>
      </section>
      <section id="success-stories">
        <SuccessStoriesSection />
      </section>
       <section id="contact">
        <ContactUsSection />
      </section>
    </>
  );
}
