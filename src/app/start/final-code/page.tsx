'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { KeyRound, PartyPopper } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useUser, updateDocumentNonBlocking } from '@/firebase';
import { useSubmission } from '@/hooks/use-submission';

const formSchema = z.object({
  finalCode: z.string().length(6, 'Code must be 6 digits.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinalCodePage() {
  const router = useRouter();
  const { user } = useUser();
  const { userDocRef } = useSubmission();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finalCode: '',
    },
  });

  const handleOnComplete = (code: string) => {
    if (!userDocRef || !user) return;

    updateDocumentNonBlocking(userDocRef, { finalCode: code });

    localStorage.setItem('submissionId', user.uid);
    setIsSuccess(true);
    
    setTimeout(() => {
      router.push('/waiting-for-approval');
    }, 2000);
  };
  
  const progressValue = 75;

  if (isSuccess) {
    return (
        <Card className="rounded-2xl shadow-xl border-t w-full max-w-md mx-auto">
            <CardHeader>
                <Progress value={100} className="mb-4 h-1.5" />
            </CardHeader>
             <CardContent className="min-h-[150px] flex flex-col items-center justify-center text-center py-8">
                <PartyPopper className="h-20 w-20 text-primary" />
                <h3 className="text-xl font-semibold mt-4">Successful!</h3>
                <p className="text-muted-foreground mt-2 max-w-[250px]">Your submission is complete. You will be redirected shortly to await admin approval.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-xl border-t w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardHeader>
            <Progress value={progressValue} className="mb-4 h-1.5" />
            <div className="flex items-center space-x-4 min-h-[48px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Final Confirmation</CardTitle>
                <CardDescription>Step 4 of 4</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[150px] flex flex-col items-center justify-center">
            <FormField
              control={form.control}
              name="finalCode"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Final Confirmation Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field} onComplete={handleOnComplete}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <p className="text-sm text-muted-foreground pt-2 text-center max-w-xs">Enter the final 6-digit code to complete the process.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
           <CardFooter>
                <Button type="button" variant="ghost" onClick={() => router.back()} className="w-full rounded-full">Back</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
