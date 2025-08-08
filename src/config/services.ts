/**
 * @fileoverview Centralized configuration for all external services.
 * Loads credentials from environment variables and provides a typed object.
 */
import { config } from 'dotenv';

// Load variables from the single source of truth: .env
config();


/**
 * Returns the value of an environment variable.
 * Throws an error if the variable is not set.
 * @param variableName The name of the environment variable.
 * @returns The value of the environment variable.
 */
function getEnv(variableName: string): string {
    const value = process.env[variableName];
    if (value !== undefined && value.trim() !== '') {
        return value;
    }
    // For critical variables, we should fail fast if they're not set.
    throw new Error(`
        ================================================================================
        FATAL ERROR: Environment variable ${variableName} is not set in your .env file.
        Please ensure your .env file contains the following line:
        ${variableName}=YOUR_SECRET_KEY
        ================================================================================
    `);
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

// These are public-facing keys and are safe to be checked into source control.
const firebaseConfigValues: FirebaseConfig = {
    apiKey: "AIzaSyA_STrAgEmMaI-xi7q8_FIREBASE_WEB_API_KEY",
    authDomain: "stratagemai-xi7q8.firebaseapp.com",
    projectId: "stratagemai-xi7q8",
    storageBucket: "stratagemai-xi7q8.appspot.com",
    messagingSenderId: "405937962472",
    appId: "1:405937962472:web:a9d3a7c6b9e5d4a1a3b2c1",
};

export const servicesConfig: ServicesConfig = {
    firebase: firebaseConfigValues,
    gcp: {
        // This will load the GEMINI_API_KEY from your .env file.
        geminiApiKey: getEnv('GEMINI_API_KEY'),
    }
};
