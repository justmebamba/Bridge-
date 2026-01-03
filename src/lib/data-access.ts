
import type { Submission, AdminUser } from '@/lib/types';
import { JsonStore } from './json-store';
import { v4 as uuidv4 } from 'uuid';

const submissionStore = new JsonStore<Submission[]>('src/data/submissions.json', []);
const adminStore = new JsonStore<AdminUser[]>('src/data/admins.json', []);


// Submissions

export async function getSubmissions(): Promise<Submission[]> {
    const submissions = await submissionStore.read();
    // Sort by date descending
    return submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const submissions = await submissionStore.read();
    return submissions.find(s => s.id === id) || null;
}

export async function createOrUpdateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const submissions = await submissionStore.read();
    const existingIndex = submissions.findIndex(s => s.id === id);

    let submissionData: Submission;

    if (existingIndex > -1) {
        // Merge new data with existing submission
        submissionData = { ...submissions[existingIndex], ...data };

        // Ensure statuses are correctly updated based on incoming data
        if (data.tiktokUsername) submissionData.tiktokUsernameStatus = 'approved';
        if (data.verificationCode) submissionData.verificationCodeStatus = 'pending';
        if (data.phoneNumber) submissionData.phoneNumberStatus = 'pending';
        if (data.finalCode) submissionData.finalCodeStatus = 'pending';

        submissions[existingIndex] = submissionData;

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
        submissions.push(submissionData);
    }
    
    await submissionStore.write(submissions);
    return submissionData;
}

export async function updateSubmissionStepStatus(submissionId: string, step: string, status: 'approved' | 'rejected'): Promise<Submission> {
    const submissions = await submissionStore.read();
    const submissionIndex = submissions.findIndex(s => s.id === submissionId);

    if (submissionIndex === -1) {
        throw new Error('Submission not found');
    }

    const submission = submissions[submissionIndex];
    const keyToUpdate = `${step}Status` as keyof Submission;
    
    (submission as any)[keyToUpdate] = status;

    // If any step is rejected, the entire submission is no longer considered verified.
    if (status === 'rejected') {
        submission.isVerified = false;
    }
    
    // If the final code step is approved, the entire submission becomes verified.
    if (step === 'finalCode' && status === 'approved') {
        submission.isVerified = true;
    }

    await submissionStore.write(submissions);
    return submission;
}


export async function deleteSubmission(submissionId: string): Promise<void> {
    let submissions = await submissionStore.read();
    submissions = submissions.filter(s => s.id !== submissionId);
    await submissionStore.write(submissions);
}


// Admins

export async function getAdmins(): Promise<Omit<AdminUser, 'passwordHash'>[]> {
    const admins = await adminStore.read();
    // sort by creation date ascending
    admins.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return admins.map(({ passwordHash, ...admin }) => admin);
}

export async function getAdminById(id: string): Promise<Omit<AdminUser, 'passwordHash'> | null> {
    const admins = await adminStore.read();
    const admin = admins.find(a => a.id === id);
    if (!admin) return null;
    const { passwordHash, ...adminData } = admin;
    return adminData;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
    const admins = await adminStore.read();
    return admins.find(a => a.email === email) || null;
}

export async function addAdmin({ email, passwordHash, isMainAdmin }: { email: string; passwordHash: string; isMainAdmin: boolean }): Promise<AdminUser> {
    const admins = await adminStore.read();
    const newAdmin: AdminUser = {
        id: uuidv4(),
        email,
        passwordHash,
        isMainAdmin,
        isVerified: isMainAdmin, // First admin is auto-verified
        createdAt: new Date().toISOString(),
    };
    admins.push(newAdmin);
    await adminStore.write(admins);
    return newAdmin;
}

export async function updateAdminVerification(adminId: string, isVerified: boolean): Promise<Omit<AdminUser, 'passwordHash'>> {
    const admins = await adminStore.read();
    const adminIndex = admins.findIndex(a => a.id === adminId);

    if (adminIndex === -1) {
        throw new Error("Admin not found");
    }

    admins[adminIndex].isVerified = isVerified;
    await adminStore.write(admins);

    const { passwordHash, ...adminData } = admins[adminIndex];
    return adminData;
}
