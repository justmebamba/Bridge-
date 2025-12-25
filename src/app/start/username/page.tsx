
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { successStories } from '@/lib/success-stories';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

const featuredUsernames = successStories.map(story => story.creator.toLowerCase().replace('@', ''));

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters.").refine(
    (value) => !featuredUsernames.includes(value.toLowerCase()),
    (value) => ({ message: `@${value} is a featured creator and cannot be used.` })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function UsernamePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      username: "",
    }
  });
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      form.setError("root", { message: "You must be logged in to proceed." });
      return;
    }
    
    try {
      // The API route will create a new submission or find the existing one.
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.uid, // Use the user's mock UID
          tiktokUsername: values.username,
          createdAt: new Date().toISOString(),
          isVerified: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
      }
      
      // Navigate to the next step
      router.push('/start/verify-code');

    } catch (error: any) {
      console.error(error);
      form.setError("root", { message: error.message || "An unexpected error occurred." });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (isUserLoading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Progress value={25} className="mb-4 h-1.5" />
        <div className="flex items-center space-x-4 min-h-[48px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Your TikTok</CardTitle>
            <CardDescription>Step 1 of 4</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="min-h-[200px] flex items-center">
            {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium p-2 text-center">{form.formState.errors.root.message}</div>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>TikTok Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="your_username" {...field} className="pl-10 h-11" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full" size="lg">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
