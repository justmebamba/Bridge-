
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

// Handler for admin actions to approve/reject steps
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { step, status, rejectionReason } = body;

    if (!id || !step || !status) {
      return NextResponse.json({ message: 'Submission ID, step, and status are required' }, { status: 400 });
    }

    let submissions = await readSubmissions();
    const submissionIndex = submissions.findIndex(s => s.id === id);

    if (submissionIndex === -1) {
      return NextResponse.json({ message: 'Submission not found.' }, { status: 404 });
    }

    const submission = submissions[submissionIndex];
    const statusKey = `${step}Status` as keyof Submission;

    if (statusKey in submission) {
      (submission as any)[statusKey] = status;
      if (status === 'rejected') {
        submission.rejectionReason = rejectionReason || `Your entry for ${step} was not approved.`;
      } else {
        submission.rejectionReason = undefined;
      }
    } else {
        return NextResponse.json({ message: `Invalid step: ${step}` }, { status: 400 });
    }

    submissions[submissionIndex] = submission;
    await writeSubmissions(submissions);

    return NextResponse.json(submission, { status: 200 });

  } catch (error: any) {
    console.error("Error updating submission status:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
