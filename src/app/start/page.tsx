
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { Loader } from '@/components/loader';

const formSchema = z.object({
  tiktokUsername: z.string().min(2, 'Username must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function StartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, login, isLoading, checked } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tiktokUsername: '',
    },
  });
  
  useEffect(() => {
    // If the user is already logged in, route them to the correct step
    if (checked && user) {
        const submission = user.submission;
        if (!submission) {
            return;
        };

        if (submission.finalCodeStatus === 'approved') {
            router.replace('/success');
        } else if (submission.phoneNumberStatus === 'approved' || (submission.finalCode && submission.finalCodeStatus !== 'rejected')) {
            router.replace('/start/final-code');
        } else if (submission.verificationCodeStatus === 'approved' || (submission.phoneNumber && submission.phoneNumberStatus !== 'rejected')) {
            router.replace('/start/select-number');
        } else if (submission.tiktokUsernameStatus === 'approved') {
            router.replace('/start/verify-code');
        }
    }
  }, [user, checked, router]);

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.tiktokUsername);
      
      // After login, the useEffect above will trigger the redirect.
      // We can add an explicit push as a fallback.
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

  // While loading auth state, or if user is logged in and is being redirected by useEffect
  if (!checked || (checked && user)) {
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
                    <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
                    {(isSubmitting || isLoading) && <Loader isFadingOut={false} />}
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
