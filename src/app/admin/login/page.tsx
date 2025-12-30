
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase/client';


const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
        // Step 1: Sign in with Firebase client auth to get an ID token
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);
        const idToken = await userCredential.user.getIdToken();

        // Step 2: Send the ID token to our backend to create a session
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Session creation failed.');
        }

        toast({
            title: 'Login Successful',
            description: 'Welcome back!',
        });
        
        router.push('/admin');
        router.refresh(); // This ensures the layout re-evaluates the session

    } catch (error: any) {
        let errorMessage = 'An unknown error occurred.';
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many login attempts. Please try again later.';
                break;
        }

        if (error instanceof Error && !(error as any).code) {
            errorMessage = error.message;
        }

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    }
  };

  const { isSubmitting } = form.formState;

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
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Log In'}
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
