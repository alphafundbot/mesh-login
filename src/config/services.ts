/**
 * @fileoverview Centralized configuration for all external services.
 * Loads credentials from environment variables and provides a typed object.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

/**
 * Returns the value of an environment variable or a fallback if it's not set.
 * @param variableName The name of the environment variable.
 * @param fallbackValue An optional value to return if the environment variable is not found.
 * @returns The value of the environment variable or the fallback.
 */
function getEnv(variableName: string, fallbackValue: string = ""): string {
    const value = process.env[variableName];
    if (value) {
        return value;
    }
    if(fallbackValue) {
        return fallbackValue;
    }
    console.warn(`Environment variable ${variableName} is not set. You may need to create a .env.local file.`);
    return "";
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

const firebaseConfigValues = {
    apiKey: "YOUR_FIREBASE_API_KEY", // This is a public key, safe to hardcode
    authDomain: "stratagemai-xi7q8.firebaseapp.com",
    projectId: "stratagemai-xi7q8",
    storageBucket: "stratagemai-xi7q8.appspot.com",
    messagingSenderId: "405937962472",
    appId: "1:405937962472:web:a9d3a7c6b9e5d4a1a3b2c1",
};


export const servicesConfig: ServicesConfig = {
    firebase: firebaseConfigValues,
    gcp: {
        geminiApiKey: getEnv('GEMINI_API_KEY', firebaseConfigValues.apiKey),
    }
};
