
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SubmissionData {
  tiktokUsername?: string;
  verificationCode?: string;
  phoneNumber?: string;
  finalCode?: string;
}

interface SubmissionContextType {
  submission: SubmissionData;
  setSubmission: React.Dispatch<React.SetStateAction<SubmissionData>>;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export const SubmissionProvider = ({ children }: { children: ReactNode }) => {
  const [submission, setSubmission] = useState<SubmissionData>({});

  return (
    <SubmissionContext.Provider value={{ submission, setSubmission }}>
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
