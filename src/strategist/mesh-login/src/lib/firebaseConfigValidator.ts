// src/lib/firebaseConfigValidator.ts

import { logTelemetryEvent } from '@/monitoring/LoginTelemetry'; // Adjust path as necessary
import { firebasePublicConfig } from "../config/public";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function validateFirebaseConfig(config: FirebaseConfig): void {
  logTelemetryEvent('config:firebase_validation_start');

  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      logTelemetryEvent('config:firebase_validation_error', { metadata: { missingField: field } });
      throw new Error(`Firebase config error: "${field}" is missing or empty.`);
    }
  }

  logTelemetryEvent('config:firebase_validation_success');
}

// src/lib/firebaseConfigValidator.ts

import { firebasePublicConfig } from "../config/public";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function validateFirebaseConfig(config: FirebaseConfig): void {
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Firebase config error: "${field}" is missing or empty.`);
    }
  }
}

// Optional: You can call this function during application initialization
// to ensure config is valid before attempting to use Firebase.
// Example:
// import { validateFirebaseConfig } from './lib/firebaseConfigValidator';
// import { firebasePublicConfig } from './config/public';
//
// try {
//   validateFirebaseConfig(firebasePublicConfig);
//   console.log("Firebase configuration is valid.");
// } catch (error: any) {
//   console.error(error.message);
//   // Handle the error appropriately, e.g., disable Firebase features or show an error message
// }