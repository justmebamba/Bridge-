
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import type { Submission } from '@/lib/types';
import { Loader } from '@/components/loader';

const formSchema = z.object({
  finalCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

interface FinalCodeStepProps {
    submissionData: Partial<Submission>;
    onBack: () => void;
}

export function FinalCodeStep({ submissionData, onBack }: FinalCodeStepProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isVerifying, setIsVerifying] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { finalCode: "" },
    });

    const onSubmit = async (values: FormValues) => {
        const finalSubmissionData = { ...submissionData, ...values };

        setIsVerifying(true);

        try {
             const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalSubmissionData),
            });
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to submit final code.');
            }
            
            // Simulate verification time
            setTimeout(() => {
                router.push('/success');
            }, 8000);

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
            setIsVerifying(false);
        }
    };
    
    const { isSubmitting } = form.formState;

    if (isVerifying) {
        return <Loader isFadingOut={false} />;
    }

    return (
        <div className="w-full max-w-lg mx-auto">
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
                         <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={onBack} disabled={isSubmitting}>
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
