import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function getDb(): admin.firestore.Firestore {
  if (!db) {
    if (!admin.apps.length) {
      try {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
          throw new Error('Missing Firebase Admin credentials. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.');
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error('Firebase admin initialization error:', error);
        // Throw an error that can be caught by the API route handler
        throw new Error('Could not initialize Firebase Admin SDK. Please check your environment variables.');
      }
    }
    db = admin.firestore();
  }
  return db;
}

export { getDb };
