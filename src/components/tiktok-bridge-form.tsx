"use client";

import { useState, useEffect } from "react";
import type { EmblaCarouselType } from 'embla-carousel-react'
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { User, FileText, Phone, KeyRound, CheckCircle, Loader2, AtSign } from "lucide-react";
import Link from "next/link";
import { collection, doc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useAuth, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { initiateAnonymousSignIn, addDocumentNonBlocking } from "@/firebase";

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


export function TikTokBridgeForm() {
  const [api, setApi] = useState<CarouselApi>()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();

  const phoneNumbersQuery = useMemoFirebase(() => collection(firestore, 'phone_numbers'), [firestore]);
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useCollection<{phoneNumber: string, isAvailable: boolean}>(phoneNumbersQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });
    
  useEffect(() => {
    initiateAnonymousSignIn(auth);
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
                if (!user) {
                  console.error("User not authenticated");
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
                
                const usersCollection = collection(firestore, 'tiktok_users');
                const userDocRef = doc(usersCollection, user.uid);
                
                addDocumentNonBlocking(collection(firestore, 'tiktok_users'), newTikTokUser);

                await new Promise(res => setTimeout(res, 1500));
                api.scrollNext();
                setIsSubmitting(false);
            })();
        } else {
            api.scrollNext();
        }
    }
  };

  const handlePrev = () => {
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
          <CardContent className="min-h-[240px]">
            <Carousel setApi={setApi} opts={{ watchDrag: false, loop: false }} className="w-full">
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
                         <FormMessage />
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-2 pt-2"
                            >
                            {phoneNumbersLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                phoneNumbers?.filter(n => n.isAvailable).map((number, index) => (
                                    <FormItem key={number.id} className="flex items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/10">
                                    <FormControl>
                                        <RadioGroupItem value={number.phoneNumber} id={`number-${index}`} />
                                    </FormControl>
                                    <FormLabel htmlFor={`number-${index}`} className="font-normal cursor-pointer flex-1">{number.phoneNumber}</FormLabel>
                                    </FormItem>
                                ))
                            )}
                            </RadioGroup>
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
              <Button type="button" variant="ghost" onClick={handlePrev} disabled={currentStep === 0}>Back</Button>
              <Button type="button" onClick={handleNext} disabled={isSubmitting || phoneNumbersLoading} className="bg-accent hover:bg-accent/90">
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
