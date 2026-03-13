import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAJW5RFiwDcDZa3Ry-XfG_dXFTYaqhijA",
  authDomain: "hama-459a8.firebaseapp.com",
  projectId: "hama-459a8",
  storageBucket: "hama-459a8.firebasestorage.app",
  messagingSenderId: "759253547932",
  appId: "1:759253547932:web:68f63c91b09c99461ce659",
  measurementId: "G-CY9N0MC543"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
