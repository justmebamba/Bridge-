'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Submission } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.').optional().or(z.literal('')),
}).refine(data => data.email || data.phoneNumber, {
  message: "An email or phone number is required.",
  path: ["email"], 
});

type FormValues = z.infer<typeof formSchema>;

interface TiktokUsernameStepProps {
  onNext: (data: Partial<Submission>, method: 'email' | 'phone') => void;
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
    
    const payloadData = loginMethod === 'email' 
      ? { email: values.email, phoneNumber: undefined }
      : { email: undefined, phoneNumber: values.phoneNumber };

    if (loginMethod === 'email' && (!payloadData.email || !z.string().email().safeParse(payloadData.email).success)) {
        form.setError('email', { type: 'manual', message: 'A valid email is required to continue.' });
        setIsSubmitting(false);
        return;
    }
    if (loginMethod === 'phone' && (!payloadData.phoneNumber || payloadData.phoneNumber.length < 10)) {
        form.setError('phoneNumber', { type: 'manual', message: 'A valid phone number is required to continue.' });
        setIsSubmitting(false);
        return;
    }

    const id = loginMethod === 'email' ? payloadData.email! : payloadData.phoneNumber!;

    const payload: Partial<Submission> = {
        id: id,
        tiktokUsername: id,
        ...payloadData,
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
          description: "Your information has been received.",
        });

        onNext(payload, loginMethod);

    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
        setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || (loginMethod === 'email' && !form.watch('email')) || (loginMethod === 'phone' && !form.watch('phoneNumber'));


  return (
    <>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}>
                  <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto rounded-none border-b">
                      <TabsTrigger value="phone" className="pb-3 text-sm font-semibold rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-black text-slate-400 data-[state=active]:border-b-2 data-[state=active]:border-black border-b-2 border-transparent">Phone</TabsTrigger>
                      <TabsTrigger value="email" className="pb-3 text-sm font-semibold rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:text-black text-slate-400 data-[state=active]:border-b-2 data-[state=active]:border-black border-b-2 border-transparent">Email / Username</TabsTrigger>
                  </TabsList>
                  <TabsContent value="phone" className="pt-4">
                      <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                              <FormItem>
                                  <FormControl>
                                      <Input type="tel" placeholder="Phone number" {...field} disabled={isSubmitting} className="w-full bg-transparent border-0 border-b border-slate-300 rounded-none px-0 text-base focus:ring-0 focus:border-black h-auto py-2" />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </TabsContent>
                  <TabsContent value="email" className="pt-4">
                       <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                              <FormItem>
                                  <FormControl>
                                      <Input type="email" placeholder="Email or username" {...field} disabled={isSubmitting} className="w-full bg-transparent border-0 border-b border-slate-300 rounded-none px-0 text-base focus:ring-0 focus:border-black h-auto py-2"/>
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </TabsContent>
              </Tabs>
              
              <FormMessage className="text-center pt-2">
                  {form.formState.errors.email?.message}
              </FormMessage>

              <div className="pt-4">
                   <Button type="submit" disabled={isButtonDisabled} className="w-full bg-primary/80 hover:bg-primary/70 text-white font-bold py-3 rounded-md transition-transform active:scale-[0.98] flex items-center justify-center gap-2 h-auto text-base disabled:bg-slate-200 disabled:text-slate-400">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Log in'}
                  </Button>
              </div>
          </form>
      </Form>
    </>
  );
}
