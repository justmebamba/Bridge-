
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCmN-6p0WmwmYaqZhoonT8yOGqBdPtXd3M",
  authDomain: "studio-6068240579-e9698.firebaseapp.com",
  projectId: "studio-6068240579-e9698",
  storageBucket: "studio-6068240579-e9698.appspot.com",
  messagingSenderId: "263259542582",
  appId: "1:263259542582:web:ccb98565137c4f07bff497"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
