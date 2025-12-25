
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Phone, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PhoneNumber } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formSchema = z.object({
  usNumber: z.string({ required_error: "Please select a number." }),
});

type FormValues = z.infer<typeof formSchema>;


export default function SelectNumberPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();
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
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: FormValues) => {
     if (!user) {
      form.setError("root", { message: "You must be logged in to proceed." });
      return;
    }

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.uid,
          phoneNumber: values.usNumber,
        }),
      });

       if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      router.push('/start/final-code');
    } catch (error: any) {
       console.error(error);
      form.setError("root", { message: error.message || "An unexpected error occurred." });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (isUserLoading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Progress value={75} className="mb-4 h-1.5" />
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="min-h-[350px]">
             {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium p-2 text-center">{form.formState.errors.root.message}</div>
            )}
            <FormField
              control={form.control}
              name="usNumber"
              render={({ field }) => (
                <FormItem className="pt-2 h-full flex flex-col">
                  <FormLabel>Choose a US Number</FormLabel>
                  <FormMessage className="pb-2" />
                  <FormControl className="flex-grow">
                    <ScrollArea className="h-full w-full pr-4 max-h-[350px]">
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
          </CardContent>
           <CardFooter className="flex-col-reverse gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting || phoneNumbersLoading} className="w-full rounded-full" size="lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue
              </Button>
              <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting} className="w-full rounded-full">Back</Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
