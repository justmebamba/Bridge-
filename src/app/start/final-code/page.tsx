
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
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';


const formSchema = z.object({
  finalCode: z.string().length(6, "Code must be 6 digits."),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinalCodePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      finalCode: "",
    }
  });

  useEffect(() => {
    // Redirect if user is not logged in
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
          id: user.uid, // Use the user's mock UID
          finalCode: values.finalCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      // On successful submission of the final step
      router.push('/success');

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
        <Progress value={100} className="mb-4 h-1.5" />
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="min-h-[200px] flex items-center justify-center">
            {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium p-2 text-center">{form.formState.errors.root.message}</div>
            )}
            <FormField
              control={form.control}
              name="finalCode"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>Final Confirmation Code</FormLabel>
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
                  <p className="text-sm text-muted-foreground pt-2 text-center max-w-xs">Enter the final 6-digit code to complete the process.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col-reverse gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full" size="lg">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Complete Submission
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting} className="w-full rounded-full">Back</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
