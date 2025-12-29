
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

// This ensures we have a single instance of the app.
let adminApp: App | undefined;

export function initializeFirebaseAdmin() {
  if (!adminApp) {
      if (getApps().length > 0) {
        adminApp = getApps().find(app => app.name === 'admin') || getApps()[0];
      } else {
        if (!serviceAccount) {
            throw new Error('Firebase service account credentials are not set in the environment variables.');
        }
        adminApp = initializeApp(
            {
                credential: cert(serviceAccount),
            },
            'admin'
        );
      }
  }
  return adminApp;
}
