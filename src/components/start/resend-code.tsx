
'use client';

import { useState, useEffect } from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RESEND_TIMER_SECONDS = 60;

export function ResendCode() {
    const [timer, setTimer] = useState(RESEND_TIMER_SECONDS);
    const [showResend, setShowResend] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const countdown = setTimeout(() => setTimer(t => t - 1), 1000);
            return () => clearTimeout(countdown);
        } else {
            setShowResend(true);
        }
    }, [timer]);

    const handleResend = () => {
        setShowResend(false);
        setTimer(RESEND_TIMER_SECONDS);
        // This is just for show. In a real app, this would trigger an API call.
    };
    
    return (
        <div className="text-sm text-muted-foreground text-center pt-4">
            {!showResend ? (
                <span>Need to try again? You can resend in {timer}s</span>
            ) : (
                <Button variant="link" onClick={handleResend} className="text-primary">
                    <Link2 className="mr-2 h-4 w-4" />
                    Resend Code
                </Button>
            )}
        </div>
    );
}
