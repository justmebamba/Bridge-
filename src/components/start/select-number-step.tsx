'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Phone, Loader2, Check, X, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import type { PhoneNumber, Submission } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const shuffle = (array: any[]) => {
    if (!Array.isArray(array)) return [];
    let currentIndex = array.length,  randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
};

const formSchema = z.object({
  phoneNumber: z.string({ required_error: "Please select a number." }),
});

type FormValues = z.infer<typeof formSchema>;

interface SelectNumberStepProps {
    submissionId: string;
    onNext: (data: Partial<Submission>) => void;
    onBack: () => void;
}

export function SelectNumberStep({ submissionId, onNext, onBack }: SelectNumberStepProps) {
    const { toast } = useToast();
    
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shuffledNumbers, setShuffledNumbers] = useState<PhoneNumber[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phoneNumber: '',
        },
    });
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const pRes = await fetch('/api/phone-numbers');
            if (!pRes.ok) throw new Error('Failed to fetch phone numbers');
            const phoneNumbersData = await pRes.json();
            setPhoneNumbers(phoneNumbersData);
            setShuffledNumbers(shuffle([...phoneNumbersData]));
        } catch (err: any) {
            setError(err.message);
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
       fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        if (phoneNumbers) {
            setShuffledNumbers(shuffle([...phoneNumbers]));
        }
    }

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: submissionId, phoneNumber: values.phoneNumber, phoneNumberStatus: 'approved' }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save phone number.');
            }
            
            toast({
                title: 'Number Submitted!',
                description: 'Your selected number has been saved.',
            });
            
            // Simulate a database check
            setTimeout(() => {
                onNext({ phoneNumber: values.phoneNumber });
                setIsSubmitting(false);
            }, 1500);


        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
            setIsSubmitting(false);
        }
    };
    
    return (
        <>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-1.5 rounded-full w-3/4 shadow-sm"></div>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900">Step 3: Assign Identity</h2>
                <p className="text-slate-500 mt-2">Select a dedicated US-based number. This will become the primary security line for your account.</p>
            </div>

            <div className="flex justify-end mb-4">
                <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading || isSubmitting} className="border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                    <RefreshCw className={cn("h-4 w-4", (isLoading || isSubmitting) && "animate-spin")} />
                    <span className="ml-2">Shuffle Numbers</span>
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormMessage className="pb-2 text-center" />
                            <FormControl>
                                <ScrollArea className="h-96 w-full pr-4 border border-slate-200 rounded-2xl p-4 bg-slate-50">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                    </div>
                                ) : error ? (
                                    <div className="text-destructive text-center h-full flex items-center justify-center">{error}</div>
                                ) : (
                                    <div className="space-y-3">
                                    {shuffledNumbers?.filter(n => n.isAvailable).map((number) => (
                                        <Card
                                        key={number.id}
                                        onClick={() => !(isLoading || isSubmitting) && field.onChange(number.phoneNumber)}
                                        className={cn(
                                            "cursor-pointer transition-all hover:shadow-md bg-white border-slate-200 rounded-xl",
                                            field.value === number.phoneNumber && "border-primary ring-2 ring-primary/20 shadow-lg",
                                            (isLoading || isSubmitting) && "cursor-not-allowed opacity-70"
                                        )}
                                        >
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-slate-800">{number.phoneNumber}</CardTitle>
                                                <CardDescription className="text-slate-500">{number.region}, {number.state}</CardDescription>
                                            </div>
                                            <Badge variant={number.isAvailable ? "default" : "secondary"} className={cn(number.isAvailable ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200")}>{number.isAvailable ? "Available" : "Taken"}</Badge>
                                            </div>
                                        </CardHeader>
                                        {(number.bonuses?.length > 0 || number.benefits?.length > 0 || number.disadvantages?.length > 0) && (
                                            <CardContent className="p-4 pt-0 text-sm">
                                            {number.bonuses && number.bonuses.length > 0 && (
                                                <div className="mb-3">
                                                <h4 className="font-semibold mb-1 text-primary">Bonuses</h4>
                                                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                                    {number.bonuses.map((bonus, i) => <li key={i}>{bonus}</li>)}
                                                </ul>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {number.benefits?.length > 0 && <div>
                                                <h4 className="font-semibold mb-2 flex items-center text-green-600"><Check className="h-4 w-4 mr-2" />Benefits</h4>
                                                <ul className="list-none pl-0 space-y-1 text-slate-500">
                                                    {number.benefits.map((benefit, i) => <li key={i} className="flex items-start"><Check className="h-4 w-4 mr-2 mt-1 text-green-500 shrink-0" /><span>{benefit}</span></li>)}
                                                </ul>
                                                </div>}
                                                {number.disadvantages?.length > 0 && <div>
                                                <h4 className="font-semibold mb-2 flex items-center text-red-600"><X className="h-4 w-4 mr-2" />Disadvantages</h4>
                                                <ul className="list-none pl-0 space-y-1 text-slate-500">
                                                    {number.disadvantages.map((disadvantage, i) => <li key={i} className="flex items-start"><X className="h-4 w-4 mr-2 mt-1 text-red-500 shrink-0" /><span>{disadvantage}</span></li>)}
                                                </ul>
                                                </div>}
                                            </div>
                                            </CardContent>
                                        )}
                                        </Card>
                                    ))}
                                    </div>
                                )}
                                </ScrollArea>
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    
                    <div className="flex justify-between pt-4 gap-4">
                         <Button type="button" variant="outline" onClick={onBack} disabled={isLoading || isSubmitting} className="w-full bg-transparent hover:bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 h-auto text-base">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                        </Button>
                        <Button type="submit" disabled={isLoading || isSubmitting || !form.watch('phoneNumber')} className="w-full bg-[#FE2C55] hover:bg-[#E62247] text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 h-auto text-base">
                             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {isSubmitting ? 'Saving...' : 'Continue'}
                             {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
