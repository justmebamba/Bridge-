
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import type { AdminUser } from '@/lib/types';


const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      router.replace('/admin');
    }
  }, [user, isAdmin, isLoading, router]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Step 1: Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const signedInUser = userCredential.user;

      // Step 2: Verify if the user is a registered and verified admin from our backend
      const res = await fetch('/api/admins');
      if (!res.ok) {
        throw new Error('Could not verify admin status.');
      }
      const admins: AdminUser[] = await res.json();
      const adminRecord = admins.find(admin => admin.id === signedInUser.uid);

      if (!adminRecord) {
        throw new Error('You do not have permission to access this area.');
      }
      if (!adminRecord.isVerified) {
        throw new Error('Your account is pending approval by an administrator.');
      }

      // Success
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      router.push('/admin');

    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
          errorMessage = error.message;
      }
      
      if ((error as AuthError).code) {
          const authError = error as AuthError;
          switch (authError.code) {
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
              errorMessage = 'Invalid email or password. Please try again.';
              break;
              case 'auth/invalid-email':
              errorMessage = 'Please enter a valid email address.';
              break;
              case 'auth/too-many-requests':
              errorMessage = 'Too many login attempts. Please try again later.';
              break;
              default:
               // Use the generic message for other auth errors
               break;
          }
      }
      
      // Sign out the user if they logged in via Firebase but failed admin verification
      if (auth.currentUser) {
        await auth.signOut();
      }

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
    }
  };

  const { isSubmitting } = form.formState;

  if (isLoading || (user && isAdmin)) {
     return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
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
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
