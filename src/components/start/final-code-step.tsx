'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { InfoAlert } from './info-alert';
import { ResendCode } from './resend-code';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Submission } from '@/lib/types';


const formSchema = z.object({
  finalCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

interface FinalCodeStepProps {
    submissionId: string;
    onApproval: () => void;
    onRejection: () => void;
    onBack: () => void;
}

export function FinalCodeStep({ submissionId, onApproval, onRejection, onBack }: FinalCodeStepProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [shake, setShake] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { finalCode: "" },
    });

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    // Client-side listener for real-time feedback
    useEffect(() => {
        if (!isWaiting || !submissionId) return;

        const docRef = doc(db, 'submissions', submissionId);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const submission = docSnap.data() as Submission;
                const status = submission.finalCodeStatus;

                if (status === 'approved') {
                    unsubscribe(); // Clean up listener
                    onApproval();
                } else if (status === 'rejected') {
                    unsubscribe(); // Clean up listener
                    setIsWaiting(false);
                    triggerShake();
                    form.reset();
                    onRejection();
                }
            }
        }, (error) => {
            console.error("Error listening to submission status:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not listen for status updates.' });
            setIsWaiting(false);
        });

        // Cleanup function to detach the listener when the component unmounts
        return () => unsubscribe();
        
    }, [isWaiting, submissionId, onApproval, onRejection, toast, form]);


    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
             const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: submissionId, finalCode: values.finalCode }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to submit final code.');
            }
            
            toast({
                title: 'Code Submitted!',
                description: "We're confirming your final code. This will just take a minute.",
            });

            // Start waiting for real-time feedback
            setIsWaiting(true);

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
            triggerShake();
            setIsSubmitting(false); // Only stop submitting on error
        }
    };
    
    const isButtonDisabled = isSubmitting || isWaiting || (form.watch('finalCode')?.length ?? 0) < 6;

    if (isWaiting) {
        return (
            <div className="w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center space-y-8 py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                
                <div>
                     <h2 className="text-xl font-semibold">Confirming your application...</h2>
                     <p className="text-muted-foreground mt-2">This will just take a minute.</p>
                </div>

                <ResendCode />
            </div>
        );
    }

    return (
        <div className={cn("w-full max-w-lg mx-auto", shake && "animate-shake")}>
             <div className="text-center mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Step 4: Final Confirmation</h1>
                <p className="text-muted-foreground">Enter the final 6-digit code to complete the process.</p>
                 <InfoAlert
                    title="Code Source"
                    message="This code will be provided by your account agent to finalize the bridging process."
                    duration={5000}
                />
            </div>

            <Progress value={100} className="w-[80%] mx-auto mb-8" />
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="finalCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="sr-only">Final Code</FormLabel>
                            <FormControl>
                                <div className="flex justify-center">
                                <InputOTP 
                                    maxLength={6} 
                                    {...field} 
                                    disabled={isSubmitting || isWaiting}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                </div>
                            </FormControl>
                             <p className="text-xs text-muted-foreground text-center pt-2">
                                This code will allow us to link the number to your account.
                            </p>
                            <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex flex-col gap-4 pt-4">
                         <Button type="submit" size="lg" className="w-full rounded-full" disabled={isButtonDisabled}>
                            {(isSubmitting || isWaiting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isWaiting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                         <Button type="button" variant="outline" size="lg" className="w-full rounded-full" onClick={onBack} disabled={isSubmitting || isWaiting}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                    </div>
                     <ResendCode />
                </form>
            </Form>
        </div>
    );
}
