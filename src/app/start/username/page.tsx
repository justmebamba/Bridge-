'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { AtSign, Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useUser, setDocumentNonBlocking } from '@/firebase';
import { useSubmission } from '@/hooks/use-submission';
import { serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function UsernamePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { submission, userDocRef } = useSubmission();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: submission?.tiktokUsername || '',
    },
  });
  
  useEffect(() => {
    if (submission?.tiktokUsername) {
        form.reset({ username: submission.tiktokUsername });
    }
  }, [submission, form]);


  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    if (!userDocRef || !user) {
      form.setError('root', { message: 'You must be logged in to continue.' });
      setIsSubmitting(false);
      return;
    }

    try {
        const docData = {
            id: user.uid,
            tiktokUsername: data.username,
            createdAt: serverTimestamp(),
            isVerified: false,
        };

      setDocumentNonBlocking(userDocRef, docData, { merge: true });
      router.push('/start/verify-code');

    } catch (error: any) {
      form.setError('root', { message: error.message || 'An unexpected error occurred.' });
      setIsSubmitting(false);
    }
  };
  
  const progressValue = 0;

  return (
    <Card className="rounded-2xl shadow-xl border-t w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <Progress value={progressValue} className="mb-4 h-1.5" />
            <div className="flex items-center space-x-4 min-h-[48px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Your TikTok</CardTitle>
                <CardDescription>Step 1 of 4</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-h-[150px]">
             {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium p-2 text-center mb-4">{form.formState.errors.root.message}</div>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="pt-2">
                  <FormLabel>TikTok Username</FormLabel>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full" size="lg">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
