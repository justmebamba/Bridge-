
'use server';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Submission } from '@/lib/types';

// This GET handler is for client-side fetching of a single submission's status.
// The admin dashboard will fetch data directly on the server.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
        return NextResponse.json({ message: 'Submission ID is required.' }, { status: 400 });
    }
    
    try {
        const submission = await prisma.submission.findUnique({ where: { id: userId } });
        if (!submission) {
            return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
        }
        return NextResponse.json(submission);
    } catch (error: any) {
        console.error('Error fetching submission:', error);
        return NextResponse.json({ message: error.message || "Could not fetch submission." }, { status: 500 });
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
        
        let submission = await prisma.submission.findUnique({ where: { id } });

        if (submission) {
            // User exists, just return their data (login)
            return NextResponse.json(submission);
        } else {
            // User doesn't exist, create a new submission (signup)
            const newSubmission = await prisma.submission.create({
                data: {
                    id,
                    tiktokUsername: id,
                    tiktokUsernameStatus: 'approved',
                }
            });
            return NextResponse.json(newSubmission, { status: 201 });
        }
    }

    // Handle subsequent steps
    if (!id || !step || data === undefined) {
      return NextResponse.json({ message: 'Submission ID, step, and data are required' }, { status: 400 });
    }
    
    const submission = await prisma.submission.findUnique({ where: { id } });
    
    if (!submission) {
       return NextResponse.json({ message: 'Submission not found.' }, { status: 404 });
    }
    
    // Update the specific step and its status
    const updatedSubmission = await prisma.submission.update({
        where: { id },
        data: {
            [step]: data,
            [`${step}Status`]: 'approved',
            rejectionReason: null, // Clear any previous rejection reason
        }
    });

    return NextResponse.json(updatedSubmission);

  } catch (error: any) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
