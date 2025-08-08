/**
 * @fileoverview Centralized configuration for all external services.
 * Loads credentials from environment variables and provides a typed object.
 */
import { config } from 'dotenv';

// Load variables from .env.local, which is not checked into source control.
// This is the primary way to provide secret keys to the application.
config({ path: '.env.local' });

// Also load variables from .env, which *is* checked into source control.
// This is used for non-secret configuration and as a template for .env.local.
config({ path: '.env' });

/**
 * Returns the value of an environment variable.
 * Throws an error if the variable is not set, unless a fallback is provided.
 * @param variableName The name of the environment variable.
 * @param fallbackValue An optional value to return if the environment variable is not found.
 * @returns The value of the environment variable or the fallback.
 */
function getEnv(variableName: string, fallbackValue?: string): string {
    const value = process.env[variableName];
    if (value !== undefined && value.trim() !== '') {
        return value;
    }
    if (fallbackValue !== undefined) {
        return fallbackValue;
    }
    // In a production environment, you would want to throw an error here.
    // For this demo, we'll log a warning and proceed.
    console.warn(`
        ================================================================================
        Warning: Environment variable ${variableName} is not set.
        Please create a .env.local file and add the following line:
        ${variableName}=YOUR_SECRET_KEY
        ================================================================================
    `);
    return '';
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
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "stratagemai-xi7q8.firebaseapp.com",
    projectId: "stratagemai-xi7q8",
    storageBucket: "stratagemai-xi7q8.appspot.com",
    messagingSenderId: "405937962472",
    appId: "1:405937962472:web:a9d3a7c6b9e5d4a1a3b2c1",
};

export const servicesConfig: ServicesConfig = {
    firebase: firebaseConfigValues,
    gcp: {
        // This will load the GEMINI_API_KEY from your .env.local file (priority) or .env file.
        // It is critical that you create a .env.local file for your private keys.
        geminiApiKey: getEnv('GEMINI_API_KEY'),
    }
};
