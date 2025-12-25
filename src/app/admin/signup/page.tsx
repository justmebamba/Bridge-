
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasMainAdmin, setHasMainAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMainAdmin = async () => {
        try {
            const res = await fetch('/api/admins');
            const admins = await res.json();
            const mainAdminExists = admins.some((admin: any) => admin.isMainAdmin);
            setHasMainAdmin(mainAdminExists);
        } catch (error) {
            console.error("Failed to check for main admin", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not verify admin status. Please try again later.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    checkMainAdmin();
  }, [toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userCredential.user.uid,
          email: values.email,
        }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to register admin user.');
      }
      
      const { isMainAdmin } = await response.json();

      if (isMainAdmin) {
        toast({
            title: 'Registration Successful',
            description: 'You have been registered as the main admin. You can now log in.',
        });
      } else {
        toast({
            title: 'Registration Pending',
            description: 'Your account has been created and is awaiting approval from the main admin.',
        });
      }

      await auth.signOut();
      router.push('/admin/login');

    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = (error as Error).message || 'An unexpected error occurred. Please try again.';
      if (authError.code) {
        switch (authError.code) {
            case 'auth/email-already-in-use':
            errorMessage = 'This email address is already in use.';
            break;
            case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
            case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please choose a stronger password.';
            break;
            default:
            console.error(authError);
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  const { isSubmitting } = form.formState;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <UserPlus className="mx-auto h-10 w-10 text-primary" />
            <CardTitle className="text-2xl mt-4">Admin Registration</CardTitle>
            <CardDescription>
                {hasMainAdmin 
                    ? 'Create a new sub-administrator account.' 
                    : 'Create the first main administrator account.'}
            </CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
                {!hasMainAdmin && (
                    <Alert>
                        <AlertTitle>Main Admin Registration</AlertTitle>
                        <AlertDescription>
                            You are about to create the first administrator account. This account will have full privileges, including the ability to approve other admins.
                        </AlertDescription>
                    </Alert>
                )}
                 {hasMainAdmin && (
                    <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200 [&>svg]:text-blue-600">
                        <AlertTitle>Sub-Admin Registration</AlertTitle>
                        <AlertDescription>
                            Your account will be created in a pending state. A main administrator must approve your account before you can log in.
                        </AlertDescription>
                    </Alert>
                )}
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
                Create Admin Account
                </Button>
                 <p className="text-sm text-center text-muted-foreground">
                    Already have an admin account?{' '}
                    <Link href="/admin/login" className="font-semibold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </CardFooter>
            </form>
        </Form>
        </Card>
    </main>
  );
}
