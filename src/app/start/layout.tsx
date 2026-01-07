
'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TermsAndConditionsModal } from '@/components/start/terms-and-conditions-modal';

const TERMS_ACCEPTED_KEY = 'tiktok_bridge_terms_accepted';

export default function StartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // This check runs only on the client-side
        const accepted = sessionStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
        setTermsAccepted(accepted);
        setIsChecking(false);
    }, []);
    
    const handleAccept = () => {
        sessionStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
        setTermsAccepted(true);
    };

    if (isChecking) {
        return (
            <div className="container flex items-center justify-center py-16 md:py-24">
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="text-xl font-semibold">Loading...</h1>
                    <p className="text-muted-foreground">Please wait...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div id="get-started" className="py-16 md:py-24 bg-background">
            {!termsAccepted && <TermsAndConditionsModal onAccept={handleAccept} />}
            <div className="container flex items-center justify-center">
                {termsAccepted ? children : (
                     <div className="flex flex-col items-center justify-center text-center opacity-50">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <h1 className="text-xl font-semibold">Please accept the terms to continue</h1>
                        <p className="text-muted-foreground">Waiting for you to review the Terms of Service...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
