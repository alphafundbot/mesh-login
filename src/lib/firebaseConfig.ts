import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableNetwork, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Import the public Firebase configuration.
// This configuration is loaded from environment variables prefixed with NEXT_PUBLIC_,
// ensuring that sensitive keys are not hardcoded in the codebase.
// For more details on secure credential handling, refer to docs/security_best_practices.md.

import { isBrowser } from './env-check';
import { firebasePublicConfig } from '@/config/public';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;

// This check is crucial. It ensures that Firebase is only initialized
// when the necessary configuration is present.
if (isBrowser() && firebasePublicConfig.projectId) {
    app = getApps().length ? getApp() : initializeApp(firebasePublicConfig);
    firestore = getFirestore(app);
    auth = getAuth(app);
    enableNetwork(firestore).catch(() => {
        // This can be ignored. If network is already enabled, it will reject.
        // If it fails for other reasons, Firestore will retry on next operation.
    });
} else if (isBrowser()) {
    console.warn("Firebase config is missing. Firebase has not been initialized. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.");
}


// These exports may be undefined on the server, and that's by design.
// Components should use isBrowser() and useUser() to guard against this.
export { app as firebaseApp, firestore, auth };
