
'use server';

import { NextResponse } from 'next/server';
import type { Submission } from '@/lib/types';
import { JsonStore } from '@/lib/json-store';

const store = new JsonStore<Submission[]>('src/data/submissions.json', []);


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    try {
        const submissions = await store.read();
        if (userId) {
            const submission = submissions.find(s => s.id === userId);
            if (!submission) {
                return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
            }
            return NextResponse.json(submission);
        } else {
            // This is for the admin page to get all submissions
            return NextResponse.json(submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
    } catch (error: any) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ message: error.message || "Could not fetch submissions." }, { status: 500 });
    }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, step, data } = body;

    const submissions = await store.read();
    
    if (step === 'tiktokUsername') {
        if (!id) {
            return NextResponse.json({ message: 'TikTok username is required.' }, { status: 400 });
        }
        
        let submission = submissions.find(s => s.id === id);

        if (submission) {
            // User exists, just return their data (login)
            return NextResponse.json(submission);
        } else {
            // User doesn't exist, create a new submission (signup)
            const newSubmission: Submission = {
                id,
                createdAt: new Date().toISOString(),
                isVerified: false,
                tiktokUsername: id,
                tiktokUsernameStatus: 'approved', // Auto-approved for simplicity on first step
                verificationCode: '',
                verificationCodeStatus: 'pending',
                phoneNumber: '',
                phoneNumberStatus: 'pending',
                finalCode: '',
                finalCodeStatus: 'pending',
            };
            submissions.push(newSubmission);
            await store.write(submissions);
            return NextResponse.json(newSubmission, { status: 201 });
        }
    }

    // Handle subsequent steps
    if (!id || !step || data === undefined) {
      return NextResponse.json({ message: 'Submission ID, step, and data are required' }, { status: 400 });
    }
    
    const submissionIndex = submissions.findIndex(s => s.id === id);
    
    if (submissionIndex === -1) {
       return NextResponse.json({ message: 'Submission not found.' }, { status: 404 });
    }
    
    const submission = submissions[submissionIndex];
    
    // Update the specific step and its status
    (submission as any)[step] = data;
    // Set status to pending for admin review
    (submission as any)[`${step}Status`] = 'pending';
    
    // Clear any previous rejection reason when they re-submit a step
    submission.rejectionReason = undefined;
    
    submissions[submissionIndex] = submission;
    
    await store.write(submissions);

    return NextResponse.json(submission);

  } catch (error: any) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
