"use client";

import { useState, useEffect } from "react";
import type { EmblaCarouselType } from 'embla-carousel-react'
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { User, FileText, Phone, KeyRound, CheckCircle, Loader2, AtSign, Check, X } from "lucide-react";
import { collection, doc, query } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useAuth, useCollection, useFirestore, useMemoFirebase, initiateAnonymousSignIn, setDocumentNonBlocking } from "@/firebase";
import { cn } from "@/lib/utils";

const TIKTOK_BRIDGE_STEPS = [
  { step: 1, title: "Your TikTok", icon: User, fields: ['username'] as const },
  { step: 2, title: "Terms of Service", icon: FileText, fields: ['acceptTerms'] as const },
  { step: 3, title: "Select a Number", icon: Phone, fields: ['usNumber'] as const },
  { step: 4, title: "Verify Number", icon: KeyRound, fields: ['verificationCode'] as const },
  { step: 5, title: "Completed", icon: CheckCircle, fields: [] as const },
];

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  acceptTerms: z.boolean().refine((val) => val === true, { message: "You must accept the terms and conditions." }),
  usNumber: z.string({ required_error: "Please select a number." }),
  verificationCode: z.string().length(6, "Code must be 6 digits."),
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
  const auth = useAuth();
  const firestore = useFirestore();

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
    if (auth) {
        initiateAnonymousSignIn(auth);
    }
  }, [auth]);

  const handleNext = async () => {
    const fieldsToValidate = TIKTOK_BRIDGE_STEPS[currentStep].fields;
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && api) {
        if (currentStep === TIKTOK_BRIDGE_STEPS.length - 2) { // Is last form step
            setIsSubmitting(true);
            await form.handleSubmit(async (data) => {
                const { username, usNumber, acceptTerms, verificationCode } = data;
                const user = auth.currentUser;
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

                const newTikTokUser = {
                    id: user.uid,
                    tiktokUsername: username,
                    termsAccepted: acceptTerms,
                    phoneNumberId: selectedPhoneNumberDoc.id,
                    verificationCode,
                    isVerified: true, // Assuming verification is successful
                };
                
                const userDocRef = doc(firestore, 'tiktok_users', user.uid);
                
                setDocumentNonBlocking(userDocRef, newTikTokUser, { merge: true });

                // Simulate processing time
                await new Promise(res => setTimeout(res, 1500));
                
                setIsSubmitting(false);
                api.scrollNext();
            })();
             // Handle case where form is invalid
            if (!form.formState.isValid) {
              setIsSubmitting(false);
            }
        } else {
            api.scrollNext();
        }
    }
  };

  const handlePrev = () => {
    if (isSubmitting) return;
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
  const progress = ((currentStep + 1) / TIKTOK_BRIDGE_STEPS.length) * 100;
  
  return (
    <Card>
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <div className="flex items-center space-x-3 min-h-[48px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <CurrentIcon className="h-5 w-5" />
            </div>
            <div>
                <CardTitle className="font-headline">{TIKTOK_BRIDGE_STEPS[currentStep].title}</CardTitle>
                {currentStep < TIKTOK_BRIDGE_STEPS.length - 1 && 
                    <CardDescription>Step {currentStep + 1} of {TIKTOK_BRIDGE_STEPS.length - 1}</CardDescription>
                }
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="min-h-[380px]">
            <Carousel setApi={setApi} opts={{ drag: false, loop: false, watchDrag: false }} className="w-full">
              <CarouselContent>
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
                <CarouselItem>
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="pt-2">
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormControl>
                          <ScrollArea className="h-32 w-full rounded-md border p-4 text-sm">
                            By using TikTok Bridge, you agree to allow us to manage monetization on your behalf through third-party solutions. This service is for users where TikTok's native monetization is unavailable. We are not affiliated with TikTok. We act as an intermediary to connect you with US-based programs. A service fee applies. Data is handled securely. You can revoke access by contacting support.
                          </ScrollArea>
                        </FormControl>
                         <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="terms" checked={field.value} onCheckedChange={field.onChange} />
                            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I accept the terms and conditions
                            </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CarouselItem>
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
                        <p className="text-sm text-muted-foreground pt-1">Enter the 6-digit code sent to your new number.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CarouselItem>
                <CarouselItem>
                  <div className="text-center py-8 flex flex-col items-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold">Setup Complete!</h3>
                    <p className="text-muted-foreground mt-2 max-w-[250px]">Your account is now linked and ready for monetization.</p>
                  </div>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </CardContent>
          
          {currentStep < TIKTOK_BRIDGE_STEPS.length - 1 && (
            <CardFooter className="flex justify-between">
              <Button type="button" variant="ghost" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting}>Back</Button>
              <Button type="button" onClick={handleNext} disabled={isSubmitting || phoneNumbersLoading}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentStep === TIKTOK_BRIDGE_STEPS.length - 2 ? "Finish" : "Continue"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}

    