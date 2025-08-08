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
    const value = process.env[variableName];
    if (!value) {
        console.warn(`Environment variable ${variableName} is not set.`);
        return "";
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
    gcp: {
        geminiApiKey: string;
    }
}

export const servicesConfig: ServicesConfig = {
    firebase: {
        apiKey: " ",
        authDomain: "stratagemai-xi7q8.firebaseapp.com",
        projectId: "stratagemai-xi7q8",
        storageBucket: "stratagemai-xi7q8.appspot.com",
        messagingSenderId: "405937962472",
        appId: "1:405937962472:web:a9d3a7c6b9e5d4a1a3b2c1",
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    gcp: {
        geminiApiKey: getEnv('GEMINI_API_KEY'),
    }
};
