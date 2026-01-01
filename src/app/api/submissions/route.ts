
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

// GET handler for client-side fetching of a single submission's status.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
        return NextResponse.json({ message: 'Submission ID is required.' }, { status: 400 });
    }
    
    try {
        const submissionRef = db.collection('submissions').doc(userId);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
        }
        
        const submissionData = submissionDoc.data();
        const submission = { 
            id: submissionDoc.id, 
            ...submissionData,
            createdAt: submissionData?.createdAt?.toDate ? submissionData.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as Submission;
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
    const id = body.id || body.tiktokUsername;

    if (!id) {
        return NextResponse.json({ message: 'An ID (TikTok username) is required.' }, { status: 400 });
    }

    const submissionRef = db.collection('submissions').doc(id);
    const submissionDoc = await submissionRef.get();

    let dataToSet: Partial<Submission> & { [key: string]: any } = {};

    if (!submissionDoc.exists) {
        // This is a new submission
        dataToSet = {
            id,
            tiktokUsername: id,
            tiktokUsernameStatus: 'pending',
            verificationCodeStatus: 'pending',
            phoneNumberStatus: 'pending',
            finalCodeStatus: 'pending',
            isVerified: false,
            createdAt: FieldValue.serverTimestamp(),
        };
    }

    // Update data based on what's provided in the body
    if(body.tiktokUsername) dataToSet.tiktokUsernameStatus = 'approved';
    if(body.verificationCode) {
        dataToSet.verificationCode = body.verificationCode;
        dataToSet.verificationCodeStatus = 'approved';
    }
    if(body.phoneNumber) {
        dataToSet.phoneNumber = body.phoneNumber;
        dataToSet.phoneNumberStatus = 'approved';
    }
    if(body.finalCode) {
        dataToSet.finalCode = body.finalCode;
        dataToSet.finalCodeStatus = 'approved';
        dataToSet.isVerified = true;
    }

    await submissionRef.set(dataToSet, { merge: true });

    const updatedDoc = await submissionRef.get();
    const updatedData = updatedDoc.data()!;
    const updatedSubmission = { 
        id: updatedDoc.id, 
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate ? updatedData.createdAt.toDate().toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(updatedSubmission, { status: 200 });

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
    
    const submissionRef = db.collection('submissions').doc(submissionId);

    const keyToUpdate = `${step}Status`;
    let updatePayload: { [key: string]: any } = { [keyToUpdate]: status };
    
    // If rejecting any step, set the final verification to false
    if (status === 'rejected') {
        updatePayload.isVerified = false;
    }
    
    // If approving the final step, set the final verification to true
    if (step === 'finalCode' && status === 'approved') {
        updatePayload.isVerified = true;
    }

    await submissionRef.update(updatePayload);

    const updatedDoc = await submissionRef.get();
    const updatedData = updatedDoc.data()!;
    const responseData = { 
        id: updatedDoc.id, 
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate ? updatedData.createdAt.toDate().toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 200 });

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
    
    const submissionRef = db.collection('submissions').doc(submissionId);
    await submissionRef.delete();

    return NextResponse.json({ message: 'Submission deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
