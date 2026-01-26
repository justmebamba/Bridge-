
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Rocket, Shield, Activity, DollarSign, Smartphone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function OnboardingGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open the modal after a short delay when the component mounts
    const timer = setTimeout(() => {
        setIsOpen(true);
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Rocket className="w-7 h-7 text-primary" />
            Welcome to the Program!
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Your account is successfully bridged. Here are the 4 Golden Rules to keep your account safe and growing.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-6 text-sm">

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="font-semibold text-base flex items-center gap-2 mb-2"><MessageCircle className="w-5 h-5 text-cyan-400"/>Your Support Channel</h3>
                    <p className="text-slate-300 mb-3">Your dedicated Account Manager is <span className="font-bold text-white">Jessica</span>. For immediate support, join our private WhatsApp group for creators.</p>
                    <Button asChild size="sm" className="bg-green-500 hover:bg-green-400 text-white font-bold">
                        <Link href="#" target="_blank" rel="noopener noreferrer">Join WhatsApp Group</Link>
                    </Button>
                </div>


                <h3 className="font-bold text-lg text-amber-400 border-b border-amber-400/20 pb-2">Creator Safe-Start Guide</h3>
                
                <div className="space-y-4">
                    <h4 className="font-semibold text-base flex items-center gap-2"><Smartphone className="w-5 h-5 text-primary"/>1. The "Device Cleanse" 🧼</h4>
                    <p className="text-slate-400">TikTok reads your phone's metadata. To keep your account safe:</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>Dedicated Device:</strong> If possible, use a secondary phone factory-reset specifically for your monetized account.</li>
                        <li><strong>SIM Card:</strong> Remove your local SIM card. Even if you aren't using mobile data, TikTok can "ping" the local tower. Use Wi-Fi only.</li>
                        <li><strong>Location Services:</strong> Turn off GPS/Location services for the TikTok app in your phone settings.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-base flex items-center gap-2"><Activity className="w-5 h-5 text-primary"/>2. The "Warm-Up" Period (First 48 Hours) ⏳</h4>
                    <p className="text-slate-400">Do not post immediately after bridging. TikTok's algorithm needs to see "consistent" behavior from the new IP.</p>
                     <ul className="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>Day 1:</strong> Log in and just scroll. Like 5–10 videos in your niche. Use the app for 20 minutes like a normal user.</li>
                        <li><strong>Day 2:</strong> Update your bio or profile picture. Search for creators in the US and engage with them.</li>
                        <li><strong>Day 3:</strong> Post your first video.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-base flex items-center gap-2"><Shield className="w-5 h-5 text-primary"/>3. Posting Protocol 📡</h4>
                    <ul className="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>The Bridge Connection:</strong> Ensure your provided Residential Proxy or VPN is active before you open the TikTok app.</li>
                        <li><strong>Native Editing:</strong> Do not upload videos with watermarks from other apps. Use TikTok’s internal editor for at least one element (like a text overlay or a trending sound) to show the app the content is "fresh."</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-base flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary"/>4. Payout Strategy 💰</h4>
                     <ul className="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>Threshold:</strong> Your earnings will appear in the "Creator Rewards" dashboard.</li>
                        <li><strong>Withdrawal:</strong> We process payouts on the 15th of every month. Do not attempt to link a local bank card directly to the app; use the Virtual US Bank Details provided in your Bridge Dashboard.</li>
                    </ul>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button 
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-500"
            size="lg"
            onClick={() => setIsOpen(false)}
          >
            I Understand, Let's Go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
