
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { servicesConfig } from "@/config/services";

// Initialize Firebase with the validated, centralized configuration
const app = !getApps().length ? initializeApp(servicesConfig.firebase) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
