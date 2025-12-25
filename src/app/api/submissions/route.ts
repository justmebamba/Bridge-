
'use server';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { Submission } from '@/lib/types';

// The path to the JSON file, assuming it's in the `src/data` directory
const dataFilePath = path.join(process.cwd(), 'src/data/submissions.json');

// Helper function to read data from the file
async function readSubmissions(): Promise<Submission[]> {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents) as Submission[];
  } catch (error: any) {
    // If the file doesn't exist, return an empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading submissions data:', error);
    throw new Error('Could not read submissions data.');
  }
}

// Helper function to write data to the file
async function writeSubmissions(submissions: Submission[]): Promise<void> {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(submissions, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing submissions data:', error);
    throw new Error('Could not write submissions data.');
  }
}

// GET handler to retrieve all submissions
export async function GET() {
  try {
    const submissions = await readSubmissions();
    return NextResponse.json(submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST handler to create or update a submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Submission ID is required' }, { status: 400 });
    }

    const submissions = await readSubmissions();
    const existingSubmissionIndex = submissions.findIndex(s => s.id === id);

    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      submissions[existingSubmissionIndex] = { ...submissions[existingSubmissionIndex], ...body };
    } else {
      // Create new submission
      const newSubmission: Submission = {
        createdAt: new Date().toISOString(),
        isVerified: false,
        ...body,
      };
      submissions.push(newSubmission);
    }

    await writeSubmissions(submissions);

    return NextResponse.json({ message: 'Submission saved successfully' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
