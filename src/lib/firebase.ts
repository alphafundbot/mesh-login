// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { servicesConfig } from "@/config/services";

const firebaseConfig = servicesConfig.firebase;

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig as FirebaseOptions) : getApp();
const db = getFirestore(app);

export { app, db };
