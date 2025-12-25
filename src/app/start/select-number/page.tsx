'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Phone, Loader2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { useSubmission } from '@/hooks/use-submission';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  usNumber: z.string({ required_error: 'Please select a number.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface PhoneNumber {
    id: string;
    phoneNumber: string;
    isAvailable: boolean;
    region: string;
    state: string;
    benefits: string[];
    disadvantages: string[];
    bonuses: string[];
}

export default function SelectNumberPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();
  const { submission, userDocRef } = useSubmission();

  const phoneNumbersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'phone_numbers');
  }, [firestore]);
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useCollection<PhoneNumber>(phoneNumbersQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usNumber: submission?.phoneNumberId || '',
    },
  });
  
  useEffect(() => {
    if (submission?.phoneNumberId) {
        const matchingNumber = phoneNumbers?.find(p => p.id === submission.phoneNumberId);
        if (matchingNumber) {
            form.reset({ usNumber: matchingNumber.phoneNumber });
        }
    }
  }, [submission, phoneNumbers, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    if (!userDocRef || !firestore) {
      form.setError('root', { message: 'An unexpected error occurred. Please try again.' });
      setIsSubmitting(false);
      return;
    }

    const selectedPhoneNumber = phoneNumbers?.find(p => p.phoneNumber === data.usNumber);
    if (!selectedPhoneNumber) {
        form.setError("usNumber", { type: "manual", message: "Selected phone number not found." });
        setIsSubmitting(false);
        return;
    }

    try {
        const finalData = {
            phoneNumberId: selectedPhoneNumber.id,
            phoneNumber: selectedPhoneNumber.phoneNumber,
        };
        updateDocumentNonBlocking(userDocRef, finalData);
        
        const phoneDocRef = doc(firestore, 'phone_numbers', selectedPhoneNumber.id);
        updateDocumentNonBlocking(phoneDocRef, { isAvailable: false });

        router.push('/start/final-code');
    } catch (error: any) {
        form.setError('root', { message: error.message || 'An unexpected error occurred.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const progressValue = 50;

  return (
    <Card className="rounded-2xl shadow-xl border-t w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <Progress value={progressValue} className="mb-4 h-1.5" />
            <div className="flex items-center space-x-4 min-h-[48px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Select a Number</CardTitle>
                <CardDescription>Step 3 of 4</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[280px]">
            <FormField
                control={form.control}
                name="usNumber"
                render={({ field }) => (
                <FormItem className="h-full flex flex-col">
                    <FormLabel>Choose a US Number</FormLabel>
                    <FormMessage className="pb-2"/>
                    <FormControl className="flex-grow">
                    <ScrollArea className="h-full w-full pr-4 max-h-[350px]">
                        {phoneNumbersLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                            {phoneNumbers?.filter(n => n.isAvailable || n.phoneNumber === field.value).map((number) => (
                                <Card 
                                    key={number.id} 
                                    onClick={() => isSubmitting ? null : field.onChange(number.phoneNumber)}
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
                                            <Badge variant={number.isAvailable ? "default" : "secondary"} className={cn(number.isAvailable ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200")}>{number.isAvailable ? "Available" : "Reserved"}</Badge>
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
                                                <h4 className="font-semibold mb-2 flex items-center text-green-600 dark:text-green-400"><Check className="h-4 w-4 mr-2"/>Benefits</h4>
                                                <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                    {number.benefits.map((benefit, i) => <li key={i} className="flex items-start"><Check className="h-4 w-4 mr-2 mt-1 text-green-500 shrink-0"/><span>{benefit}</span></li>)}
                                                </ul>
                                            </div>}
                                            {number.disadvantages?.length > 0 && <div>
                                                <h4 className="font-semibold mb-2 flex items-center text-red-600 dark:text-red-400"><X className="h-4 w-4 mr-2"/>Disadvantages</h4>
                                                <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                    {number.disadvantages.map((disadvantage, i) => <li key={i} className="flex items-start"><X className="h-4 w-4 mr-2 mt-1 text-red-500 shrink-0"/><span>{disadvantage}</span></li>)}
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
          </CardContent>
          <CardFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting} className="w-full sm:w-auto rounded-full">Back</Button>
            <Button type="submit" disabled={isSubmitting || phoneNumbersLoading} className="w-full sm:w-auto rounded-full" size="lg">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
