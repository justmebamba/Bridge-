'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Submission } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.').optional(),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.').optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TiktokUsernameStepProps {
  onNext: (data: Partial<Submission>) => void;
  initialData?: Partial<Submission>;
}

export function TiktokUsernameStep({ onNext, initialData }: TiktokUsernameStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    if (loginMethod === 'email' && (!values.email || !z.string().email().safeParse(values.email).success)) {
      form.setError('email', { type: 'manual', message: 'A valid email is required.' });
      setIsSubmitting(false);
      return;
    }
    
    if (loginMethod === 'phone' && (!values.phoneNumber || values.phoneNumber.length < 10)) {
      form.setError('phoneNumber', { type: 'manual', message: 'A valid phone number is required.' });
      setIsSubmitting(false);
      return;
    }

    const { email, phoneNumber } = values;
    
    // Use email or phone as the ID and temporary username
    const id = loginMethod === 'email' ? email! : phoneNumber!;

    const payload: Partial<Submission> = {
        id: id,
        tiktokUsername: id,
        email: loginMethod === 'email' ? email : undefined,
        phoneNumber: loginMethod === 'phone' ? phoneNumber : undefined,
        tiktokUsernameStatus: 'approved'
    }
    
    try {
        const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit details.');
        }

        toast({
          title: 'Details Submitted!',
          description: "Your details have been submitted for approval.",
        });

        onNext(payload);

    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full w-1/4 shadow-sm"></div>
        </div>

        <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Step 1: Welcome!</h2>
            <p className="text-slate-500 mt-2">Enter your details to get started.</p>
        </div>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}>
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-2xl h-auto">
                        <TabsTrigger value="phone" className="rounded-xl data-[state=active]:shadow-sm data-[state=active]:bg-white data-[state=active]:text-black text-slate-400">Phone</TabsTrigger>
                        <TabsTrigger value="email" className="rounded-xl data-[state=active]:shadow-sm data-[state=active]:bg-white data-[state=active]:text-black text-slate-400">Email</TabsTrigger>
                    </TabsList>
                    <TabsContent value="phone" className="pt-2">
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone linked to TikTok</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="+1 (555) 000-0000" {...field} disabled={isSubmitting} className="w-full px-5 py-6 bg-slate-50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300 h-auto" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                    <TabsContent value="email" className="pt-2">
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email linked to TikTok</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="name@example.com" {...field} disabled={isSubmitting} className="w-full px-5 py-6 bg-slate-50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300 h-auto"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>

                <div className="pt-4">
                     <Button type="submit" disabled={isSubmitting} className="w-full bg-[#FE2C55] hover:bg-[#E62247] text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 h-auto text-base">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Submitting...' : 'Continue'}
                        {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                    </Button>
                </div>
            </form>
        </Form>
        <div className="mt-8 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0"/>
            <p className="text-xs text-emerald-800 leading-relaxed">
                <span className="font-bold">Security Guarantee:</span> We never ask for your password. Our bridge uses official API/MCN protocols.
            </p>
        </div>
    </div>
  );
}
