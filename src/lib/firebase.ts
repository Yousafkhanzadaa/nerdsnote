import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMZoYZDYDctGpD07bKCDGWYtXG-S3AbyM",
  authDomain: "prompty-script.firebaseapp.com",
  projectId: "prompty-script",
  storageBucket: "prompty-script.firebasestorage.app",
  messagingSenderId: "382212639798",
  appId: "1:382212639798:web:71aedd3a5680877f05dc97"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export { app };
