
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, ArrowRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSubmission } from '@/hooks/use-submission-context';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export default function StartPage() {
    const router = useRouter();
    const { submission, setSubmission } = useSubmission();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: submission.tiktokUsername || "",
        }
    });

    const onSubmit = (values: FormValues) => {
        setSubmission(prev => ({ ...prev, tiktokUsername: values.username }));
        router.push('/start/verify-code');
    };

    return (
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <User className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Step 1: Your TikTok Username</h1>
                <p className="text-muted-foreground">Let's start with your TikTok handle.</p>
            </div>
            
            <Progress value={25} className="w-[80%] mx-auto mb-8" />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input placeholder="your_username" {...field} className="pl-12 h-14 text-lg rounded-full" />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-center" />
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" className="rounded-full">
                            Continue
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
