// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { servicesConfig } from "@/config/services";

// Use the centralized configuration for Firebase.
// This ensures that all parts of the app use the same settings.
const firebaseConfig = servicesConfig.firebase as FirebaseOptions;

// Initialize Firebase using a singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
