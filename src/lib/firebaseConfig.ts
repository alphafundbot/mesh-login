import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { servicesConfig } from '@/config/servicesConfig';

const config = servicesConfig.firebase;

const app = getApps().length ? getApp() : initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
});

export const firebaseApp = app;
export const firestore = getFirestore(app);
export const auth = getAuth(app);
