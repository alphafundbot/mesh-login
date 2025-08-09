
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableNetwork, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { isBrowser } from './env-check';
import { servicesConfig } from '@/config/services';


const firebaseConfig = servicesConfig.firebase;

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (isBrowser()) {
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
