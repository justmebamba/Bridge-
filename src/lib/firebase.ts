
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
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

export { app, auth };
