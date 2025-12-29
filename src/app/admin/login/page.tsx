
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from '@/components/loader';


const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { adminUser, adminLogin, isLoading, checked } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await adminLogin(values.email, values.password);
      // The layout's useEffect will handle the redirect on successful login
      router.push('/admin');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };

  const { isSubmitting } = form.formState;

  // Show a loader while auth state is being determined, or if the user is already
  // logged in and is in the process of being redirected.
  if (!checked || (checked && adminUser?.isVerified)) {
     return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
            <Loader isFadingOut={false} />
        </div>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <LogIn className="mx-auto h-10 w-10 text-primary" />
                <h1 className="text-2xl mt-4 font-bold">Admin Access</h1>
                <p className="text-muted-foreground">Enter your admin credentials to log in.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="admin@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
                        {isSubmitting && <Loader isFadingOut={false} />}
                        Log In
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Need an admin account?{' '}
                            <Link href="/admin/signup" className="font-semibold text-primary hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
        </div>
    </main>
  );
}
