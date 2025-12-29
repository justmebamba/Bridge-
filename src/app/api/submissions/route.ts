
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
    
    if (step === 'tiktokUsername') {
        if (!id) {
            return NextResponse.json({ message: 'TikTok username is required.' }, { status: 400 });
        }
        
        return await store.update(async (submissions) => {
            let submission = submissions.find(s => s.id === id);

            if (submission) {
                return { updatedData: submissions, result: submission };
            } else {
                const newSubmission: Submission = {
                    id,
                    createdAt: new Date().toISOString(),
                    isVerified: false,
                    tiktokUsername: id,
                    tiktokUsernameStatus: 'approved',
                    verificationCode: '',
                    verificationCodeStatus: 'pending',
                    phoneNumber: '',
                    phoneNumberStatus: 'pending',
                    finalCode: '',
                    finalCodeStatus: 'pending',
                };
                submissions.push(newSubmission);
                return { updatedData: submissions, result: newSubmission };
            }
        });
    }

    if (!id || !step || data === undefined) {
      return NextResponse.json({ message: 'Submission ID, step, and data are required' }, { status: 400 });
    }
    
    return await store.update(async (submissions) => {
        const submissionIndex = submissions.findIndex(s => s.id === id);
        
        if (submissionIndex === -1) {
            const err = new Error('Submission not found.');
            (err as any).statusCode = 404;
            throw err;
        }
        
        const submission = submissions[submissionIndex];
        
        (submission as any)[step] = data;
        (submission as any)[`${step}Status`] = 'pending';
        
        submission.rejectionReason = undefined;
        
        submissions[submissionIndex] = submission;
        
        return { updatedData: submissions, result: submission };
    });

  } catch (error: any) {
    console.error("Error processing submission:", error);
    if (error.statusCode) {
        return NextResponse.json({ message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
