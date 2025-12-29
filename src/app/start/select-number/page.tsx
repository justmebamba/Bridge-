
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Phone, Loader2, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import type { PhoneNumber, Submission } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const phoneNumbersFetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json()
});

const submissionFetcher = (url: string) => fetch(url).then(res => {
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('An error occurred while fetching the submission.');
    return res.json();
});

const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const formSchema = z.object({
  usNumber: z.string({ required_error: "Please select a number." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SelectNumberPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    
    const { data: phoneNumbers, error: phoneNumbersError, mutate: mutatePhoneNumbers } = useSWR<PhoneNumber[]>('/api/phone-numbers', phoneNumbersFetcher);
    const { data: submission, error: submissionError } = useSWR<Submission | null>(user ? `/api/submissions?id=${user.uid}` : null, submissionFetcher, { refreshInterval: 2000 });
    
    const [shuffledNumbers, setShuffledNumbers] = useState<PhoneNumber[]>([]);

    useEffect(() => {
        if (phoneNumbers) {
            setShuffledNumbers(shuffle([...phoneNumbers]));
        }
    }, [phoneNumbers]);

    useEffect(() => {
        if (submission) {
            if (submission.verificationCodeStatus !== 'approved') {
                router.replace('/start/verify-code');
                return;
            }
            if (submission.phoneNumberStatus === 'approved') {
                router.push('/start/final-code');
                return;
            }
            if (submission.phoneNumber) {
                form.reset({ usNumber: submission.phoneNumber });
            }
        }
    }, [submission, router, form]);


    const handleRefresh = () => {
        if (phoneNumbers) {
            setShuffledNumbers(shuffle([...phoneNumbers]));
        }
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { usNumber: "" },
    });

    const onSubmit = async (values: FormValues) => {
         if (!user) return toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });

        try {
             await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.uid,
                    step: 'phoneNumber',
                    data: values.usNumber,
                }),
            });
            toast({ title: 'Number Submitted', description: 'Please wait for admin approval.' });
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        }
    };
    
    const isLoading = form.formState.isSubmitting || !phoneNumbers && !phoneNumbersError;
    const isPending = submission?.phoneNumberStatus === 'pending';
    const isRejected = submission?.phoneNumberStatus === 'rejected';


    return (
        <div className="w-full max-w-lg">
             <div className="text-center mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <Phone className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Step 3: Choose a US Number</h1>
                <p className="text-muted-foreground">Select a number to link to your account.</p>
            </div>

            <Progress value={75} className="w-[80%] mx-auto mb-8" />

            <div className="flex justify-end mb-4">
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    <span className="ml-2">Shuffle Numbers</span>
                </Button>
            </div>
            
             {isPending && (
                 <Alert className="mb-6 animate-pulse">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Approval Pending</AlertTitle>
                    <AlertDescription>An administrator is currently reviewing your selection. This page will automatically update once approved.</AlertDescription>
                </Alert>
            )}

            {isRejected && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Number Rejected</AlertTitle>
                    <AlertDescription>{submission?.rejectionReason || "Your selected number was rejected. Please choose a different one."}</AlertDescription>
                </Alert>
            )}


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="usNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormMessage className="pb-2 text-center" />
                            <FormControl>
                                <ScrollArea className="h-96 w-full pr-4 border rounded-md p-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                    </div>
                                ) : phoneNumbersError ? (
                                    <div className="text-destructive text-center h-full flex items-center justify-center">Failed to load numbers.</div>
                                ) : (
                                    <div className="space-y-3">
                                    {shuffledNumbers?.filter(n => n.isAvailable).map((number) => (
                                        <Card
                                        key={number.id}
                                        onClick={() => !(isLoading || isPending) && field.onChange(number.phoneNumber)}
                                        className={cn(
                                            "cursor-pointer transition-all hover:shadow-md hover:border-primary/50 rounded-xl",
                                            field.value === number.phoneNumber && "border-primary ring-2 ring-primary/50 shadow-lg",
                                            (isLoading || isPending) && "cursor-not-allowed opacity-70"
                                        )}
                                        >
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{number.phoneNumber}</CardTitle>
                                                <CardDescription>{number.region}, {number.state}</CardDescription>
                                            </div>
                                            <Badge variant={number.isAvailable ? "default" : "secondary"} className={cn(number.isAvailable ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200")}>{number.isAvailable ? "Available" : "Taken"}</Badge>
                                            </div>
                                        </CardHeader>
                                        {(number.bonuses?.length > 0 || number.benefits?.length > 0 || number.disadvantages?.length > 0) && (
                                            <CardContent className="p-4 pt-0 text-sm">
                                            {number.bonuses && number.bonuses.length > 0 && (
                                                <div className="mb-3">
                                                <h4 className="font-semibold mb-1 text-primary">Bonuses</h4>
                                                <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                                                    {number.bonuses.map((bonus, i) => <li key={i}>{bonus}</li>)}
                                                </ul>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {number.benefits?.length > 0 && <div>
                                                <h4 className="font-semibold mb-2 flex items-center text-green-600 dark:text-green-400"><Check className="h-4 w-4 mr-2" />Benefits</h4>
                                                <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                    {number.benefits.map((benefit, i) => <li key={i} className="flex items-start"><Check className="h-4 w-4 mr-2 mt-1 text-green-500 shrink-0" /><span>{benefit}</span></li>)}
                                                </ul>
                                                </div>}
                                                {number.disadvantages?.length > 0 && <div>
                                                <h4 className="font-semibold mb-2 flex items-center text-red-600 dark:text-red-400"><X className="h-4 w-4 mr-2" />Disadvantages</h4>
                                                <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                    {number.disadvantages.map((disadvantage, i) => <li key={i} className="flex items-start"><X className="h-4 w-4 mr-2 mt-1 text-red-500 shrink-0" /><span>{disadvantage}</span></li>)}
                                                </ul>
                                                </div>}
                                            </div>
                                            </CardContent>
                                        )}
                                        </Card>
                                    ))}
                                    </div>
                                )}
                                </ScrollArea>
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex justify-between pt-4">
                         <Button type="button" variant="outline" size="lg" className="rounded-full" onClick={() => router.back()} disabled={isLoading || isPending}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                        <Button type="submit" size="lg" className="rounded-full" disabled={isLoading || isPending}>
                             {(isLoading || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isPending ? 'Waiting for Approval...' : 'Submit for Approval'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
