
import type { Submission, AdminUser } from '@/lib/types';
import { db } from './firebase';
import { FieldValue } from 'firebase-admin/firestore';

function docToSubmission(doc: FirebaseFirestore.DocumentSnapshot): Submission {
    const data = doc.data() as any; // Cast to any to handle server timestamps
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    } as Submission;
}

function docToAdmin(doc: FirebaseFirestore.DocumentSnapshot): AdminUser {
     const data = doc.data() as any;
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    } as AdminUser;
}

export async function getSubmissions(): Promise<Submission[]> {
  const snapshot = await db.collection('submissions').orderBy('createdAt', 'desc').get();
  if (snapshot.empty) {
      return [];
  }
  return snapshot.docs.map(docToSubmission);
}

export async function getAdmins(): Promise<AdminUser[]> {
    const snapshot = await db.collection('admins').orderBy('createdAt', 'asc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(docToAdmin);
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
    const doc = await db.collection('admins').doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return docToAdmin(doc);
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
    const snapshot = await db.collection('admins').where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
        return null;
    }
    return docToAdmin(snapshot.docs[0]);
}

export async function addAdmin({ email, passwordHash, isMainAdmin }: { email: string; passwordHash: string; isMainAdmin: boolean }): Promise<AdminUser> {
    const newAdminRef = db.collection('admins').doc();
    const newAdmin: Omit<AdminUser, 'id'> = {
        email,
        passwordHash,
        isMainAdmin,
        isVerified: isMainAdmin, // First admin is auto-verified
        createdAt: FieldValue.serverTimestamp() as any,
    };
    await newAdminRef.set(newAdmin);
    return {
        id: newAdminRef.id,
        ...newAdmin
    } as AdminUser;
}
