/**
 * @fileoverview Centralized configuration for all external services.
 * Loads credentials from environment variables and provides a typed object.
 */

/**
 * Returns the value of an environment variable or a placeholder if it's not set.
 * @param variableName The name of the environment variable.
 * @returns The value of the environment variable or a placeholder.
 */
function getEnv(variableName: string): string {
    return process.env[variableName] || "";
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
    gcp: {
        geminiApiKey: string;
    }
}

export const servicesConfig: ServicesConfig = {
    firebase: {
        apiKey: getEnv('FIREBASE_API_KEY'),
        authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
        projectId: getEnv('FIREBASE_PROJECT_ID'),
        storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnv('FIREBASE_APP_ID'),
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    gcp: {
        geminiApiKey: getEnv('GEMINI_API_KEY'),
    }
};
