
/**
 * @fileoverview Centralized configuration for all external services.
 * Loads credentials from environment variables and provides a typed object.
 * This is the single source of truth for all service configurations.
 */
import { config } from 'dotenv';
import { isBrowser } from '@/lib/env-check';

// Load variables from the single source of truth: .env
config({ path: '.env' });


/**
 * Returns the value of an environment variable.
 * Throws an error if the variable is not set on the server during build time.
 * Returns an empty string if called on the client for a server-only variable.
 * @param variableName The name of the environment variable.
 * @returns The value of the environment variable.
 */
function getEnv(variableName: string): string {
    const value = process.env[variableName];

    // On the server, variables are available during the build process.
    // If a variable is missing, it's a critical configuration error.
    if (typeof window === 'undefined' && !value) {
        const errorMessage = `FATAL ERROR: Environment variable ${variableName} is not set. This is required for server-side operations and build processes.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    // On the client, Next.js exposes env vars prefixed with NEXT_PUBLIC_.
    // If it's not a public var, it will be undefined.
    return value || '';
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

export interface GcpConfig {
    geminiApiKey: string;
}

export interface ServicesConfig {
    firebase: FirebaseConfig,
    gcp: GcpConfig
}

const firebaseConfigValues: FirebaseConfig = {
    apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
    measurementId: getEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID')
};

const gcpConfigValues: GcpConfig = {
    geminiApiKey: getEnv('GEMINI_API_KEY'),
}

export const servicesConfig: ServicesConfig = {
    firebase: firebaseConfigValues,
    gcp: gcpConfigValues
};
