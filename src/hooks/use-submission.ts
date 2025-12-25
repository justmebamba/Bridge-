'use client';
import { useContext } from 'react';
import { SubmissionContext } from '@/components/submission-provider';

export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmission must be used within a SubmissionProvider');
  }
  return context;
}
