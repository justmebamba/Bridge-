
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let adminApp: App;

export async function initializeFirebaseAdmin() {
  if (getApps().some(app => app.name === 'admin')) {
      adminApp = getApps().find(app => app.name === 'admin')!;
      return adminApp;
  }
  
  if (!serviceAccount) {
      throw new Error('Firebase service account credentials are not set in the environment variables.');
  }

  adminApp = initializeApp(
    {
      credential: cert(serviceAccount),
    },
    'admin'
  );
  return adminApp;
}
