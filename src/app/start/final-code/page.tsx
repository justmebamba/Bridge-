
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useSubmission } from '@/hooks/use-submission-context';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState, useCallback } from 'react';


const formSchema = z.object({
  finalCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinalCodePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const { submission, setSubmission } = useSubmission();

    const [countdown, setCountdown] = useState(30);
    const [isCountingDown, setIsCountingDown] = useState(true);

    const handleResendCode = useCallback(() => {
        setIsCountingDown(true);
        setCountdown(30);
        // Here you would add logic to actually resend the code
        toast({
            title: 'Code Resent',
            description: 'A new confirmation code has been sent.',
        });
    }, [toast]);
    
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isCountingDown && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setIsCountingDown(false);
        }
        return () => clearTimeout(timer);
    }, [countdown, isCountingDown]);


    useEffect(() => {
        // If the user hasn't completed previous steps, send them back to the start
        if (!submission.tiktokUsername || !submission.verificationCode || !submission.phoneNumber) {
            router.replace('/start');
        }
    }, [submission, router]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            finalCode: submission.finalCode || "",
        }
    });

    const onSubmit = async (values: FormValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit.'});
            return;
        }

        const finalSubmissionData = { ...submission, finalCode: values.finalCode };
        setSubmission(finalSubmissionData);

        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.uid,
                    tiktokUsername: finalSubmissionData.tiktokUsername,
                    verificationCode: finalSubmissionData.verificationCode,
                    phoneNumber: finalSubmissionData.phoneNumber,
                    finalCode: finalSubmissionData.finalCode,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An unknown error occurred.');
            }
            
            router.push('/success');

        } catch (error: any) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: error.message || 'An unexpected error occurred.' });
        }
    };
    
    const { isSubmitting } = form.formState;

    return (
        <div className="w-full max-w-lg">
             <div className="text-center mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Step 4: Final Confirmation</h1>
                <p className="text-muted-foreground">Enter the final 6-digit code to complete the process.</p>
            </div>

            <Progress value={100} className="w-[80%] mx-auto mb-8" />
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="finalCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <div className="flex justify-center">
                                <InputOTP maxLength={6} {...field}>
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
                            <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />

                    <div className="text-center text-sm text-muted-foreground">
                        {isCountingDown ? (
                            <p>Resend code in {countdown}s</p>
                        ) : (
                            <Button type="button" variant="link" onClick={handleResendCode} className="p-0 h-auto">
                                Resend Code
                            </Button>
                        )}
                    </div>
                    
                    <div className="flex justify-between pt-4">
                         <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                        <Button type="submit" size="lg" className="rounded-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Application
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
