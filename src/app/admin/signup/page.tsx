
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from '@/components/loader';


const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasMainAdmin, setHasMainAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkMainAdmin = async () => {
        setIsCheckingAdmin(true);
        try {
            const res = await fetch('/api/admins');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                // If API fails with ENOENT, it means no file, so no main admin
                if (res.status === 500 && errorData.message?.includes('Could not read admins data')) {
                     setHasMainAdmin(false);
                     return;
                }
                // If we get an empty array from a file that just has '[]', there's no main admin
                if (res.status === 200 && (await res.clone().json()).length === 0) {
                    setHasMainAdmin(false);
                    return;
                }
                throw new Error(errorData.message || 'Failed to check for main admin.');
            }
            const admins = await res.json();
            const mainAdminExists = admins.some((admin: any) => admin.isMainAdmin);
            setHasMainAdmin(mainAdminExists);
        } catch (error) {
            console.error("Failed to check for main admin", error);
            // On any error, assume no main admin so the first one can be created
            setHasMainAdmin(false);
        } finally {
            setIsCheckingAdmin(false);
        }
    };
    checkMainAdmin();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.message || 'Failed to register admin user.');
      }
      
      const { isMainAdmin } = result;

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

      router.push('/admin/login');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: errorMessage,
      });
    }
  };

  if (isCheckingAdmin) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
            <Loader isFadingOut={false} />
        </div>
    )
  }

  const { isSubmitting } = form.formState;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <UserPlus className="mx-auto h-10 w-10 text-primary" />
                <h1 className="text-2xl mt-4 font-bold">Admin Registration</h1>
                <p className="text-muted-foreground">
                    {hasMainAdmin 
                        ? 'Create a new sub-administrator account.' 
                        : 'Create the first main administrator account.'}
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4">
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
                                    <Input type="password" placeholder="••••••••" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ?  <div className="h-6 w-6"><Loader isFadingOut={false}/></div> : 'Create Admin Account'}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Already have an admin account?{' '}
                            <Link href="/admin/login" className="font-semibold text-primary hover:underline">
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
