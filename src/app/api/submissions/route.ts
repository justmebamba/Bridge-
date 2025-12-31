
'use server';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Submission } from '@/lib/types';

// This GET handler is for client-side fetching of a single submission's status.
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

// POST handler for creating or updating a submission from the multi-step form.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
        tiktokUsername, 
        verificationCode, 
        phoneNumber, 
        finalCode 
    } = body as Partial<Submission> & { tiktokUsername: string };

    if (!tiktokUsername) {
        return NextResponse.json({ message: 'TikTok username is required.' }, { status: 400 });
    }
    
    const id = tiktokUsername.startsWith('@') ? tiktokUsername.substring(1) : tiktokUsername;

    const data: Partial<Submission> = {
        id,
        tiktokUsername: id,
        tiktokUsernameStatus: 'approved',
    };
    
    if(verificationCode) {
        data.verificationCode = verificationCode;
        data.verificationCodeStatus = 'approved';
    }
    if(phoneNumber) {
        data.phoneNumber = phoneNumber;
        data.phoneNumberStatus = 'approved';
    }
    if(finalCode) {
        data.finalCode = finalCode;
        data.finalCodeStatus = 'approved';
    }

    const submission = await prisma.submission.upsert({
        where: { id },
        update: data,
        create: {
            ...data,
            // Set default statuses for create
            verificationCodeStatus: data.verificationCode ? 'approved' : 'pending',
            phoneNumberStatus: data.phoneNumber ? 'approved' : 'pending',
            finalCodeStatus: data.finalCode ? 'approved' : 'pending',
            isVerified: !!data.finalCode,
        } as Submission
    });

    return NextResponse.json(submission, { status: 200 });

  } catch (error: any) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
