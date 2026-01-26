
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the TikTok Bridge website (the "Service") operated by TikTok Monetization Bridge, LLC ("us", "we", or "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
            </p>

            <h4>1. The Service</h4>
            <p>
              Our Service provides a mechanism to enable TikTok monetization features for creators in regions not yet natively supported by the TikTok Creator Fund or TikTok Shop. We do this by linking your account to a verified, US-based "Virtual Mobile Identity" through official, secure, and approved agency protocols.
            </p>

            <h4>2. Accounts and Submissions</h4>
            <p>
              When you create a submission with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your Service. You are responsible for safeguarding any codes sent to you for verification purposes.
            </p>
            
            <h4>3. Monetization Agreement & Fees</h4>
            <p>
                By using this Service, you agree to a revenue-sharing model. We will collect a commission of <strong>fifteen percent (15%)</strong> of all gross revenue generated directly through the Monetization Features enabled by our Service. This includes earnings from the TikTok Creator Fund and TikTok Shop. Payments will be disbursed to you monthly after the deduction of our commission.
            </p>
            
            <h4>4. Compliance with TikTok Policies</h4>
            <p>
              Your use of our Service must comply with all of TikTok's own Terms of Service, Community Guidelines, and other policies. Any violation of TikTok's policies may result in the termination of our Service and a loss of monetization access. We are not responsible for any such violations or their consequences.
            </p>

            <h4>5. Intellectual Property</h4>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of TikTok Monetization Bridge, LLC and its licensors.
            </p>

            <h4>6. Limitation Of Liability</h4>
            <p>
              In no event shall TikTok Monetization Bridge, LLC, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>

            <h4>7. Governing Law</h4>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions.
            </p>

            <h4>Contact Us</h4>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
