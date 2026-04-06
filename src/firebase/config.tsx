// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is for the Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXVa6nF8fozTowMl_myT9bZIeIjjWcZGY",
  authDomain: "judge-compiler-eea3b.firebaseapp.com",
  projectId: "judge-compiler-eea3b",
  storageBucket: "judge-compiler-eea3b.firebasestorage.app",
  messagingSenderId: "700935058244",
  appId: "1:700935058244:web:3fe9e2203c386ae39e1d11",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();