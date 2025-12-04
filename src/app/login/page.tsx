'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, LogIn, Mail, Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const adminsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'admins'));
  }, [firestore]);
  const { data: admins, isLoading: adminsLoading } = useCollection(adminsQuery);
  const noAdminsExist = !adminsLoading && admins && admins.length === 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Authentication service is not available.',
        });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the control panel.</CardDescription>
        </CardHeader>
        <CardContent>
          {adminsLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="email" placeholder="admin@example.com" {...field} className="pl-10" />
                        </div>
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
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        {noAdminsExist && (
          <CardFooter className="flex-col items-start gap-4">
            <div className="text-sm text-muted-foreground text-center w-full">
              No admin account found. Create the first one to get started.
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/create-admin">
                <UserPlus className="mr-2 h-4 w-4" />
                Create First Admin Account
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
