import type { Submission } from '@/lib/types';
import { db } from './firebaseAdmin';

const submissionsCollection = db.collection('submissions');

// Submissions

export async function getSubmissions(): Promise<Submission[]> {
    const snapshot = await submissionsCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const doc = await submissionsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() } as Submission;
}

export async function createOrUpdateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const docRef = submissionsCollection.doc(id);
    const doc = await docRef.get();

    let submissionData: Submission;

    if (doc.exists) {
        // Merge new data with existing submission
        const existingData = doc.data() as Submission;
        submissionData = { ...existingData, ...data, id: doc.id };

        // Ensure statuses are correctly updated based on incoming data
        if (data.tiktokUsername) submissionData.tiktokUsernameStatus = 'approved';
        if (data.verificationCode) submissionData.verificationCodeStatus = 'pending';
        if (data.phoneNumber) submissionData.phoneNumberStatus = 'approved'; // Let's keep this auto-approved for smoother flow
        if (data.finalCode) submissionData.finalCodeStatus = 'pending';
        
        await docRef.set(submissionData, { merge: true });

    } else {
         submissionData = {
            id,
            tiktokUsername: id,
            tiktokUsernameStatus: 'approved', // If creating, username step is done
            verificationCodeStatus: 'pending',
            phoneNumberStatus: 'pending',
            finalCodeStatus: 'pending',
            isVerified: false,
            createdAt: new Date().toISOString(),
            ...data,
        };
        await docRef.set(submissionData);
    }
    
    return submissionData;
}

export async function updateSubmissionStepStatus(submissionId: string, step: string, status: 'approved' | 'rejected'): Promise<Submission> {
    const docRef = submissionsCollection.doc(submissionId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error('Submission not found');
    }

    const keyToUpdate = `${step}Status`;
    let updatePayload: { [key: string]: any } = { [keyToUpdate]: status };

    // If any step is rejected, the entire submission is no longer considered verified.
    if (status === 'rejected') {
        updatePayload.isVerified = false;
    }
    
    // If the final code step is approved, the entire submission becomes verified.
    if (step === 'finalCode' && status === 'approved') {
        updatePayload.isVerified = true;
    }

    await docRef.update(updatePayload);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Submission;
}


export async function deleteSubmission(submissionId: string): Promise<void> {
    await submissionsCollection.doc(submissionId).delete();
}
