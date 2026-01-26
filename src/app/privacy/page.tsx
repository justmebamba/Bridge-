
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background py-16 md:py-24">
      <div className="container">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>
              TikTok Monetization Bridge, LLC ("us", "we", or "our") operates the TikTok Bridge website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>

            <h4>Information Collection and Use</h4>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you. The only personal information we require is your TikTok username, which is necessary to facilitate the monetization bridging process.
            </p>

            <h4>Types of Data Collected</h4>
            <ul>
              <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with your TikTok username.</li>
              <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used. This Usage Data may include information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.</li>
            </ul>

            <h4>Use of Data</h4>
            <p>We use the collected data for various purposes:</p>
            <ul>
              <li>To provide and maintain the Service</li>
              <li>To manage your submission and the bridging process</li>
              <li>To provide customer care and support</li>
              <li>To monitor the usage of the Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>

            <h4>Account Security & Data Management</h4>
            <p>We operate as a Multi-Channel Network (MCN) bridge. To provide you with US monetization access, our system requires temporary administrative handshaking with your TikTok account.</p>
            <ul>
                <li><strong>Zero Password Storage:</strong> We never see, store, or request your TikTok account password.</li>
                <li><strong>Limited Access:</strong> Our system only requests permissions necessary for region synchronization and "Creator Rewards" dashboard tracking.</li>
                <li><strong>Encryption:</strong> All data exchanged during the OTP verification process is encrypted using AES-256 standards and is automatically purged from our servers once the bridge is established.</li>
                <li><strong>Ownership:</strong> You maintain 100% ownership of your content. Our role is strictly to act as your "Technical Management Partner" for international payout routing.</li>
            </ul>

            <h4>Data Protection and Security</h4>
            <p>
              The security of your data is important to us. We use official API and Multi-Channel Network (MCN) protocols approved by TikTok. We never ask for, nor do we have access to, your password. Our access is strictly limited to managing your monetization features through secure, authorized channels. We strive to use commercially acceptable means to protect your Personal Data, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>

            <h4>Changes to This Privacy Policy</h4>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h4>Contact Us</h4>
            <p>
              If you have any questions about this Privacy Policy, please contact us through the channels listed on our main page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
