
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

// This is the correct way to initialize the Firebase Admin SDK in a Next.js serverless environment.
// It ensures that we don't try to re-initialize the app on every hot-reload.
const getAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApp();
  }
  if (!serviceAccount) {
    throw new Error('Firebase service account credentials are not set in the environment variables.');
  }
  return initializeApp({
    credential: cert(serviceAccount),
  });
};

export function initializeFirebaseAdmin() {
  getAdminApp();
}

export const adminAuth = getAuth(getAdminApp());
