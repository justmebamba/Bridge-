import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function getDb(): admin.firestore.Firestore {
  if (!db) {
    if (!admin.apps.length) {
      try {
        if (!process.env.FIREBASE_PROJECT_ID) {
            throw new Error('Firebase Error: Missing environment variable FIREBASE_PROJECT_ID.');
        }
        if (!process.env.FIREBASE_CLIENT_EMAIL) {
            throw new Error('Firebase Error: Missing environment variable FIREBASE_CLIENT_EMAIL.');
        }
        if (!process.env.FIREBASE_PRIVATE_KEY) {
            throw new Error('Firebase Error: Missing environment variable FIREBASE_PRIVATE_KEY.');
        }

        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error: any) {
        console.error('Firebase admin initialization error:', error);
        // Throw an error that can be caught by the API route handler
        throw new Error(error.message || 'Could not initialize Firebase Admin SDK. Please check your environment variables.');
      }
    }
    db = admin.firestore();
  }
  return db;
}

export { getDb };
