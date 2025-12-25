
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';

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
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The useAdminAuth hook will detect the new user state and the effect will re-route.
      // We add a small toast for better UX.
       toast({
        title: 'Login Successful',
        description: 'Redirecting to your dashboard...',
      });
      router.push('/admin');

    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'An unexpected error occurred. Please try again.';
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
          console.error(authError);
          break;
      }
       // Check if the user is not an admin after successful firebase login
      const adminsRes = await fetch('/api/admins');
      const admins = await adminsRes.json();
      const signedInUser = admins.find((a: any) => a.email.toLowerCase() === values.email.toLowerCase());

      if (signedInUser && !signedInUser.isVerified) {
        errorMessage = 'Your account is pending approval by an administrator.';
      } else if (!signedInUser) {
        errorMessage = 'You do not have permission to access this area.';
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
        <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <LogIn className="mx-auto h-10 w-10 text-primary" />
            <CardTitle className="text-2xl mt-4">Admin Access</CardTitle>
            <CardDescription>Enter your admin credentials to log in.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
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
            </CardContent>
            <CardFooter className="flex-col gap-4">
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
            </CardFooter>
            </form>
        </Form>
        </Card>
    </main>
  );
}
