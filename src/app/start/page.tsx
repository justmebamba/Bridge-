
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, ArrowRight, User, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Submission } from '@/lib/types';


const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export default function StartPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: '' },
    });
    
    const fetchSubmission = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/submissions?id=${user.uid}`);
            if (res.status === 404) {
                setSubmission(null);
                form.reset({ username: '' });
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch your submission data.');
            const data: Submission = await res.json();
            setSubmission(data);
            
            // Populate form and redirect if necessary
            if (data) {
                if (data.tiktokUsername) {
                    form.setValue('username', data.tiktokUsername);
                }
                if (data.tiktokUsernameStatus === 'approved') {
                    // This is the correct place to redirect, after data is fetched and processed
                    router.push('/start/verify-code');
                }
            }

        } catch (err: any) {
             toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoading(false);
        }
    }, [user, router, form, toast]);

    useEffect(() => {
        if(user) {
            fetchSubmission();
        }
    }, [user, fetchSubmission]);


    const onSubmit = async (values: FormValues) => {
        if (!user) return toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        
        setIsLoading(true);
        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.uid,
                    step: 'tiktokUsername',
                    data: values.username,
                }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Failed to submit username.');
            }
            
            toast({
                title: 'Username Submitted',
                description: 'Your username has been saved.',
            });
            
            // Redirect after successful submission
            router.push('/start/verify-code');

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
             setIsLoading(false);
        }
    };

    const isSubmitting = form.formState.isSubmitting;
    const isRejected = submission?.tiktokUsernameStatus === 'rejected';

    return (
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <User className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Step 1: Your TikTok Username</h1>
                <p className="text-muted-foreground">Let's start with your TikTok handle.</p>
            </div>
            
            <Progress value={25} className="w-[80%] mx-auto mb-8" />

             {isRejected && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Username Rejected</AlertTitle>
                    <AlertDescription>
                        {submission?.rejectionReason || "Your username was rejected. Please try a different one."}
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input 
                                            placeholder="your_username" 
                                            {...field} 
                                            className="pl-12 h-14 text-lg rounded-full" 
                                            disabled={isLoading || isSubmitting}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" className="rounded-full" disabled={isLoading || isSubmitting}>
                            {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Continue
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
