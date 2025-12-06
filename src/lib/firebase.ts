import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMZoYZDYDctGpD07bKCDGWYtXG-S3AbyM",
  authDomain: "prompty-script.firebaseapp.com",
  projectId: "prompty-script",
  storageBucket: "prompty-script.firebasestorage.app",
  messagingSenderId: "382212639798",
  appId: "1:382212639798:web:71aedd3a5680877f05dc97",
  measurementId: "G-LPNJXERC4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only on client side and if supported)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
