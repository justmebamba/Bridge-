
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Link2, HelpCircle } from 'lucide-react';
import type { Submission } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface WaitingForApprovalProps {
    submissionId: string;
    stepToWatch: 'verificationCode' | 'phoneNumber' | 'finalCode';
    onApproval: () => void;
    onRejection: () => void;
    promptText: string;
    promptHint?: string;
}

const POLLING_INTERVAL = 3000; // 3 seconds
const RESEND_TIMER_SECONDS = 60; // 1 minute

export function WaitingForApproval({
    submissionId,
    stepToWatch,
    onApproval,
    onRejection,
    promptText,
    promptHint,
}: WaitingForApprovalProps) {

    const [timer, setTimer] = useState(RESEND_TIMER_SECONDS);
    const [showResend, setShowResend] = useState(false);

    // Timer for the "Resend Code" link
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
        // This is just for show, as requested.
        // In a real app, this would trigger an API call.
    };

    // Polling for status update
    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const res = await fetch(`/api/submissions?id=${submissionId}`);
                if (!res.ok) {
                    // Stop polling on server error, but don't kick user out
                    console.error('Failed to poll for submission status');
                    return;
                }

                const submission: Submission = await res.json();
                const statusKey = `${stepToWatch}Status` as keyof Submission;
                const status = submission[statusKey];

                if (status === 'approved') {
                    clearInterval(intervalId);
                    onApproval();
                } else if (status === 'rejected') {
                    clearInterval(intervalId);
                    onRejection();
                }
                // If status is 'pending', do nothing and let the polling continue.

            } catch (error) {
                console.error('Error during polling:', error);
            }
        }, POLLING_INTERVAL);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [submissionId, stepToWatch, onApproval, onRejection]);

    return (
        <div className="w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center space-y-8 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            
            <div>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                    {promptText}
                    {promptHint && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{promptHint}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </p>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
                {!showResend ? (
                    <span>Need to try again? You can resend in {timer}s</span>
                ) : (
                    <Button variant="link" onClick={handleResend} className="text-primary">
                        <Link2 className="mr-2 h-4 w-4" />
                        Resend Code
                    </Button>
                )}
            </div>
        </div>
    );
}
