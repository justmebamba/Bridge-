
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initializeAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    // When running in a Google Cloud environment, the SDK automatically
    // discovers the credentials and project ID.
    // Ensure you are authenticated via `gcloud auth application-default login`
    // or `firebase login` in your terminal.
    const app = initializeApp();
    return app;
}

const adminApp = initializeAdminApp();
const db = getFirestore(adminApp);

export { adminApp, db };
