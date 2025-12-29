
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  tiktokUsername: z.string().min(2, 'Username must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tiktokUsername: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const id = values.tiktokUsername.startsWith('@') ? values.tiktokUsername.substring(1) : values.tiktokUsername;
      const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id: id,
              step: 'tiktokUsername',
              data: id,
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create account.');
      }
      
      await login(values.tiktokUsername);
      router.push('/start/verify-code');

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <UserPlus className="mx-auto h-10 w-10 text-primary" />
                <h1 className="text-2xl mt-4 font-bold">Create an Account</h1>
                <p className="text-muted-foreground">
                    Get started with the TikTok Bridge in minutes.
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
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    </main>
  );
}
