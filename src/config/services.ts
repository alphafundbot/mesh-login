/**
 * @fileoverview Centralized configuration for all external services.
 * Loads credentials from environment variables and provides a typed object.
 */
import { config } from 'dotenv';

// Load variables from the single source of truth: .env
config({ path: '.env' });


/**
 * Returns the value of an environment variable.
 * Throws an error if the variable is not set on the server.
 * Returns an empty string if not found on the client.
 * @param variableName The name of the environment variable.
 * @returns The value of the environment variable.
 */
function getEnv(variableName: string): string {
    // Check if running in a browser environment
    if (typeof window !== 'undefined') {
        // On the client, Next.js exposes env vars via process.env
        // If it's not there, return empty string to avoid crashing the app.
        return process.env[variableName] || '';
    }

    // On the server, we expect the variable to be loaded from .env
    const value = process.env[variableName];
    if (!value) {
        const errorMessage = `FATAL ERROR: Environment variable ${variableName} is not set. Please ensure it is defined in your .env file.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return value;
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

export interface ServicesConfig {
    firebase: FirebaseConfig,
    gcp: {}
}

// These are public-facing keys and are safe to be checked into source control.
const firebaseConfigValues: FirebaseConfig = {
    apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID')
};

export const servicesConfig: ServicesConfig = {
    firebase: firebaseConfigValues,
    gcp: {}
};
