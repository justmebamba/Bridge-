
'use server';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Handler for admin actions to approve/reject steps
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { step, status, rejectionReason } = body;

    if (!id || !step || !status) {
      return NextResponse.json({ message: 'Submission ID, step, and status are required' }, { status: 400 });
    }
    
    const submission = await prisma.submission.findUnique({ where: { id } });

    if (!submission) {
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    const dataToUpdate: any = {
        [`${step}Status`]: status
    };

    if (status === 'rejected') {
        dataToUpdate.rejectionReason = rejectionReason || `Your entry for ${step} was not approved.`;
    } else {
        dataToUpdate.rejectionReason = null;
    }
    
    const updatedSubmission = await prisma.submission.update({
        where: { id },
        data: dataToUpdate
    });

    return NextResponse.json(updatedSubmission, { status: 200 });

  } catch (error: any) {
    console.error("Error updating submission status:", error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
