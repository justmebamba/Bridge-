
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

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    // This is mock authentication. In a real app, you'd call your auth service.
    const mockUser = {
      uid: `mock-user-${new Date().getTime()}`,
      email: values.email,
      displayName: 'Mock User', // You might get this from your backend
    };
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    
    // Force a storage event to update the header
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'mockUser',
        newValue: JSON.stringify(mockUser),
    }));

    router.push('/start');
  };

  const { isSubmitting } = form.formState;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <LogIn className="mx-auto h-10 w-10 text-primary" />
            <CardTitle className="text-2xl mt-4">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
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
                        <Input placeholder="name@example.com" {...field} />
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
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
            </form>
        </Form>
        </Card>
    </main>
  );
}
