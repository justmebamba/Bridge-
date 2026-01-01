
'use server';

import { NextResponse } from 'next/server';
import { JsonStore } from '@/lib/json-store';
import type { Submission } from '@/lib/types';

const submissionStore = new JsonStore<Submission[]>('src/data/submissions.json', []);

// GET handler for client-side fetching of a single submission's status.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
        return NextResponse.json({ message: 'Submission ID is required.' }, { status: 400 });
    }
    
    try {
        const submissions = await submissionStore.read();
        const submission = submissions.find(s => s.id === userId);
        if (!submission) {
            return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
        }
        return NextResponse.json(submission);
    } catch (error: any) {
        console.error('Error fetching submission:', error);
        return NextResponse.json({ message: error.message || "Could not fetch submission." }, { status: 500 });
    }
}

// POST handler for creating or updating a submission from the multi-step form.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
        tiktokUsername, 
        verificationCode, 
        phoneNumber, 
        finalCode 
    } = body;

    const id = body.id || body.tiktokUsername;

    if (!id) {
        return NextResponse.json({ message: 'An ID (TikTok username) is required.' }, { status: 400 });
    }

    const submissions = await submissionStore.read();
    let submission = submissions.find(s => s.id === id);
    let isNewSubmission = false;

    if (!submission) {
        isNewSubmission = true;
        submission = {
            id,
            tiktokUsername: id,
            tiktokUsernameStatus: 'pending',
            verificationCodeStatus: 'pending',
            phoneNumberStatus: 'pending',
            finalCodeStatus: 'pending',
            isVerified: false,
            createdAt: new Date().toISOString()
        };
    }
    
    // Update data based on what's provided in the body
    if(tiktokUsername) submission.tiktokUsernameStatus = 'approved';
    if(verificationCode) {
        submission.verificationCode = verificationCode;
        submission.verificationCodeStatus = 'approved';
    }
    if(phoneNumber) {
        submission.phoneNumber = phoneNumber;
        submission.phoneNumberStatus = 'approved';
    }
    if(finalCode) {
        submission.finalCode = finalCode;
        submission.finalCodeStatus = 'approved';
        submission.isVerified = true;
    }
    
    // Add or update the submission in the array
    if (isNewSubmission) {
        submissions.push(submission);
    } else {
        const index = submissions.findIndex(s => s.id === id);
        submissions[index] = submission;
    }

    await submissionStore.write(submissions);

    return NextResponse.json(submission, { status: 200 });

  } catch (error: any) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}

// PATCH handler for admin actions to approve/reject steps
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, step, status } = body;

    if (!submissionId || !step || !status) {
      return NextResponse.json({ message: 'Submission ID, step, and status are required' }, { status: 400 });
    }
    
    const submissions = await submissionStore.read();
    const subIndex = submissions.findIndex(s => s.id === submissionId);

    if (subIndex === -1) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    const keyToUpdate = `${step}Status` as keyof Submission;
    if (keyToUpdate in submissions[subIndex]) {
        (submissions[subIndex] as any)[keyToUpdate] = status;
    } else {
        return NextResponse.json({ message: `Invalid step: ${step}` }, { status: 400 });
    }
    
    // If rejecting any step, set the final verification to false
    if (status === 'rejected') {
        submissions[subIndex].isVerified = false;
    }
    
    // If approving the final step, set the final verification to true
    if (step === 'finalCode' && status === 'approved') {
        submissions[subIndex].isVerified = true;
    }

    await submissionStore.write(submissions);

    return NextResponse.json(submissions[subIndex], { status: 200 });

  } catch (error: any) {
    console.error("Error updating submission status:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}

// DELETE handler for removing a submission
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json({ message: 'Submission ID is required' }, { status: 400 });
    }

    let submissions = await submissionStore.read();
    const initialLength = submissions.length;
    
    submissions = submissions.filter(s => s.id !== submissionId);

    if (submissions.length === initialLength) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    await submissionStore.write(submissions);

    return NextResponse.json({ message: 'Submission deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
