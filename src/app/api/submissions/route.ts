
'use server';

import { NextResponse } from 'next/server';
import { 
    getSubmissionById, 
    createOrUpdateSubmission,
    updateSubmissionStepStatus,
    deleteSubmission,
} from '@/lib/data-access';

// GET handler for client-side fetching of a single submission's status.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
        return NextResponse.json({ message: 'Submission ID is required.' }, { status: 400 });
    }
    
    try {
        const submission = await getSubmissionById(userId);

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
    const id = body.id || body.tiktokUsername;

    if (!id) {
        return NextResponse.json({ message: 'An ID (TikTok username) is required.' }, { status: 400 });
    }
    
    const submission = await createOrUpdateSubmission(id, body);

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
    
    const submission = await updateSubmissionStepStatus(submissionId, step, status);

    return NextResponse.json(submission, { status: 200 });

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
    
    await deleteSubmission(submissionId);

    return NextResponse.json({ message: 'Submission deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
