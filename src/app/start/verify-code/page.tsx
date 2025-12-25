'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { updateDocumentNonBlocking } from '@/firebase';
import { useSubmission } from '@/hooks/use-submission';

const formSchema = z.object({
  verificationCode: z.string().length(6, 'Code must be 6 digits.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function VerifyCodePage() {
  const router = useRouter();
  const { submission, userDocRef } = useSubmission();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationCode: '',
    },
  });
  
  const handleOnComplete = (code: string) => {
    if (!userDocRef) return;
    updateDocumentNonBlocking(userDocRef, { verificationCode: code });
    router.push('/start/select-number');
  }
  
  const progressValue = 25;

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
                <CardTitle className="text-xl">Enter Code</CardTitle>
                <CardDescription>Step 2 of 4</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[150px] flex flex-col items-center justify-center">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Verification Code</FormLabel>
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
                  <p className="text-sm text-muted-foreground pt-2 text-center max-w-xs">We sent a email the account linked to this address.</p>
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
