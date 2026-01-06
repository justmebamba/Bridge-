
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Submission } from '@/lib/types';
import { ResendCode } from './resend-code';

interface WaitingForApprovalProps {
    submissionId: string;
    stepToWatch: 'verificationCode' | 'phoneNumber' | 'finalCode';
    onApproval: () => void;
    onRejection: () => void;
    promptText: string;
}

const POLLING_INTERVAL = 3000; // 3 seconds

export function WaitingForApproval({
    submissionId,
    stepToWatch,
    onApproval,
    onRejection,
    promptText,
}: WaitingForApprovalProps) {

    // Polling for status update
    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const res = await fetch(`/api/submissions?id=${submissionId}`);
                if (!res.ok) {
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
            } catch (error) {
                console.error('Error during polling:', error);
            }
        }, POLLING_INTERVAL);

        return () => clearInterval(intervalId);
    }, [submissionId, stepToWatch, onApproval, onRejection]);

    return (
        <div className="w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center space-y-8 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            
            <div>
                 <h2 className="text-xl font-semibold">Waiting for Confirmation...</h2>
                 <p className="text-muted-foreground mt-2">{promptText}</p>
            </div>

            <ResendCode />
        </div>
    );
}
