import { SubmissionProvider } from "@/components/submission-provider";

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubmissionProvider>
        <div id="get-started" className="py-16 md:py-24 bg-background">
            <div className="container">
                {children}
            </div>
        </div>
    </SubmissionProvider>
  );
}
