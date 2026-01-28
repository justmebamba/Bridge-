'use client';

import { ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TermsAndConditionsModal } from '@/components/start/terms-and-conditions-modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TERMS_ACCEPTED_KEY = 'tiktok_bridge_terms_accepted';

export default function StartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

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
        <div id="get-started" className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-sans">
            {!termsAccepted && <TermsAndConditionsModal onAccept={handleAccept} />}
            
            {termsAccepted ? (
                <>
                    <header className="w-full max-w-md flex justify-between items-center mb-10">
                        <button onClick={() => router.back()} className="p-2 text-foreground">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">Log in</h1>
                        <button className="p-2 text-foreground">
                            <HelpCircle className="w-6 h-6" />
                        </button>
                    </header>

                    <main className="w-full max-w-md">
                        {children}
                    </main>

                    <footer className="mt-auto py-10 w-full max-w-md text-center">
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-6">
                           <Link href="/terms" className="hover:text-black">Terms of Service</Link>
                           <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
                        </div>
                    </footer>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-center opacity-50 h-screen">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="text-xl font-semibold">Please accept the terms to continue</h1>
                    <p className="text-muted-foreground">Waiting for you to review the Terms of Service...</p>
                </div>
            )}
        </div>
    );
}
