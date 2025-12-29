
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import type { Submission } from '@/lib/types';


interface SubmissionContextType {
  submission: Partial<Submission> | null;
  setSubmission: React.Dispatch<React.SetStateAction<Partial<Submission> | null>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export const SubmissionProvider = ({ children }: { children: ReactNode }) => {
  const [submission, setSubmission] = useState<Partial<Submission> | null>({});
  const [currentStep, setCurrentStep] = useState(1);
  
  const value = useMemo(() => ({ 
      submission, 
      setSubmission,
      currentStep,
      setCurrentStep
    }), [submission, currentStep]);

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
};

export const useSubmission = () => {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmission must be used within a SubmissionProvider');
  }
  return context;
};
