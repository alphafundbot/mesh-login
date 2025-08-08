// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { servicesConfig } from "@/config/services";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: "stratagemai-xi7q8.firebaseapp.com",
  projectId: "stratagemai-xi7q8",
  storageBucket: "stratagemai-xi7q8.firebasestorage.app",
  messagingSenderId: "405937962472",
  appId: process.env.FIREBASE_APP_ID!,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig as FirebaseOptions) : getApp();
const db = getFirestore(app);

export { app, db };
