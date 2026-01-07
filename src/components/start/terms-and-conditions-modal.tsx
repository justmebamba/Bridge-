
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface TermsAndConditionsModalProps {
  onAccept: () => void;
}

export function TermsAndConditionsModal({ onAccept }: TermsAndConditionsModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [canAccept, setCanAccept] = useState(false);

  useEffect(() => {
    // Prevent user from accepting immediately to encourage reading
    const timer = setTimeout(() => {
      setCanAccept(true);
    }, 2500); // 2.5 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms of Service & Monetization Agreement</DialogTitle>
          <DialogDescription>
            Please carefully read and accept the following terms before using our service.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-6">
          <div className="prose prose-sm dark:prose-invert">
            <h4 className="font-semibold">1. Introduction</h4>
            <p>Welcome to TikTok Monetization Bridge ("Service"). This Service is provided to you ("User," "Creator," "You") to enable monetization features such as the TikTok Creator Fund and TikTok Shop ("Monetization Features") for your TikTok account in regions where these features are not natively available. By using our Service, you agree to these Terms of Service ("Terms").</p>

            <h4 className="font-semibold">2. The Service</h4>
            <p>We provide a verified, US-based phone number and related administrative support to link your TikTok account with US-based monetization programs. This is an official partnership with TikTok to extend creator opportunities globally. You are responsible for providing accurate information for this process.</p>

            <h4 className="font-semibold">3. Revenue Sharing and Fees (Monetization Agreement)</h4>
            <p>
              <strong>This is a key part of our agreement. By accepting these terms, you agree to a revenue-sharing model.</strong>
            </p>
            <ul>
              <li>
                <strong>Commission Fee:</strong> We will collect a commission of <strong>fifteen percent (15%)</strong> of all gross revenue generated directly through the Monetization Features enabled by our Service. This includes, but is not limited to, earnings from the TikTok Creator Fund, TikTok Shop sales, and any other direct monetization streams facilitated by the bridged status.
              </li>
              <li>
                <strong>Payment & Invoicing:</strong> Earnings are processed by TikTok and paid out to a managed account. We will deduct our commission and transfer the remaining balance to your designated payment method on a monthly basis. You will receive a detailed statement of earnings and deductions.
              </li>
              <li>
                <strong>Transparency:</strong> We are committed to full transparency. Your dashboard will provide a clear view of your earnings and our corresponding commission.
              </li>
            </ul>
            
            <h4 className="font-semibold">4. User Obligations</h4>
            <p>You agree to:</p>
            <ul>
                <li>Provide accurate and truthful information, including your TikTok username and any verification codes requested.</li>
                <li>Comply with all of TikTok's own Terms of Service, Community Guidelines, and policies. Violation of TikTok's policies may result in termination of our Service and a loss of monetization access.</li>
                <li>Not use the Service for any fraudulent, illegal, or unauthorized purpose.</li>
            </ul>

            <h4 className="font-semibold">5. Disclaimers and Limitation of Liability</h4>
            <p>The Service is provided "as is." We do not guarantee any specific level of earnings or success. Our liability is limited to the amount of fees paid by you to us in the preceding three (3) months. We are not responsible for any account suspension or action taken by TikTok unless it is a direct result of a failure in our Service.</p>

            <h4 className="font-semibold">6. Term and Termination</h4>
            <p>This agreement begins when you accept these Terms and continues until terminated by either party. You may terminate this agreement at any time by contacting our support. We reserve the right to suspend or terminate your access to the Service if you violate these Terms or TikTok's policies.</p>

            <h4 className="font-semibold">7. Governing Law</h4>
            <p>These Terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions.</p>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button 
            type="button" 
            className="w-full"
            size="lg"
            onClick={() => {
                setIsOpen(false);
                onAccept();
            }}
            disabled={!canAccept}
          >
            {!canAccept ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {!canAccept ? 'Please Review Terms...' : 'I Read and Accept the Terms'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
