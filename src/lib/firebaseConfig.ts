import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableNetwork, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    auth = getAuth(app);
    enableNetwork(firestore).catch(() => {
        // This can be ignored. If network is already enabled, it will reject.
        // If it fails for other reasons, Firestore will retry on next operation.
    });
}

// These exports may be undefined on the server, and that's by design.
// Components should use isBrowser() and useUser() to guard against this.
export { app as firebaseApp, firestore, auth };
