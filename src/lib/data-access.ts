
import type { Submission } from '@/lib/types';
import { getDb } from './firebaseAdmin';

const useFirestore = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

// In-memory store for when Firebase is not configured.
// WARNING: This is temporary. Data will be lost on server restart.
let inMemorySubmissions: Submission[] = [];

export async function getSubmissions(): Promise<Submission[]> {
    if (!useFirestore) {
        console.warn("WARNING: Firebase not configured. Using temporary in-memory store. Data will be lost on app restart.");
        return [...inMemorySubmissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const db = getDb();
    const submissionsCollection = db.collection('submissions');
    const snapshot = await submissionsCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
     if (!useFirestore) {
        console.warn("WARNING: Firebase not configured. Using temporary in-memory store.");
        const submission = inMemorySubmissions.find(s => s.id === id);
        return submission || null;
    }
    const db = getDb();
    const submissionsCollection = db.collection('submissions');
    const doc = await submissionsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() } as Submission;
}

export async function createOrUpdateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    if (!useFirestore) {
        console.warn("WARNING: Firebase not configured. Using temporary in-memory store. Data will be lost on app restart.");
        const existingIndex = inMemorySubmissions.findIndex(s => s.id === id);
        let submissionData: Submission;

        if (existingIndex > -1) {
            const existingData = inMemorySubmissions[existingIndex];
            submissionData = { ...existingData, ...data, id };
            if (data.verificationCode) submissionData.verificationCodeStatus = 'pending';
            if (data.phoneNumber) submissionData.phoneNumberStatus = 'approved';
            if (data.finalCode) submissionData.finalCodeStatus = 'pending';
            inMemorySubmissions[existingIndex] = submissionData;
        } else {
            submissionData = {
                id,
                tiktokUsername: id,
                tiktokUsernameStatus: 'approved',
                verificationCodeStatus: 'pending',
                phoneNumberStatus: 'pending',
                finalCodeStatus: 'pending',
                isVerified: false,
                createdAt: new Date().toISOString(),
                ...data,
            };
            inMemorySubmissions.push(submissionData);
        }
        return submissionData;
    }

    const db = getDb();
    const submissionsCollection = db.collection('submissions');
    const docRef = submissionsCollection.doc(id);
    const doc = await docRef.get();

    let submissionData: Submission;

    if (doc.exists) {
        const existingData = doc.data() as Submission;
        submissionData = { ...existingData, ...data, id: doc.id };

        if (data.tiktokUsername) submissionData.tiktokUsernameStatus = 'approved';
        if (data.verificationCode) submissionData.verificationCodeStatus = 'pending';
        if (data.phoneNumber) submissionData.phoneNumberStatus = 'approved'; 
        if (data.finalCode) submissionData.finalCodeStatus = 'pending';
        
        await docRef.set(submissionData, { merge: true });

    } else {
         submissionData = {
            id,
            tiktokUsername: id,
            tiktokUsernameStatus: 'approved',
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
    if (!useFirestore) {
        console.warn("WARNING: Firebase not configured. Using temporary in-memory store. Data will be lost on app restart.");
        const subIndex = inMemorySubmissions.findIndex(s => s.id === submissionId);
        if (subIndex === -1) {
            throw new Error("Submission not found in in-memory store.");
        }
        const keyToUpdate = `${step}Status` as keyof Submission;
        (inMemorySubmissions[subIndex] as any)[keyToUpdate] = status;

        if (step === 'finalCode' && status === 'approved') {
            inMemorySubmissions[subIndex].isVerified = true;
        }
         if (status === 'rejected') {
            inMemorySubmissions[subIndex].isVerified = false;
        }

        return inMemorySubmissions[subIndex];
    }
    const db = getDb();
    const submissionsCollection = db.collection('submissions');
    const docRef = submissionsCollection.doc(submissionId);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error('Submission not found');
    }

    const keyToUpdate = `${step}Status`;
    let updatePayload: { [key: string]: any } = { [keyToUpdate]: status };

    if (status === 'rejected') {
        updatePayload.isVerified = false;
    }
    
    if (step === 'finalCode' && status === 'approved') {
        updatePayload.isVerified = true;
    }

    await docRef.update(updatePayload);

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Submission;
}


export async function deleteSubmission(submissionId: string): Promise<void> {
    if (!useFirestore) {
        console.warn("WARNING: Firebase not configured. Using temporary in-memory store.");
        inMemorySubmissions = inMemorySubmissions.filter(s => s.id !== submissionId);
        return;
    }
    const db = getDb();
    const submissionsCollection = db.collection('submissions');
    await submissionsCollection.doc(submissionId).delete();
}
