'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Submission } from '@/lib/types';
import { ResendCode } from './resend-code';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';


interface WaitingForApprovalProps {
    submissionId: string;
    stepToWatch: 'verificationCode' | 'phoneNumber' | 'finalCode';
    onApproval: () => void;
    onRejection: () => void;
    promptText: string;
}

export function WaitingForApproval({
    submissionId,
    stepToWatch,
    onApproval,
    onRejection,
    promptText,
}: WaitingForApprovalProps) {

    useEffect(() => {
        if (!submissionId) return;

        // 1. Point to the specific document the user just submitted
        const submissionRef = doc(db, 'submissions', submissionId);
        
        // 2. Start the "Live Listener"
        const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
            if (docSnap.exists()) {
                const submission = docSnap.data() as Submission;
                
                // We check the specific status field based on the current step.
                const statusKey = `${stepToWatch}Status` as keyof Submission;
                const status = submission[statusKey];

                if (status === 'approved') {
                    // If approved, call the onApproval callback to move to the next step.
                    onApproval();
                } else if (status === 'rejected') {
                    // If rejected, call the onRejection callback to show an error.
                    onRejection();
                }
            } else {
                console.error("Submission document not found in Firestore.");
            }
        }, (error) => {
            console.error("Error listening to submission status:", error);
        });

        // 3. Clean up the listener if the user leaves the page
        return () => unsubscribe();
        
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
