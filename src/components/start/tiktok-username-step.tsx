
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Submission } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  tiktokUsername: z.string().min(2, 'Username must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

interface TiktokUsernameStepProps {
  onNext: (data: Partial<Submission>) => void;
  initialData?: Partial<Submission>;
}

export function TiktokUsernameStep({ onNext, initialData }: TiktokUsernameStepProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tiktokUsername: initialData?.tiktokUsername || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    const username = values.tiktokUsername.startsWith('@') ? values.tiktokUsername.substring(1) : values.tiktokUsername;
    onNext({ tiktokUsername: username });
  };

  const { isSubmitting } = form.formState;

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
                                <Input placeholder="@username" {...field} disabled={isSubmitting}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting} size="lg" className="rounded-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
