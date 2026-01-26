'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Submission } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  tiktokUsername: z.string().min(2, 'Username must be at least 2 characters.').refine(val => !val.startsWith('@'), {
    message: 'Username should not start with @',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TiktokUsernameStepProps {
  onNext: (data: Partial<Submission>) => void;
  initialData?: Partial<Submission>;
}

export function TiktokUsernameStep({ onNext, initialData }: TiktokUsernameStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tiktokUsername: initialData?.tiktokUsername || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const username = values.tiktokUsername;
    
    try {
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tiktokUsername: username, id: username }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit username.');
        }

        toast({
          title: 'Username Submitted!',
          description: "Your username has been submitted for approval.",
        });

        onNext({ tiktokUsername: username, id: username });

    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        setIsSubmitting(false); // Only set to false on error, so user can retry
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                <UserPlus className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Step 1: Welcome!</h1>
            <p className="text-muted-foreground">
                Enter your TikTok username to get started.
            </p>
        </div>

        <Progress value={25} className="w-[80%] mx-auto mb-8" />
        
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
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">@</span>
                                    <Input placeholder="username" {...field} disabled={isSubmitting} className="pl-7" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg" className="rounded-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Submitting...' : 'Continue'}
                        {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                </div>
            </form>
        </Form>
        <Alert className="mt-8 border-green-500/50 text-green-700 [&>svg]:text-green-600">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle className="font-semibold text-green-800">Security Guarantee</AlertTitle>
            <AlertDescription className="text-xs text-green-700/80">
                We never ask for your password. Our bridge uses official API/MCN protocols to secure your monetization.
            </AlertDescription>
        </Alert>
    </div>
  );
}
