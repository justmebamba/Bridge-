
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

        const submissionRef = doc(db, 'submissions', submissionId);
        
        const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
            if (docSnap.exists()) {
                const submission = docSnap.data() as Submission;
                const statusKey = `${stepToWatch}Status` as keyof Submission;
                const status = submission[statusKey];

                if (status === 'approved') {
                    onApproval();
                } else if (status === 'rejected') {
                    onRejection();
                }
            } else {
                console.error("Submission document not found in Firestore.");
            }
        }, (error) => {
            console.error("Error listening to submission status:", error);
            // Optionally, you could add a toast here to inform the user of a listener error
        });

        // Cleanup: unsubscribe when the component unmounts
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
